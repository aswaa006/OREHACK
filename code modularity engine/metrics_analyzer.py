# Metrics analyzer.
#
# Improvements in this version:
# - All regex patterns compiled at module level (no re-compilation per call).
# - Per-file analysis runs in a ThreadPoolExecutor for parallelism.
# - AnalysisCache integration: unchanged files served from JSON cache.
# - Accepts a FileIndex (from file_index.py) OR a plain repo_path string.
# - DOCS_EXTENSIONS files excluded from scoring aggregates.

from __future__ import annotations

import os
import re
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import TYPE_CHECKING

from config import CODE_EXTENSIONS, DOCS_EXTENSIONS, EXCLUDED_DIRS, MAX_PARALLEL_WORKERS

if TYPE_CHECKING:
    from cache import AnalysisCache
    from file_index import FileIndex, FileEntry

try:
    import ast as _ast
    from radon.complexity import cc_visit
    from radon.metrics import mi_visit
    _PYTHON_TOOLS = True
except ImportError:
    _PYTHON_TOOLS = False

# ---------------------------------------------------------------------------
# Pre-compiled regex (module-level — compiled once on import)
# ---------------------------------------------------------------------------
_RE_TODO     = re.compile(r"\b(TODO|FIXME|HACK|XXX)\b", re.IGNORECASE)
_RE_CTRL     = re.compile(
    r"\b(if|else|elif|for|while|switch|case|catch|try|except|&&|\|\||\?)\b"
)

# HTML
_RE_HTML_TAG   = re.compile(r"<(\w+)[\s>]", re.IGNORECASE)
_RE_HTML_CLOSE = re.compile(r"</?([a-zA-Z0-9]+)[^>]*>")
_RE_A11Y       = re.compile(r"\baria-|\balt=|\blabel\b|\brole=", re.IGNORECASE)
_RE_SCRIPT_TAG = re.compile(r"<script[^>]*>", re.IGNORECASE)
_RE_STYLE_TAG  = re.compile(r"<style[^>]*>", re.IGNORECASE)
_RE_FORM_TAG   = re.compile(r"<form[\s>]", re.IGNORECASE)

# CSS
_RE_MEDIA      = re.compile(r"@media\b", re.IGNORECASE)
_RE_DECL       = re.compile(r":\s*[^;]+;")
_RE_VENDOR     = re.compile(r"-webkit-|-moz-|-ms-|-o-")
_RE_IMPORTANT  = re.compile(r"!important", re.IGNORECASE)
_RE_ID_SEL     = re.compile(r"#[a-zA-Z_][\w-]*")

# JS / TS
_RE_JS_CLASS   = re.compile(r"\bclass\s+\w+")
_RE_JS_ASYNC   = re.compile(r"\basync\b")
_RE_JS_IMPORT  = re.compile(r"\bimport\b|\brequire\s*\(")
_RE_JS_EXPORT  = re.compile(r"\bexport\b")
_RE_JS_PROMISE = re.compile(r"\bPromise\b|\.then\s*\(|\.catch\s*\(")
_RE_JS_EVENT   = re.compile(r"addEventListener\s*\(|on\w+\s*=")
_RE_JS_FUNC    = re.compile(
    r"\bfunction\s+\w+|\bconst\s+\w+\s*=\s*\(|\blet\s+\w+\s*=\s*\(|=>"
)

# Python fallback (when radon/ast unavailable)
_RE_PY_DEF   = re.compile(r"^\s*def\s+\w+", re.MULTILINE)
_RE_PY_CLASS = re.compile(r"^\s*class\s+\w+", re.MULTILINE)

