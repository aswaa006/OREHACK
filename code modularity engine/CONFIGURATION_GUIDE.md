# Code Modularity Engine - Configuration & Customization Guide

## Overview

The Code Modularity Engine now provides **configurable, non-hardcoded scoring criteria** and **complete file inventory tracking** for reproducibility and transparency.

## 1. Scoring Criteria Configuration

### Default Values

The engine uses these default scoring criteria (defined in `config.py`):

```python
SCORING_CRITERIA = {
    "complexity_weight": 2.0,      # Penalizes complex functions (higher = stricter)
    "coupling_weight": 1.5,        # Penalizes interdependencies
    "duplication_weight": 3.0,     # Penalizes code duplication (highest weight)  
    "min_modularity_score": 60.0,  # Minimum acceptable modularity (0-100)
    "min_maintainability": 40.0,   # Minimum acceptable maintainability
    "max_complexity": 10.0,        # Max cyclomatic complexity per function
}
```

### Customizing Criteria

#### Option 1: Environment Variables

Set environment variables in `.env`:

```bash
COMPLEXITY_WEIGHT=3.0
COUPLING_WEIGHT=2.0
DUPLICATION_WEIGHT=4.0
MIN_MODULARITY_SCORE=75.0
MIN_MAINTAINABILITY=60.0
MAX_COMPLEXITY=5.0
```

#### Option 2: Custom JSON File

Create `reports/custom_criteria.json`:

```json
{
  "complexity_weight": 3.0,
  "coupling_weight": 2.0,
  "duplication_weight": 4.0,
  "min_modularity_score": 75.0,
  "min_maintainability": 60.0,
  "max_complexity": 5.0
}
```

Load it in your analysis script:

```python
from config import load_custom_criteria

load_custom_criteria("reports/custom_criteria.json")
```

#### Option 3: Programmatically

```python
from config import SCORING_CRITERIA, save_scoring_criteria

# Modify criteria
SCORING_CRITERIA["complexity_weight"] = 3.0
SCORING_CRITERIA["max_complexity"] = 5.0

# Save for reproducibility
save_scoring_criteria("reports/my_criteria.json")
```

### Tuning Guide

| Scenario | Recommendations |
|----------|-----------------|
| **Strict Standards** | `complexity: 3.0`, `duplication: 4.0`, `min_score: 75.0` |
| **Lenient Standards** | `complexity: 1.0`, `duplication: 2.0`, `min_score: 50.0` |
| **Emphasis on Duplication** | `duplication_weight: 5.0` |
| **Emphasis on Coupling** | `coupling_weight: 3.0` |
| **High-Complexity Codebases** | `max_complexity: 15.0`, `complexity_weight: 1.0` |

## 2. File Inventory & Completeness Checking

### What Gets Tracked

The `FileInventory` class automatically:

1. **Scans** all files in the repository
2. **Identifies** which files are code files (based on extension)
3. **Tracks** analysis status for each file:
   - `pending`  - Not yet analyzed
   - `analyzed` - Successfully analyzed
   - `skipped`  - Not a code file
   - `failed`   - Analysis encountered an error

4. **Cross-checks** that all code files are analyzed
5. **Generates** JSON reports for reproducibility

### Sample Inventory Report

After running analysis:

```
╔════════════════════════════════════════════════════════╗
║           FILE INVENTORY & ANALYSIS REPORT              ║
╚════════════════════════════════════════════════════════╝

Repository: /tmp/repo_xyz
Timestamp:  2024-01-15T10:30:45.123456

SUMMARY:
  Total files found:      247
  Files analyzed:         45
  Files skipped:          198 (docs, assets, etc.)
  Files failed:           4
  Coverage:               91.84%

COMPLETENESS CHECK:
  Code files total:       49
  Code files analyzed:    45
  Code files failed:      4
  Code files missing:     0
  
  Status: ✅ COMPLETE
  All code files analyzed successfully
```

### Output Locations

All reports are saved to `code modularity engine/reports/`:

| File | Purpose |
|------|---------|
| `inventory_TIMESTAMP.json` | Complete file listing and metrics |
| `scoring_criteria.json` | Criteria used for this analysis |
| `analysis_report.json` | Combined report with metrics + LLM feedback |

### JSON Structure Example

