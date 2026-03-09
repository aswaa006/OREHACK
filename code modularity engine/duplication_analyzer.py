import os
import re
import hashlib

from config import CODE_EXTENSIONS, DOCS_EXTENSIONS, EXCLUDED_DIRS

# Pre-compiled normalization patterns
_RE_TRAIL_HASH  = re.compile(r"\s+#.*$")
_RE_TRAIL_SLASH = re.compile(r"\s+//.*$")
_RE_STR_LITERAL = re.compile(r"(['\"]).*?\1")
_RE_NUMBER      = re.compile(r"\b\d+(?:\.\d+)?\b")


def _normalize_line(line: str) -> str:
    line = _RE_TRAIL_HASH.sub("", line)
    line = _RE_TRAIL_SLASH.sub("", line)
    line = _RE_STR_LITERAL.sub('"STR"', line)
    line = _RE_NUMBER.sub("NUM", line)
    return line.strip()


def detect_duplication(repo_path_or_index, block_size: int = 6) -> dict:
    # Accepts either a str path or a FileIndex object.
    # Documentation files (DOCS_EXTENSIONS) are excluded from duplication checks.
    try:
        from file_index import FileIndex
        if isinstance(repo_path_or_index, str):
            idx = FileIndex(repo_path_or_index)
        else:
            idx = repo_path_or_index
        # Use scored_files only (code files minus docs)
        entries = [(e.abs_path, e.ext) for e in idx.scored_files]
        use_index = True
    except ImportError:
        use_index = False

    seen_blocks           = {}
    duplicate_count       = 0
    total_blocks          = 0
    duplicate_fingerprints: dict[str, int] = {}

    def _process_file(fpath, ext):
        nonlocal duplicate_count, total_blocks
        if ext in DOCS_EXTENSIONS:
            return
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                raw_lines = f.readlines()
        except OSError:
            return
        lines = [_normalize_line(l) for l in raw_lines]
        lines = [l for l in lines if l and l not in {"{", "}", ";"}]
        for i in range(max(0, len(lines) - block_size + 1)):
            block = "\n".join(lines[i: i + block_size])
            total_blocks += 1
            fp = hashlib.md5(block.encode("utf-8", errors="ignore")).hexdigest()
            if fp in seen_blocks:
                duplicate_count += 1
                duplicate_fingerprints[fp] = duplicate_fingerprints.get(fp, 1) + 1
            else:
                seen_blocks[fp] = fpath

    if use_index:
        for fpath, ext in entries:
            _process_file(fpath, ext)
    else:
        repo_path = repo_path_or_index
        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            for fname in files:
                ext = os.path.splitext(fname)[1].lower()
                if ext in CODE_EXTENSIONS and ext not in DOCS_EXTENSIONS:
                    _process_file(os.path.join(root, fname), ext)

    rate = round(duplicate_count / total_blocks, 4) if total_blocks else 0.0
    top_duplicates = sorted(
        [{"fingerprint": k, "hits": v} for k, v in duplicate_fingerprints.items()],
        key=lambda x: x["hits"],
        reverse=True,
    )[:10]

    return {
        "duplicate_blocks":           duplicate_count,
        "duplication_rate":           rate,
        "block_size":                 block_size,
        "top_duplicate_fingerprints": top_duplicates,
    }
