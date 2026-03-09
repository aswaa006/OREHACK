import os
from collections import defaultdict
from config import EXCLUDED_DIRS, CODE_EXTENSIONS
from metrics_analyzer import _detect_language


def analyze_structure(repo_path_or_index):
    # Accepts either a plain str path or a FileIndex object.
    try:
        from file_index import FileIndex
        if isinstance(repo_path_or_index, str):
            idx = FileIndex(repo_path_or_index)
        else:
            idx = repo_path_or_index
        entries = idx.code_files
        use_index = True
    except ImportError:
        use_index = False

    dir_count     = 0
    total_loc     = 0
    file_sizes    = []
    ext_breakdown = defaultdict(int)
    loc_by_lang   = defaultdict(int)

    if use_index:
        # Count unique directories
        seen_dirs = set()
        for e in entries:
            d = os.path.dirname(e.abs_path)
            seen_dirs.add(d)
        dir_count = len(seen_dirs)

        for e in entries:
            lines = e.content.split("\n")
            loc = len([l for l in lines if l.strip()])
            total_loc += loc
            file_sizes.append(loc)
            ext_breakdown[e.ext] += 1
            loc_by_lang[_detect_language(e.ext)] += loc
    else:
        repo_path = repo_path_or_index
        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            dir_count += len(dirs)
            for fname in files:
                ext = os.path.splitext(fname)[1].lower()
                if ext not in CODE_EXTENSIONS:
                    continue
                fpath = os.path.join(root, fname)
                try:
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                        lines = f.readlines()
                    loc = len([l for l in lines if l.strip()])
                    total_loc += loc
                    file_sizes.append(loc)
                    ext_breakdown[ext] += 1
                    loc_by_lang[_detect_language(ext)] += loc
                except OSError:
                    pass

    total_files   = sum(ext_breakdown.values())
    avg_file_size = round(sum(file_sizes) / len(file_sizes), 1) if file_sizes else 0
    max_file_loc  = max(file_sizes) if file_sizes else 0
    min_file_loc  = min(file_sizes) if file_sizes else 0

    return {
        "directory_count":  dir_count,
        "total_code_files": total_files,
        "total_loc":        total_loc,
        "avg_file_loc":     avg_file_size,
        "max_file_loc":     max_file_loc,
        "min_file_loc":     min_file_loc,
        "loc_by_language":  dict(sorted(loc_by_lang.items(), key=lambda x: -x[1])),
        "file_breakdown":   dict(sorted(ext_breakdown.items(), key=lambda x: -x[1])),
    }
