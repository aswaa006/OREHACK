# Engine orchestrator — run_analysis() entry point.
#
# Improvements in this version:
# - FileIndex built once and shared across all analyzers (single directory walk).
# - AnalysisCache: unchanged files served from cache on repeat runs.
# - time.perf_counter() stage timers; timing_seconds included in the report.
# - LLM mode forwarded from config (fast / deep).

from __future__ import annotations

import json
import os
import sys
import time

from cache import AnalysisCache
from config import LLM_MODE, REPORT_DIR, SCORING_CRITERIA, save_scoring_criteria
from dependency_analyzer import build_dependency_graph, calculate_coupling
from duplication_analyzer import detect_duplication
from file_index import FileIndex
from file_inventory import FileInventory
from llm_engine import get_llm_feedback
from metrics_analyzer import analyze_repository
from repo_manager import cleanup_repository, clone_repository
from scoring_engine import compute_score
from structure_analyzer import analyze_structure


def _t(label: str, t0: float) -> float:
    elapsed = round(time.perf_counter() - t0, 2)
    print(f"      [{elapsed}s]")
    return elapsed


def run_analysis(repo_url: str, save_reports: bool = True, skip_llm: bool = False):
    from repo_manager import is_local_path

    _is_local  = is_local_path(repo_url)
    _skip_llm  = skip_llm
    path       = None
    inventory  = None
    timing     = {}

    try:
        # ── [1/8] Clone (skipped for local paths) ────────────────────────
        if _is_local:
            path = os.path.abspath(repo_url)
            print(f"\n[1/8] Using local directory: {path}")
            timing["clone"] = 0.0
        else:
            print(f"\n[1/8] Cloning repository: {repo_url} ...")
            t0   = time.perf_counter()
            path = clone_repository(repo_url)
            print(f"      Cloned to: {path}")
            timing["clone"] = _t("clone", t0)

        # ── [PRE] Single-pass file index & inventory ──────────────────────
        print("\n[PRE] Building file index ...")
        t0    = time.perf_counter()
        idx   = FileIndex(path)
        cache = AnalysisCache()
        print(f"      Total files         : {idx.total_files}")
        print(f"      Scored code files   : {idx.total_scored_files}")
        print(f"      Cache entries loaded: {cache.size}")
        timing["file_index"] = _t("file_index", t0)

        inventory = FileInventory(path)

        # ── [2/8] Structure ───────────────────────────────────────────────
        print("\n[2/8] Analyzing structure ...")
        t0        = time.perf_counter()
        structure = analyze_structure(idx)
        print(f"      Directories      : {structure['directory_count']}")
        print(f"      Total code files : {structure['total_code_files']}")
        print(f"      Total LOC        : {structure['total_loc']}")
        print(f"      Avg file LOC     : {structure['avg_file_loc']}")
        print(f"      Max file LOC     : {structure['max_file_loc']}")
        print(f"      LOC by language  : {structure['loc_by_language']}")
        timing["structure"] = _t("structure", t0)

        # ── [3/8] Metrics (parallel + cached) ────────────────────────────
        print("\n[3/8] Calculating code quality metrics ...")
        t0      = time.perf_counter()
        metrics = analyze_repository(idx, cache=cache)
        cache.save()

        for file_info in metrics.get("analyzed_files", []):
            full_path = os.path.join(path, file_info["file"])
            inventory.mark_analyzed(
                full_path,
                {
                    "language":        file_info.get("language", "other"),
                    "loc":             file_info.get("loc", 0),
                    "functions":       file_info.get("functions", 0),
                    "classes":         file_info.get("classes", 0),
                    "complexity":      file_info.get("complexity", 0.0),
                    "maintainability": file_info.get("maintainability", 0.0),
                    "comment_ratio":   file_info.get("comment_ratio", 0.0),
                    "risk_score":      file_info.get("risk_score", 0.0),
                    "todo_count":      file_info.get("todo_count", 0),
                },
            )

        print(f"      Functions          : {metrics['functions']}")
        print(f"      Classes            : {metrics['classes']}")
        print(f"      Avg complexity     : {metrics['avg_complexity']}")
        print(f"      Avg maintainability: {metrics['avg_maintainability']}")
        print(f"      Avg comment ratio  : {metrics['avg_comment_ratio']}")
        print(f"      Avg risk score     : {metrics['avg_risk_score']}")
        print(f"      Cache hits         : {metrics['cache_hits']}")
        print(f"      Language breakdown : {metrics['language_breakdown']}")
        print(f"      Files analyzed     : {metrics['num_files_analyzed']}")
        timing["metrics"] = _t("metrics", t0)

        # ── [4/8] Dependency graph ────────────────────────────────────────
        print("\n[4/8] Building dependency graph ...")
        t0    = time.perf_counter()
        graph = build_dependency_graph(idx)
        internal_nodes = [n for n in graph.nodes if not str(n).startswith("external:")]
        external_count = sum(
            len(v) for v in graph.graph.get("external_deps", {}).values()
        )
        print(f"      Internal nodes      : {len(internal_nodes)}")
        print(f"      Dependency edges    : {graph.number_of_edges()}")
        print(f"      External deps found : {external_count}")
        timing["dependency"] = _t("dependency", t0)

        # ── [5/8] Duplication ────────────────────────────────────────────
        print("\n[5/8] Detecting duplication ...")
        t0          = time.perf_counter()
        duplication = detect_duplication(idx)
        print(f"      Duplicate blocks : {duplication['duplicate_blocks']}")
        print(f"      Duplication rate : {duplication['duplication_rate'] * 100:.1f}%")
        timing["duplication"] = _t("duplication", t0)

        # ── [6/8] Score ───────────────────────────────────────────────────
        print("\n[6/8] Calculating modularity score ...")
        t0       = time.perf_counter()
        coupling = calculate_coupling(graph)
        score    = compute_score(
            metrics["avg_complexity"],
            coupling,
            duplication,
            maintainability=metrics.get("avg_maintainability", 50.0),
            comment_ratio=metrics.get("avg_comment_ratio", 0.0),
            risk_score=metrics.get("avg_risk_score", 0.0),
        )
        print(f"      Coupling         : {coupling}")
        print(f"      Modularity score : {score} / 100")
        timing["scoring"] = _t("scoring", t0)

        summary = {
            "structure":   structure,
            "metrics":     metrics,
            "coupling":    coupling,
            "duplication": duplication,
            "modularity_score": score,
            "advanced_flags": {
                "high_risk_files":  metrics.get("high_risk_files", []),
                "scoring_criteria": SCORING_CRITERIA,
            },
        }

        # ── [7+8/8] LLM feedback ─────────────────────────────────────────
        llm_feedback: dict | str
        if _skip_llm:
            print("\n[7/8] Skipping LLM step (--skip-llm flag set).")
            print("[8/8] Skipping.")
            llm_feedback = {"overall_summary": "LLM step skipped by user.", "error": "skipped"}
            timing["llm"] = 0.0
        else:
            print(f"\n[7/8] Sending metrics & source code to Ollama (mode={LLM_MODE}) ...")
            print("[8/8] Generating architectural feedback ...")
            t0 = time.perf_counter()
            try:
                llm_feedback = get_llm_feedback(summary, repo_path=path, mode=LLM_MODE)
            except Exception as exc:  # noqa: BLE001
                print(f"      [WARNING] LLM step failed: {exc}")
                llm_feedback = {"error": str(exc), "overall_summary": "LLM step failed."}
            timing["llm"] = _t("llm", t0)

            # Warn if Ollama was offline.
            if isinstance(llm_feedback, dict) and llm_feedback.get("error"):
                print(f"      [WARNING] {llm_feedback['error']}")

        # ── [VERIFY] Completeness ────────────────────────────────────────
        print("\n[VERIFY] Cross-checking analysis completeness ...")
        completeness = inventory.verify_completeness()
        print(f"      {completeness['message']}")
        print(f"      Code files analyzed: {completeness['analyzed']}/{completeness['total_code_files']}")

        timing["total"] = round(sum(v for v in timing.values()), 2)
        summary["timing_seconds"] = timing

        # ── Save reports ─────────────────────────────────────────────────
        if save_reports:
            print("\n[SAVE] Saving detailed reports ...")
            inventory_file = inventory.save_to_json()
            print(f"      Inventory : {inventory_file}")

            criteria_file = os.path.join(REPORT_DIR, "scoring_criteria.json")
            save_scoring_criteria(criteria_file)
            print(f"      Criteria  : {criteria_file}")

            report_file = os.path.join(REPORT_DIR, "analysis_report.json")
            full_report = {
                "repo_url":              repo_url,
                "analysis":              summary,
                "llm_feedback":          llm_feedback,
                "inventory_summary":     inventory.inventory["summary"],
                "completeness_check":    completeness,
                "scoring_criteria_used": SCORING_CRITERIA,
            }
            with open(report_file, "w", encoding="utf-8") as f:
                json.dump(full_report, f, indent=2, default=str)
            print(f"      Report    : {report_file}")

        return summary, llm_feedback, inventory, completeness

    finally:
        if path and not _is_local:
            print("\n      Cleaning up cloned repository ...")
            cleanup_repository(path)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Code Modularity Engine — analyse a GitHub repo or local directory."
    )
    parser.add_argument(
        "repo",
        nargs="?",
        help="GitHub repo URL or local directory path.",
    )
    parser.add_argument(
        "--skip-llm",
        action="store_true",
        help="Skip the Ollama LLM step (useful offline or for fast testing).",
    )
    parser.add_argument(
        "--no-save",
        action="store_true",
        help="Do not write reports to disk.",
    )
    args = parser.parse_args()

    repo = args.repo
    if not repo:
        repo = input("Enter GitHub repo URL or local path: ").strip()
    if not repo:
        print("Error: no URL or path provided.")
        sys.exit(1)

    summary, feedback, inventory, completeness = run_analysis(
        repo,
        save_reports=not args.no_save,
        skip_llm=args.skip_llm,
    )

    print("\n" + "=" * 70)
    print("  STRUCTURED METRICS")
    print("=" * 70)
    print(json.dumps(summary, indent=2, default=str))

    print("\n" + "=" * 70)
    print("  LLM ARCHITECTURAL REVIEW")
    print("=" * 70)
    if isinstance(feedback, dict):
        print(json.dumps(feedback, indent=2))
    else:
        print(feedback)

    print("\n" + "=" * 70)
    print("  FILE INVENTORY & COMPLETENESS")
    print("=" * 70)
    print(inventory)

    print("\nAnalysis complete. Reports saved to:", REPORT_DIR)
