import os
import shutil
import stat
from git import Repo
from git.exc import GitCommandError


def is_local_path(repo_url: str) -> bool:
    """Return True when repo_url points to an existing local directory."""
    return os.path.isdir(repo_url)


def clone_repository(repo_url: str, target_dir: str = "temp_repo") -> str:
    """Clone *repo_url* into *target_dir* and return the path.

    If *repo_url* is already a local directory path, return it directly
    without cloning (and without touching cleanup on function exit).
    """
    if is_local_path(repo_url):
        return os.path.abspath(repo_url)

    if os.path.exists(target_dir):
        cleanup_repository(target_dir)

    try:
        Repo.clone_from(repo_url, target_dir, depth=1)
    except GitCommandError as exc:
        stderr = str(exc)
        if "Could not resolve host" in stderr or "unable to access" in stderr:
            raise RuntimeError(
                f"Network error: cannot reach '{repo_url}'.\n"
                "Check your internet connection or supply a local directory path instead."
            ) from exc
        raise RuntimeError(f"git clone failed: {exc}") from exc

    return target_dir

def cleanup_repository(path):
    """Remove directory, handling Windows read-only files."""
    if not os.path.exists(path):
        return

    def handle_remove_error(func, path, exc):
        """Error handler for shutil.rmtree to handle Windows read-only files."""
        if os.path.exists(path):
            os.chmod(path, stat.S_IWRITE)
            try:
                func(path)
            except OSError:
                pass

    try:
        shutil.rmtree(path, onerror=handle_remove_error)
    except Exception:
        # If all else fails, try one more time with full permissions
        try:
            for root, dirs, files in os.walk(path, topdown=False):
                for fname in files:
                    os.chmod(os.path.join(root, fname), stat.S_IWRITE)
            shutil.rmtree(path)
        except Exception:
            pass  # Give up gracefully

