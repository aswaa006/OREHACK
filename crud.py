from sqlalchemy import text
from sqlalchemy.orm import Session
from models import Submission, User


# ---------------------------------------------------------------------------
# Submission CRUD
# ---------------------------------------------------------------------------

def create_submission(
    db: Session,
    participant_id: int,
    repo_url: str,
    problem_statement: str,
) -> Submission:
    sub = Submission(
        participant_id=participant_id,
        repo_url=repo_url,
        problem_statement=problem_statement,
        status="pending",
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def get_submissions(db: Session, limit: int = 200):
    return (
        db.query(Submission)
        .order_by(Submission.created_at.desc())
        .limit(limit)
        .all()
    )


def get_submission(db: Session, submission_id: int):
    return db.query(Submission).filter(Submission.id == submission_id).first()


def get_leaderboard(db: Session, limit: int = 100):
    """Return evaluated submissions ordered by total_score descending."""
    return (
        db.query(Submission)
        .filter(Submission.status == "completed", Submission.total_score.isnot(None))
        .order_by(Submission.total_score.desc())
        .limit(limit)
        .all()
    )


def update_submission_score(
    db: Session,
    submission_id: int,
    score: float,
    evaluation_json: dict,
) -> Submission | None:
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        return None
    sub.total_score = score
    sub.evaluation_json = evaluation_json
    sub.status = "completed"
    db.commit()
    db.refresh(sub)
    return sub


# ---------------------------------------------------------------------------
# Worker job queue
# ---------------------------------------------------------------------------

def assign_job(db: Session, worker_id: int):
    """Pick the oldest pending submission and atomically assign it to this worker."""
    query = text("""
        SELECT id
        FROM submissions
        WHERE status = 'pending'
        ORDER BY created_at
        FOR UPDATE SKIP LOCKED
        LIMIT 1
    """)

    result = db.execute(query).fetchone()

    if not result:
        return None

    submission_id = result[0]

    db.execute(text("""
        UPDATE submissions
        SET status = 'assigned',
            assigned_worker_id = :worker_id,
            started_at = NOW(),
            heartbeat_at = NOW()
        WHERE id = :submission_id
    """), {"worker_id": worker_id, "submission_id": submission_id})

    db.commit()
    return submission_id


def worker_heartbeat(db: Session, submission_id: int, worker_id: int) -> bool:
    result = db.execute(
        text("""
            UPDATE submissions
            SET heartbeat_at = NOW()
            WHERE id = :submission_id
              AND assigned_worker_id = :worker_id
              AND status = 'assigned'
        """),
        {"submission_id": submission_id, "worker_id": worker_id},
    )
    db.commit()
    return result.rowcount > 0


def complete_job(
    db: Session,
    submission_id: int,
    worker_id: int,
    score: float,
    evaluation_json: dict,
) -> bool:
    result = db.execute(
        text("""
            UPDATE submissions
            SET status = 'completed',
                total_score = :score,
                evaluation_json = :eval_json::jsonb,
                completed_at = NOW()
            WHERE id = :submission_id
              AND assigned_worker_id = :worker_id
              AND status = 'assigned'
        """),
        {
            "submission_id": submission_id,
            "worker_id": worker_id,
            "score": score,
            "eval_json": __import__("json").dumps(evaluation_json),
        },
    )
    db.commit()
    return result.rowcount > 0