# Comment prefixes by extension
_COMMENT_PREFIXES: dict[str, tuple[str, ...]] = {
    ".py":   ("#",),  ".sh":  ("#",),  ".bash": ("#",),
    ".yaml": ("#",),  ".yml": ("#",),  ".toml": ("#",),
    ".js":   ("//",), ".jsx": ("//",), ".ts":   ("//",), ".tsx": ("//",),
    ".java": ("//",), ".kt":  ("//",), ".go":   ("//",), ".rs":  ("//",),
    ".c":    ("//",), ".cpp": ("//",), ".h":    ("//",), ".hpp": ("//",),
    ".cs":   ("//",), ".swift": ("//",),
    ".php":  ("//", "#"),
    ".rb":   ("#",),
}

# ---------------------------------------------------------------------------
# Language detection
# ---------------------------------------------------------------------------

def _detect_language(ext: str) -> str:
    if ext == ".py":                                    return "python"
    if ext in (".js", ".jsx", ".ts", ".tsx"):           return "javascript"
    if ext in (".html", ".htm"):                        return "html"
    if ext in (".css", ".scss", ".sass", ".less"):      return "css"
    if ext in (".json", ".yaml", ".yml", ".toml"):      return "config"
    if ext == ".xml":                                   return "xml"
    if ext == ".md":                                    return "markup"
    return "other"

# ---------------------------------------------------------------------------
# Comment counting
# ---------------------------------------------------------------------------

def _count_comments(lines: list[str], ext: str) -> int:
    prefixes = _COMMENT_PREFIXES.get(ext, ())
    count = 0
    for raw in lines:
        s = raw.strip()
        if not s:
            continue
        if prefixes and any(s.startswith(p) for p in prefixes):
            count += 1
        elif ext in (".html", ".htm") and "<!--" in s:
            count += 1
        elif ext in (".css", ".scss", ".sass", ".less") and s.startswith("/*"):
            count += 1
    return count

# ---------------------------------------------------------------------------
# Generic complexity
# ---------------------------------------------------------------------------

def _generic_complexity_estimate(code: str) -> float:
    ctl = len(_RE_CTRL.findall(code))
    nesting = code.count("{") + code.count("(")
    return round(min(1.0 + ctl * 0.12 + nesting * 0.01, 30.0), 2)

# ---------------------------------------------------------------------------
# Language-specific analyzers
# ---------------------------------------------------------------------------

def _analyze_html(code: str) -> dict:
    elements = _RE_HTML_TAG.findall(code)
    el_counts = Counter(e.lower() for e in elements)
    semantic = sum(
        1 for e in ["header", "nav", "main", "article", "section", "footer", "aside"]
        if el_counts.get(e, 0) > 0
    )
    depth = max_depth = 0
    for m in _RE_HTML_CLOSE.finditer(code):
        if m.group(0).startswith("</"):
            depth = max(0, depth - 1)
        elif not m.group(0).endswith("/>"):
            depth += 1
            max_depth = max(max_depth, depth)
    return {
        "elements": len(el_counts),
        "semantic": semantic,
        "max_depth": max_depth,
        "a11y_attrs": len(_RE_A11Y.findall(code)),
        "total_tags": len(elements),
        "inline_scripts": len(_RE_SCRIPT_TAG.findall(code)),
        "inline_styles": len(_RE_STYLE_TAG.findall(code)),
        "forms": len(_RE_FORM_TAG.findall(code)),
    }


def _analyze_css(code: str) -> dict:
    selectors = [l.strip() for l in code.split("{")[:-1] if l.strip()]
    complex_count = sum(
        1 for s in selectors
        if any(c in s for c in [">", "+", "~", "::", ":not("])
    )
    return {
        "selectors": len(selectors),
        "complex_selectors": complex_count,
        "media_queries": len(_RE_MEDIA.findall(code)),
        "declarations": len(_RE_DECL.findall(code)),
        "vendor_prefixes": len(_RE_VENDOR.findall(code)),
        "important_count": len(_RE_IMPORTANT.findall(code)),
        "id_selectors": len(_RE_ID_SEL.findall("\n".join(selectors))),
    }


