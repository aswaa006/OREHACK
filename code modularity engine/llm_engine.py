# LLM engine — Ollama-backed architectural review.
#
# Improvements in this version:
# - fast mode: sample top-N files per language by risk score (quick feedback).
# - deep mode: include all code up to MAX_CODE_CHARS (thorough review).
# - _extract_json_from_response(): pulls the first valid JSON object out of
#   model output even when surrounded by prose.
# - Risk-based file sampling so the most problematic code is reviewed first.

from __future__ import annotations

import json
import os
import re

import ollama

from config import (
    CODE_EXTENSIONS, DOCS_EXTENSIONS, EXCLUDED_DIRS,
    LLM_MODE, MAX_CODE_CHARS, MAX_FILE_LINES, MAX_LLM_FILES_PER_LANG,
    OLLAMA_MODEL,
)

# JSON extraction: match outermost { ... } spanning multiple lines.
_RE_JSON_OBJECT = re.compile(r"\{.*\}", re.DOTALL)


def _extract_json_from_response(text: str) -> dict | str:
    if not text:
        return text
    m = _RE_JSON_OBJECT.search(text)
    if m:
        candidate = m.group(0)
        # Walk inward if there are extra characters after the last }
        # by trying to decode progressively shorter slices.
        for end in range(len(candidate), 0, -1):
            try:
                return json.loads(candidate[:end])
            except json.JSONDecodeError:
                continue
    # Fallback: return raw string so callers can still display it.
    return text


def _select_files_for_llm(
    analyzed_files: list[dict],
    mode: str,
    max_per_lang: int,
) -> list[dict]:
    if mode == "deep":
        return analyzed_files

    # fast mode: up to max_per_lang highest-risk files per language.
    by_lang: dict[str, list[dict]] = {}
    for f in analyzed_files:
        lang = f.get("language", "other")
        by_lang.setdefault(lang, []).append(f)

    selected = []
    for lang_files in by_lang.values():
        top = sorted(lang_files, key=lambda x: x.get("risk_score", 0.0), reverse=True)
        selected.extend(top[:max_per_lang])

    return selected


def _collect_code_snippets(
    repo_path: str,
    analyzed_files: list[dict] | None = None,
    mode: str = "fast",
) -> str:
    # When analyzed_files is supplied use the pre-selected subset (fast mode).
    # Otherwise fall back to a full directory walk (deep / legacy behaviour).
    snippets: list[str] = []
    total_chars = 0

    if analyzed_files is not None:
        selected = _select_files_for_llm(analyzed_files, mode, MAX_LLM_FILES_PER_LANG)
        file_iter = sorted(
            ((f["file"], os.path.join(repo_path, f["file"])) for f in selected),
            key=lambda x: x[0],
        )
    else:
        file_iter = []
        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            for fname in sorted(files):
                ext = os.path.splitext(fname)[1].lower()
                if ext in CODE_EXTENSIONS and ext not in DOCS_EXTENSIONS:
                    fpath = os.path.join(root, fname)
                    rel = os.path.relpath(fpath, repo_path).replace("\\", "/")
                    file_iter.append((rel, fpath))

    for rel, fpath in file_iter:
        if not os.path.isfile(fpath):
            continue
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                lines = f.readlines()
        except OSError:
            continue

        truncated = lines[:MAX_FILE_LINES]
        content   = "".join(truncated).strip()
        if not content:
            continue

        note  = f" (truncated to {MAX_FILE_LINES} lines)" if len(lines) > MAX_FILE_LINES else ""
        block = f"### {rel}{note}\n```\n{content}\n```\n"

        if total_chars + len(block) > MAX_CODE_CHARS:
            remaining = MAX_CODE_CHARS - total_chars
            if remaining > 200:
                snippets.append(block[:remaining] + "\n... [truncated]\n")
            break

        snippets.append(block)
        total_chars += len(block)

    return "\n".join(snippets) if snippets else "(no source code files found)"


def get_llm_feedback(
    metrics_summary: dict,
    repo_path: str | None = None,
    mode: str | None = None,
) -> str:
    if mode is None:
        mode = LLM_MODE

    code_section = ""
    if repo_path and os.path.isdir(repo_path):
        print(f"      Reading source files for Ollama (mode={mode}) ...")
        analyzed_files = metrics_summary.get("metrics", {}).get("analyzed_files")
        code_section = _collect_code_snippets(repo_path, analyzed_files, mode)

    prompt = f"""You are a senior software architect performing a full code modularity review.

## Computed Metrics
```json
{json.dumps(metrics_summary, indent=2, default=str)}
```

## Source Code
{code_section}

## Your Task
Analyse the above code and metrics. Return ONLY valid JSON in this exact schema:
{{
  "modularity_score":        <0-10 float>,
  "code_quality_score":      <0-10 float>,
  "language_detected":       "<primary language>",
  "coupling_analysis":       "<paragraph>",
  "separation_of_concerns":  "<paragraph>",
  "code_duplication":        "<paragraph>",
  "strengths":               ["..."],
  "weaknesses":              ["..."],
  "refactoring_suggestions": ["..."],
  "overall_summary":         "<2-3 sentence summary>"
}}

Do NOT include prose outside the JSON object."""

    try:
        response = ollama.chat(
            model=OLLAMA_MODEL,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = response["message"]["content"]
        return _extract_json_from_response(raw)
    except Exception as exc:  # noqa: BLE001
        err = str(exc)
        # Distinguish "Ollama not running" from real errors so callers can warn clearly.
        offline = any(kw in err.lower() for kw in ["connection refused", "connect", "socket", "ollama"])
        return {
            "error": "Ollama unavailable" if offline else f"LLM error: {err[:200]}",
            "modularity_score": None,
            "code_quality_score": None,
            "language_detected": None,
            "coupling_analysis": "(skipped — LLM offline)",
            "separation_of_concerns": "(skipped — LLM offline)",
            "code_duplication": "(skipped — LLM offline)",
            "strengths": [],
            "weaknesses": [],
            "refactoring_suggestions": [],
            "overall_summary": "LLM feedback unavailable. Check that Ollama is running: 'ollama serve'.",
        }