`inventory_TIMESTAMP.json`:

```json
{
  "repo_path": "/tmp/repo_abc",
  "timestamp": "2024-01-15T10:30:45.123456",
  "files": {
    "src/main.py": {
      "filename": "main.py",
      "extension": ".py",
      "is_code_file": true,
      "status": "analyzed",
      "metrics": {
        "functions": 12,
        "classes": 3,
        "complexity": 8.5,
        "maintainability": 72.3,
        "comment_ratio": 0.15
      }
    },
    "README.md": {
      "filename": "README.md",
      "extension": ".md",
      "is_code_file": true,
      "status": "skipped",
      "error": "Not a code file"
    }
  },
  "summary": {
    "total_files": 247,
    "analyzed_files": 45,
    "skipped_files": 198,
    "failed_files": 4,
    "coverage_percent": 91.84
  }
}
```

## 3. API Usage Examples

### Using FastAPI Endpoint

```bash
# Request
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{"repo_url": "https://github.com/example/repo"}'

# Response includes inventory & completeness
{
  "repo_url": "https://github.com/example/repo",
  "analysis": {...},
  "llm_feedback": {...},
  "inventory_summary": {
    "total_files": 247,
    "analyzed_files": 45,
    "coverage_percent": 91.84
  },
  "file_coverage": {
    "total_code_files": 49,
    "analyzed": 45,
    "failed": 4,
    "missing": 0,
    "complete": false
  },
  "completeness_message": "Warning: 4 code files not analyzed"
}
```

### Using Direct Python

```python
from code_modularity_engine.main import run_analysis

# Returns 4-tuple
summary, feedback, inventory, completeness = run_analysis(
    "https://github.com/example/repo",
    save_reports=True
)

# Check completeness
print(f"Code files analyzed: {completeness['analyzed']}/{completeness['total_code_files']}")
print(f"All complete: {completeness['complete']}")

# Save custom criteria used
inventory.inventory["scoring_criteria_used"] = SCORING_CRITERIA
```

## 4. Reproducibility Workflow

1. **Run analysis with default criteria**:
   ```bash
   python test_analysis.py
   ```

2. **Check reports**:
   ```bash
   ls -l reports/
   # see: inventory_TIMESTAMP.json, analysis_report.json, scoring_criteria.json
   ```

3. **Modify criteria** (`reports/scoring_criteria.json`) and **re-run**:
   ```python
   from config import load_custom_criteria
   load_custom_criteria("reports/scoring_criteria.json")
   summary, feedback, inventory, completeness = run_analysis(repo_url)
   ```

4. **Compare results** across different criteria configurations

## 5. Supported Code Extensions

The engine analyzes **40+ file types**:

- **Python**: `.py`
- **Web**: `.html`, `.htm`, `.css`, `.scss`, `.sass`, `.less`
- **JavaScript/TypeScript**: `.js`, `.jsx`, `.ts`, `.tsx`
- **Backend**: `.java`, `.kt`, `.go`, `.rs`, `.rb`, `.php`, `.cs`, `.swift`
- **Config**: `.json`, `.yaml`, `.yml`, `.toml`, `.xml`
- **Shell**: `.sh`, `.bash`, `.ps1`
- **Markup**: `.md`
- **C/C++**: `.c`, `.cpp`, `.h`, `.hpp`
- **And more**...

## 6. Troubleshooting

### "Warning: X code files not analyzed"

Check `reports/analysis_report.json` for `failed_files`:

```json
"completeness_check": {
  "total_code_files": 49,
  "analyzed": 45,
  "failed_files": ["src/legacy.js", "lib/deprecated.py"],
  "complete": false
}
```

**Common causes**:
- Syntax errors in source files (fix and re-run)
- Very large files (increase `MAX_FILE_LINES` in `.env`)
- Unsupported language features

### Criteria Not Applied

1. Check `.env` file exists
2. Verify env vars are loaded: `from config import SCORING_CRITERIA; print(SCORING_CRITERIA)`
3. Or use `load_custom_criteria()` explicitly

### Inventory Not Saved

Ensure `save_reports=True` when calling `run_analysis()`:

```python
summary, feedback, inventory, completeness = run_analysis(repo_url, save_reports=True)
```

Reports directory will be created automatically in `code modularity engine/reports/`.

