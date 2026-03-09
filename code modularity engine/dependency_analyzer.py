import os
import re

import networkx as nx

from config import CODE_EXTENSIONS, EXCLUDED_DIRS

try:
    import ast as _ast

    _AST_AVAILABLE = True
except ImportError:
    _AST_AVAILABLE = False


_LOCAL_PREFIXES = ("./", "../", "/")
_IGNORE_PROTOCOLS = ("http://", "https://", "//", "data:", "mailto:")


def _normalize_path_like(dep: str) -> str:
    dep = dep.strip().split("?")[0].split("#")[0]
    return dep.replace("\\", "/")


def _extract_html_deps(code: str) -> list[str]:
    deps = []
    for match in re.finditer(r"(?:src|href|data-src)\s*=\s*[\"']([^\"'\s]+)[\"']", code, re.IGNORECASE):
        dep = _normalize_path_like(match.group(1))
        if dep and not dep.startswith(_IGNORE_PROTOCOLS):
            deps.append(dep)
    return deps


def _extract_css_deps(code: str) -> list[str]:
    deps = []
    for match in re.finditer(r"@import\s+[\"']([^\"']+)[\"']", code, re.IGNORECASE):
        dep = _normalize_path_like(match.group(1))
        if dep and not dep.startswith(_IGNORE_PROTOCOLS):
            deps.append(dep)

    for match in re.finditer(r"url\s*\(\s*[\"']?([^'\"()]+)[\"']?\s*\)", code):
        dep = _normalize_path_like(match.group(1))
        if dep and not dep.startswith(_IGNORE_PROTOCOLS):
            deps.append(dep)

    return deps


def _extract_js_deps(code: str) -> list[str]:
    deps = []
    for match in re.finditer(r"import\s+.*?from\s+[\"']([^\"']+)[\"']", code, re.MULTILINE):
        deps.append(_normalize_path_like(match.group(1)))
    for match in re.finditer(r"require\s*\(\s*[\"']([^\"']+)[\"']\s*\)", code):
        deps.append(_normalize_path_like(match.group(1)))
    for match in re.finditer(r"import\s*\(\s*[\"']([^\"']+)[\"']\s*\)", code):
        deps.append(_normalize_path_like(match.group(1)))
    return deps


def _extract_python_deps(code: str) -> list[str]:
    deps = []
    if not _AST_AVAILABLE:
        for m in re.finditer(r"(?:from|import)\s+([\w.]+)", code):
            deps.append(m.group(1))
        return deps

    try:
        tree = _ast.parse(code)
        for node in _ast.walk(tree):
            if isinstance(node, _ast.Import):
                for alias in node.names:
                    deps.append(alias.name)
            elif isinstance(node, _ast.ImportFrom) and node.module:
                deps.append(node.module)
    except Exception:
        pass
    return deps


def _extract_deps(ext: str, code: str) -> list[str]:
    if ext == ".py":
        return _extract_python_deps(code)
    if ext in (".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"):
        return _extract_js_deps(code)
    if ext in (".html", ".htm"):
        return _extract_html_deps(code)
    if ext in (".css", ".scss", ".sass", ".less"):
        return _extract_css_deps(code)
    return []


def _collect_repo_nodes(repo_path: str) -> set[str]:
    nodes = set()
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        for fname in files:
            ext = os.path.splitext(fname)[1].lower()
            if ext in CODE_EXTENSIONS:
                rel = os.path.relpath(os.path.join(root, fname), repo_path).replace("\\", "/")
                nodes.add(rel)
    return nodes


def _resolve_local_dependency(source_node: str, dep: str, known_nodes: set[str]) -> str | None:
    dep = dep.strip()
    if not dep:
        return None

    source_dir = os.path.dirname(source_node).replace("\\", "/")
    dep_norm = _normalize_path_like(dep)

    candidates = []
    if dep_norm.startswith("/"):
        candidates.append(dep_norm.lstrip("/"))
    elif dep_norm.startswith(_LOCAL_PREFIXES):
        candidates.append(os.path.normpath(os.path.join(source_dir, dep_norm)).replace("\\", "/"))
    else:
        candidates.append(dep_norm)

    for base in list(candidates):
        if "." not in os.path.basename(base):
            candidates.extend(
                [
                    base + ".py",
                    base + ".js",
                    base + ".ts",
                    base + ".tsx",
                    base + ".jsx",
                    base + "/index.js",
                    base + "/index.ts",
                    base + "/__init__.py",
                ]
            )

    for candidate in candidates:
        if candidate in known_nodes:
            return candidate
    return None


def build_dependency_graph(repo_path_or_index):
    # Accepts either a str path or a FileIndex object.
    try:
        from file_index import FileIndex
        if isinstance(repo_path_or_index, str):
            idx = FileIndex(repo_path_or_index)
        else:
            idx = repo_path_or_index
        repo_path = idx.repo_path
        entries = idx.code_files
        use_index = True
    except ImportError:
        use_index = False
        repo_path = repo_path_or_index

    graph = nx.DiGraph()
    known_nodes = _collect_repo_nodes(repo_path)
    external_deps: dict[str, list[str]] = {}  # source_node -> [external dep, ...]

    for node in known_nodes:
        graph.add_node(node)

    if use_index:
        for entry in entries:
            source_node = entry.rel_path
            code = entry.content
            ext = entry.ext
            for dep in _extract_deps(ext, code):
                resolved = _resolve_local_dependency(source_node, dep, known_nodes)
                if resolved:
                    graph.add_edge(source_node, resolved)
                else:
                    external_deps.setdefault(source_node, []).append(dep)
    else:
        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
            for fname in files:
                ext = os.path.splitext(fname)[1].lower()
                if ext not in CODE_EXTENSIONS:
                    continue
                fpath = os.path.join(root, fname)
                source_node = os.path.relpath(fpath, repo_path).replace("\\", "/")
                try:
                    with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                        code = f.read()
                except OSError:
                    continue
                for dep in _extract_deps(ext, code):
                    resolved = _resolve_local_dependency(source_node, dep, known_nodes)
                    if resolved:
                        graph.add_edge(source_node, resolved)
                    else:
                        external_deps.setdefault(source_node, []).append(dep)

    # Store external deps as graph metadata, not as nodes that inflate coupling.
    graph.graph["external_deps"] = external_deps
    return graph


def calculate_coupling(graph):
    # Only consider internal nodes (no external: namespace) for coupling.
    internal_nodes = [n for n in graph.nodes if not str(n).startswith("external:")]
    n = len(internal_nodes)
    if n == 0:
        return 0.0

    internal_subgraph = graph.subgraph(internal_nodes)
    degrees = dict(internal_subgraph.degree())
    avg_degree = sum(degrees.values()) / n
    density = nx.density(internal_subgraph) if n > 1 else 0.0
    coupling = avg_degree * 0.8 + density * 10.0 * 0.2
    return round(coupling, 4)
