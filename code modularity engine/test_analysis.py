#!/usr/bin/env python3
"""Test script to verify the analysis engine works end-to-end."""

import json
import sys
from main import run_analysis

if __name__ == "__main__":
    # Accept a local path or URL from the command line for offline testing.
    # Defaults to the local engine directory itself so the test always works.
    repo_url = sys.argv[1] if len(sys.argv) > 1 else "."
    skip_llm = "--skip-llm" in sys.argv
    print(f"Testing analysis on: {repo_url}  (skip_llm={skip_llm})\n")

    summary, feedback, inventory, completeness = run_analysis(
        repo_url, save_reports=True, skip_llm=skip_llm
    )
    
    print("\n" + "=" * 70)
    print("  STRUCTURED METRICS")
    print("=" * 70)
    print(json.dumps(summary, indent=2))
    
    print("\n" + "=" * 70)
    print("  LLM ARCHITECTURAL REVIEW")
    print("=" * 70)
    if isinstance(feedback, dict):
        print(json.dumps(feedback, indent=2))
    else:
        print(feedback)
    
    print("\n" + "=" * 70)
    print("  FILE INVENTORY & COMPLETENESS CHECK")
    print("=" * 70)
    print(inventory)
    print(f"\n✅ Completeness Summary:")
    print(f"   Total code files found: {completeness['total_code_files']}")
    print(f"   Files successfully analyzed: {completeness['analyzed']}")
    print(f"   Analysis complete: {completeness['complete']}")
    print(f"   Message: {completeness['message']}")