def _analyze_js(code: str) -> dict:
    return {
        "functions":      len(_RE_JS_FUNC.findall(code)),
        "classes":        len(_RE_JS_CLASS.findall(code)),
        "async_functions":len(_RE_JS_ASYNC.findall(code)),
        "imports":        len(_RE_JS_IMPORT.findall(code)),
        "exports":        len(_RE_JS_EXPORT.findall(code)),
        "promises":       len(_RE_JS_PROMISE.findall(code)),
        "event_handlers": len(_RE_JS_EVENT.findall(code)),
    }


def _analyze_python(code: str) -> dict:
    if not _PYTHON_TOOLS:
        return {
            "functions": len(_RE_PY_DEF.findall(code)),
            "classes":   len(_RE_PY_CLASS.findall(code)),
            "complexity": 1.0,
            "maintainability": 50.0,
        }
    try:
        tree = _ast.parse(code)
        funcs = sum(
            1 for n in _ast.walk(tree)
            if isinstance(n, (_ast.FunctionDef, _ast.AsyncFunctionDef))
        )
        classes = sum(1 for n in _ast.walk(tree) if isinstance(n, _ast.ClassDef))
        cc = cc_visit(code)
        complexity = sum(c.complexity for c in cc) / len(cc) if cc else 1.0
        mi = mi_visit(code, True)
        return {
            "functions":       funcs,
            "classes":         classes,
            "complexity":      round(complexity, 2),
            "maintainability": round(mi, 2),
        }
    except Exception:
        return {"functions": 0, "classes": 0, "complexity": 1.0, "maintainability": 50.0}

# ---------------------------------------------------------------------------
# Per-file analysis (public)
# ---------------------------------------------------------------------------

def analyze_file(file_path: str) -> tuple:
    ext      = os.path.splitext(file_path)[1].lower()
    language = _detect_language(ext)

    with open(file_path, "r", encoding="utf-8", errors="ignore") as fh:
        code = fh.read()

    lines         = code.split("\n")
    loc           = len([l for l in lines if l.strip()])
    blank_lines   = len([l for l in lines if not l.strip()])
    comment_lines = _count_comments(lines, ext)
    long_lines    = len([l for l in lines if len(l) > 120])
    todo_count    = len(_RE_TODO.findall(code))

    comment_ratio   = round(comment_lines / loc, 3) if loc else 0.0
    long_line_ratio = round(long_lines / max(1, len(lines)), 3)

    metrics: dict = {
        "language":       language,
        "loc":            loc,
        "blank_lines":    blank_lines,
        "comments":       comment_lines,
        "comment_ratio":  comment_ratio,
        "long_lines":     long_lines,
        "long_line_ratio":long_line_ratio,
        "todo_count":     todo_count,
    }

    if ext == ".py":
        py = _analyze_python(code)
        metrics.update(py)
        complexity      = py.get("complexity", 1.0)
        maintainability = py.get("maintainability", 50.0)
    elif ext in (".html", ".htm"):
        h = _analyze_html(code)
        metrics.update(h)
        complexity      = round(1.0 + h["max_depth"] / 6.0 + h["inline_scripts"] * 0.3, 2)
        maintainability = round(max(0, 100 - h["max_depth"] * 3 - h["inline_styles"] * 2), 2)
    elif ext in (".css", ".scss", ".sass", ".less"):
        c = _analyze_css(code)
        metrics.update(c)
        complexity = round(
            1.0 + (c["complex_selectors"] / max(c["selectors"], 1) * 4) + c["important_count"] * 0.1,
            2,
        )
        maintainability = round(
            max(0, 100 - c["vendor_prefixes"] * 1.5 - c["complex_selectors"] - c["id_selectors"] * 0.5),
            2,
        )
    elif ext in (".js", ".jsx", ".ts", ".tsx"):
        j = _analyze_js(code)
        metrics.update(j)
        complexity      = round(max(1.0, _generic_complexity_estimate(code) + j["async_functions"] * 0.2), 2)
        maintainability = round(max(0, 100 - j["functions"] * 1.5 - j["event_handlers"] * 0.8), 2)
    else:
        complexity      = _generic_complexity_estimate(code)
        maintainability = round(max(0, 100 - (long_line_ratio * 100 * 0.4) - todo_count * 1.2), 2)

    risk_score = round(
        min(
            100.0,
            complexity * 3
            + max(0.0, 70 - maintainability) * 0.8
            + long_line_ratio * 35
            + todo_count * 1.5,
        ),
        2,
    )
    metrics.update({"complexity": complexity, "maintainability": maintainability, "risk_score": risk_score})

    functions = metrics.get("functions", 0)
    classes   = metrics.get("classes", 0)
    return functions, classes, complexity, maintainability, comment_ratio, metrics

