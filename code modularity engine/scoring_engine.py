from config import COMPLEXITY_WEIGHT, COUPLING_WEIGHT, DUPLICATION_WEIGHT


def compute_score(
    complexity: float,
    coupling: float,
    duplication: dict,
    maintainability: float = 50.0,
    comment_ratio: float = 0.0,
    risk_score: float = 0.0,
) -> float:
    """
    Compute a 0-100 modularity score.
    Includes core penalties (complexity/coupling/duplication) and quality modifiers.
    """
    dup_rate = duplication.get("duplication_rate", 0) if isinstance(duplication, dict) else 0
    dup_blocks = duplication.get("duplicate_blocks", 0) if isinstance(duplication, dict) else duplication

    score = 100.0

    # Core penalties.
    score -= complexity * COMPLEXITY_WEIGHT
    score -= coupling * COUPLING_WEIGHT
    score -= dup_rate * 30.0 * DUPLICATION_WEIGHT
    score -= min(dup_blocks, 25) * 0.45 * DUPLICATION_WEIGHT

    # Quality adjustments.
    score += max(0.0, maintainability - 60.0) * 0.06
    score += min(comment_ratio, 0.30) * 10.0

    # Risk signal (already aggregated from multiple factors).
    score -= risk_score * 0.20

    return max(0.0, min(100.0, round(score, 2)))
