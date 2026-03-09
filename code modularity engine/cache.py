"""
Per-file analysis cache.
Results are keyed by (rel_path, mtime, size) so unchanged files are reused
across runs without re-parsing.  The cache is stored in reports/analysis_cache.json.
"""
from __future__ import annotations

import hashlib
import json
import os

from config import CACHE_ENABLED, CACHE_FILE


def _key(rel_path: str, mtime: float, size: int) -> str:
    raw = f"{rel_path}:{mtime:.6f}:{size}"
    return hashlib.md5(raw.encode()).hexdigest()


class AnalysisCache:
    """Persistent result cache backed by a JSON file."""

    def __init__(self) -> None:
        self._data: dict[str, dict] = {}
        self._dirty = False
        if CACHE_ENABLED:
            self._load()

    def _load(self) -> None:
        if os.path.isfile(CACHE_FILE):
            try:
                with open(CACHE_FILE, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except (json.JSONDecodeError, OSError):
                self._data = {}

    def get(self, rel_path: str, mtime: float, size: int) -> dict | None:
        if not CACHE_ENABLED:
            return None
        return self._data.get(_key(rel_path, mtime, size))

    def set(self, rel_path: str, mtime: float, size: int, result: dict) -> None:
        if not CACHE_ENABLED:
            return
        k = _key(rel_path, mtime, size)
        self._data[k] = result
        self._dirty = True

    def save(self) -> None:
        if not CACHE_ENABLED or not self._dirty:
            return
        os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
        with open(CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(self._data, f)
        self._dirty = False

    @property
    def size(self) -> int:
        return len(self._data)