# ---------------------------------------------------------------------------
# Repository-level analysis  (parallel + cache aware)
# ---------------------------------------------------------------------------

def analyze_repository(
    repo_path_or_index,
    cache: "AnalysisCache | None" = None,
) -> dict:
    # Accepts either a str path or a FileIndex object.
    from file_index import FileIndex, FileEntry  # local import avoids circular at module level

    if isinstance(repo_path_or_index, str):
        idx = FileIndex(repo_path_or_index)
    else:
        idx = repo_path_or_index

    entries: list = idx.scored_files  # docs excluded from scoring

    total_functions   = 0
    total_classes     = 0
    complexities      = []
    maintainabilities = []
    comment_ratios    = []
    risk_scores       = []
    locs              = []
    analyzed_files    = []
    cache_hits        = 0

    def _process(entry):
        # Cache lookup
        if cache is not None:
            cached = cache.get(entry.rel_path, entry.mtime, entry.size)
            if cached is not None:
                return True, cached
        try:
            _f, _c, _comp, _mi, _cr, extra = analyze_file(entry.abs_path)
        except Exception:
            return False, None
        extra["file"] = entry.rel_path
        if cache is not None:
            cache.set(entry.rel_path, entry.mtime, entry.size, extra)
        return False, extra

    with ThreadPoolExecutor(max_workers=MAX_PARALLEL_WORKERS) as pool:
        futures = {pool.submit(_process, e): e for e in entries}
        for fut in as_completed(futures):
            hit, extra = fut.result()
            if extra is None:
                continue
            if hit:
                cache_hits += 1
            total_functions   += extra.get("functions", 0)
            total_classes     += extra.get("classes", 0)
            complexities.append(extra.get("complexity", 1.0))
            maintainabilities.append(extra.get("maintainability", 50.0))
            comment_ratios.append(extra.get("comment_ratio", 0.0))
            risk_scores.append(extra.get("risk_score", 0.0))
            locs.append(extra.get("loc", 0))
            analyzed_files.append(extra)

    def avg(lst):
        return round(sum(lst) / len(lst), 2) if lst else 0.0

    high_risk_files = sorted(
        [
            {
                "file":            f.get("file", ""),
                "risk_score":      f.get("risk_score", 0.0),
                "complexity":      f.get("complexity", 0.0),
                "maintainability": f.get("maintainability", 0.0),
            }
            for f in analyzed_files
        ],
        key=lambda x: x["risk_score"],
        reverse=True,
    )[:10]

    by_language = Counter(f.get("language", "other") for f in analyzed_files)

    return {
        "functions":           total_functions,
        "classes":             total_classes,
        "avg_complexity":      avg(complexities),
        "avg_maintainability": avg(maintainabilities),
        "avg_comment_ratio":   avg(comment_ratios),
        "avg_risk_score":      avg(risk_scores),
        "avg_loc_per_file":    avg(locs),
        "num_files_analyzed":  len(analyzed_files),
        "cache_hits":          cache_hits,
        "language_breakdown":  dict(sorted(by_language.items(), key=lambda x: -x[1])),
        "high_risk_files":     high_risk_files,
        "analyzed_files":      analyzed_files,
    }
