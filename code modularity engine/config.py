import json
import os
from dotenv import load_dotenv

load_dotenv()

# -- helpers ------------------------------------------------------------------
def _e_float(k, d): return float(os.getenv(k, d))
def _e_int(k, d):   return int(os.getenv(k, d))
def _e_bool(k, d):
    v = os.getenv(k)
    return d if v is None else v.strip().lower() in {"1", "true", "yes", "y", "on"}
def _e_list(k, d):  return [s.strip() for s in os.getenv(k, d).split(",") if s.strip()]

# -- core ---------------------------------------------------------------------
EXCLUDED_DIRS = set(_e_list(
    "EXCLUDED_DIRS",
    ".git,__pycache__,venv,node_modules,build,dist,.next,.cache,temp_repo,.tox,.eggs",
))
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

# -- LLM behaviour ------------------------------------------------------------
MAX_FILE_LINES          = _e_int("MAX_FILE_LINES", 300)
MAX_CODE_CHARS          = _e_int("MAX_CODE_CHARS", 12000)
LLM_MODE                = os.getenv("LLM_MODE", "fast")   # "fast" | "deep"
MAX_LLM_FILES_PER_LANG  = _e_int("MAX_LLM_FILES_PER_LANG", 3)

# -- runtime tuning -----------------------------------------------------------
MAX_PARALLEL_WORKERS = _e_int("MAX_PARALLEL_WORKERS", 4)
CACHE_ENABLED        = _e_bool("CACHE_ENABLED", True)

# -- scoring criteria (configurable via env or JSON) --------------------------
SCORING_CRITERIA = {
    "complexity_weight":    _e_float("COMPLEXITY_WEIGHT",    2.0),
    "coupling_weight":      _e_float("COUPLING_WEIGHT",      1.5),
    "duplication_weight":   _e_float("DUPLICATION_WEIGHT",   3.0),
    "min_modularity_score": _e_float("MIN_MODULARITY_SCORE", 60.0),
    "min_maintainability":  _e_float("MIN_MAINTAINABILITY",  40.0),
    "max_complexity":       _e_float("MAX_COMPLEXITY",       10.0),
    "max_coupling":         _e_float("MAX_COUPLING",         12.0),
    "min_comment_ratio":    _e_float("MIN_COMMENT_RATIO",    0.05),
}

# Shorthand aliases kept for backwards compatibility.
COMPLEXITY_WEIGHT  = SCORING_CRITERIA["complexity_weight"]
COUPLING_WEIGHT    = SCORING_CRITERIA["coupling_weight"]
DUPLICATION_WEIGHT = SCORING_CRITERIA["duplication_weight"]

# -- extensions ---------------------------------------------------------------
CODE_EXTENSIONS = {
    ".py",
    ".js", ".jsx", ".ts", ".tsx",
    ".html", ".htm", ".css", ".scss", ".sass", ".less",
    ".java", ".kt", ".go", ".rs", ".rb", ".php",
    ".c", ".cpp", ".h", ".hpp", ".cs",
    ".swift", ".m",
    ".json", ".yaml", ".yml", ".toml",
    ".sh", ".bash", ".ps1",
    ".md", ".xml",
}

# Documentation extensions: tracked in inventory but NOT scored.
DOCS_EXTENSIONS = {".md", ".txt", ".rst", ".xml"}

# Extensions that drive scoring (code minus pure docs).
SCORED_EXTENSIONS = CODE_EXTENSIONS - DOCS_EXTENSIONS

# -- paths --------------------------------------------------------------------
CONFIG_DIR = os.path.dirname(os.path.abspath(__file__))
REPORT_DIR = os.path.join(CONFIG_DIR, "reports")
CACHE_FILE = os.path.join(REPORT_DIR, "analysis_cache.json")
os.makedirs(REPORT_DIR, exist_ok=True)


# -- helpers ------------------------------------------------------------------
def load_custom_criteria(criteria_file: str) -> dict:
    """Load custom scoring criteria from a JSON file."""
    try:
        with open(criteria_file, "r", encoding="utf-8") as f:
            SCORING_CRITERIA.update(json.load(f))
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        pass
    return SCORING_CRITERIA


def save_scoring_criteria(criteria_file: str) -> None:
    """Persist current scoring criteria to a JSON file."""
    os.makedirs(os.path.dirname(criteria_file), exist_ok=True)
    with open(criteria_file, "w", encoding="utf-8") as f:
        json.dump(SCORING_CRITERIA, f, indent=2)
