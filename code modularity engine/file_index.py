"""
Single-pass file index.
Walk the repository once and expose structured access to every file's
metadata and content.  All analyzers consume this index instead of doing
their own os.walk, eliminating redundant I/O on every run.
"""
import os

from config import CODE_EXTENSIONS, DOCS_EXTENSIONS, EXCLUDED_DIRS


class FileEntry:
    """Lightweight representation of one file in the repo.  Content is loaded
    lazily so the index build itself is cheap (stat-only)."""

    __slots__ = ["abs_path", "rel_path", "ext", "mtime", "size", "_content", "_lines"]

    def __init__(self, abs_path: str, rel_path: str) -> None:
        self.abs_path = abs_path
        self.rel_path = rel_path
        self.ext: str = os.path.splitext(abs_path)[1].lower()
        st = os.stat(abs_path)
        self.mtime: float = st.st_mtime
        self.size: int = st.st_size
        self._content: str | None = None
        self._lines: list[str] | None = None

    # ── lazy content loading ───────────────────────────────────────────────
    @property
    def content(self) -> str:
        if self._content is None:
            try:
                with open(self.abs_path, "r", encoding="utf-8", errors="ignore") as f:
                    self._content = f.read()
            except OSError:
                self._content = ""
        return self._content

    @property
    def lines(self) -> list[str]:
        if self._lines is None:
            self._lines = self.content.split("\n")
        return self._lines

    # ── classification properties ──────────────────────────────────────────
    @property
    def is_code_file(self) -> bool:
        return self.ext in CODE_EXTENSIONS

    @property
    def is_doc_file(self) -> bool:
        return self.ext in DOCS_EXTENSIONS

    @property
    def is_scored_file(self) -> bool:
        """True when the file should contribute to scoring metrics
        (code file that is NOT pure documentation)."""
        return self.is_code_file and not self.is_doc_file

    def __repr__(self) -> str:
        return f"<FileEntry {self.rel_path!r} ({self.size}B)>"


class FileIndex:
    """Walks the repository once and stores all discovered file entries.
    Provides convenience filters used by every analyzer so no module needs
    to repeat os.walk logic."""

    def __init__(self, repo_path: str) -> None:
        self.repo_path: str = os.path.normpath(repo_path)
        self._entries: list[FileEntry] = []
        self._build()

    def _build(self) -> None:
        for root, dirs, files in os.walk(self.repo_path):
            dirs[:] = sorted(d for d in dirs if d not in EXCLUDED_DIRS)
            for fname in sorted(files):
                abs_path = os.path.join(root, fname)
                rel_path = os.path.relpath(abs_path, self.repo_path).replace("\\", "/")
                self._entries.append(FileEntry(abs_path, rel_path))

    # ── filters ───────────────────────────────────────────────────────────
    @property
    def all_files(self) -> list[FileEntry]:
        return self._entries

    @property
    def code_files(self) -> list[FileEntry]:
        """All files with a recognised code extension (including docs)."""
        return [e for e in self._entries if e.is_code_file]

    @property
    def scored_files(self) -> list[FileEntry]:
        """Code files minus pure documentation — these drive metrics."""
        return [e for e in self._entries if e.is_scored_file]

    @property
    def doc_files(self) -> list[FileEntry]:
        return [e for e in self._entries if e.is_doc_file]

    def by_extension(self, exts: set) -> list[FileEntry]:
        return [e for e in self._entries if e.ext in exts]

    # ── stats ─────────────────────────────────────────────────────────────
    @property
    def total_files(self) -> int:
        return len(self._entries)

    @property
    def total_code_files(self) -> int:
        return len(self.code_files)

    @property
    def total_scored_files(self) -> int:
        return len(self.scored_files)
