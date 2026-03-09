import sys
import os

# Make the engine importable
ENGINE_PATH = os.path.join(os.path.dirname(__file__), "code modularity engine")
sys.path.insert(0, ENGINE_PATH)

import json
import uvicorn
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from database import engine, get_db
import models
import crud
from main import run_analysis   # imports from code modularity engine/main.py

# ---------------------------------------------------------------------------
# Create all tables on startup
# ---------------------------------------------------------------------------
models.Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Code Modularity Engine API",
    description=(
        "Clones a GitHub repo and runs the full 8-step modularity "
        "analysis pipeline powered by Ollama."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class AnalyzeRequest(BaseModel):
    repo_url: str


class SubmissionCreate(BaseModel):
    participant_id: int
    repo_url: str
    problem_statement: Optional[str] = ""


class ScoreUpdate(BaseModel):
    score: float
    evaluation_json: dict = {}


class WorkerAssign(BaseModel):
    worker_id: int


class WorkerComplete(BaseModel):
    worker_id: int
    score: float
    evaluation_json: dict = {}


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "message": "Code Modularity Engine is running"}


# ---------------------------------------------------------------------------
# Submissions
# ---------------------------------------------------------------------------

@app.post("/submissions", tags=["Submissions"], status_code=201)
def create_submission(body: SubmissionCreate, db: Session = Depends(get_db)):
    """Create a new submission and queue it for evaluation."""
    sub = crud.create_submission(
        db,
        participant_id=body.participant_id,
        repo_url=body.repo_url,
        problem_statement=body.problem_statement or "",
    )
    return {
        "id": sub.id,
        "status": sub.status,
        "repo_url": sub.repo_url,
        "created_at": sub.created_at,
    }


@app.get("/submissions", tags=["Submissions"])
def list_submissions(db: Session = Depends(get_db)):
    """Return all submissions (newest first)."""
    subs = crud.get_submissions(db)
    return [
        {
            "id": s.id,
            "participant_id": s.participant_id,
            "repo_url": s.repo_url,
            "problem_statement": s.problem_statement,
            "status": s.status,
            "total_score": float(s.total_score) if s.total_score is not None else None,
            "created_at": s.created_at,
            "completed_at": s.completed_at,
        }
        for s in subs
    ]


@app.get("/submissions/{submission_id}", tags=["Submissions"])
def get_submission(submission_id: int, db: Session = Depends(get_db)):
    sub = crud.get_submission(db, submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {
        "id": sub.id,
        "participant_id": sub.participant_id,
        "repo_url": sub.repo_url,
        "problem_statement": sub.problem_statement,
        "status": sub.status,
        "total_score": float(sub.total_score) if sub.total_score is not None else None,
        "evaluation_json": sub.evaluation_json,
        "created_at": sub.created_at,
        "completed_at": sub.completed_at,
    }


@app.patch("/submissions/{submission_id}/score", tags=["Submissions"])
def update_score(submission_id: int, body: ScoreUpdate, db: Session = Depends(get_db)):
    """Manually set the score for a submission (admin use)."""
    sub = crud.update_submission_score(db, submission_id, body.score, body.evaluation_json)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"id": sub.id, "total_score": float(sub.total_score), "status": sub.status}


# ---------------------------------------------------------------------------
# Leaderboard
# ---------------------------------------------------------------------------

@app.get("/leaderboard", tags=["Leaderboard"])
def leaderboard(db: Session = Depends(get_db)):
    """Return completed submissions ranked by score."""
    rows = crud.get_leaderboard(db)
    return [
        {
            "rank": i + 1,
            "submission_id": s.id,
            "participant_id": s.participant_id,
            "repo_url": s.repo_url,
            "total_score": float(s.total_score),
            "completed_at": s.completed_at,
        }
        for i, s in enumerate(rows)
    ]


# ---------------------------------------------------------------------------
# Worker job queue
# ---------------------------------------------------------------------------

@app.post("/worker/assign", tags=["Worker"])
def worker_assign(body: WorkerAssign, db: Session = Depends(get_db)):
    """Assign the next pending submission to a worker."""
    submission_id = crud.assign_job(db, body.worker_id)
    if submission_id is None:
        return {"submission_id": None, "message": "No pending jobs"}
    return {"submission_id": submission_id}


@app.post("/worker/{submission_id}/heartbeat", tags=["Worker"])
def worker_heartbeat(submission_id: int, body: WorkerAssign, db: Session = Depends(get_db)):
    ok = crud.worker_heartbeat(db, submission_id, body.worker_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Job not found or not assigned to this worker")
    return {"ok": True}


@app.post("/worker/{submission_id}/complete", tags=["Worker"])
def worker_complete(submission_id: int, body: WorkerComplete, db: Session = Depends(get_db)):
    ok = crud.complete_job(db, submission_id, body.worker_id, body.score, body.evaluation_json)
    if not ok:
        raise HTTPException(status_code=404, detail="Job not found or not assigned to this worker")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Analysis (engine pipeline)
# ---------------------------------------------------------------------------

@app.post("/analyze", tags=["Analysis"])
def analyze(request: AnalyzeRequest):
    """
    Run the full 8-step analysis pipeline on a GitHub repository:

    1. Clone the repository
    2. Analyze structure
    3. Calculate complexity
    4. Build dependency graph
    5. Detect duplication
    6. Calculate modularity score
    7. Send metrics to Ollama
    8. Generate architectural feedback

    Returns metrics, LLM feedback, file inventory, and completeness check.
    """
    try:
        summary, llm_feedback, inventory, completeness = run_analysis(
            request.repo_url, save_reports=True, skip_llm=False
        )
        return {
            "repo_url": request.repo_url,
            "analysis": summary,
            "llm_feedback": llm_feedback,
            "inventory_summary": inventory.inventory["summary"],
            "file_coverage": {
                "total_code_files": completeness["total_code_files"],
                "analyzed": completeness["analyzed"],
                "failed": completeness["failed"],
                "missing": completeness["missing"],
                "complete": completeness["complete"],
            },
            "completeness_message": completeness["message"],
        }
    except RuntimeError as exc:
        detail = str(exc)
        if "network error" in detail.lower() or "could not resolve" in detail.lower():
            raise HTTPException(status_code=422, detail=detail) from exc
        raise HTTPException(status_code=500, detail=detail) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import socket
    port = 8000
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(("127.0.0.1", port)) == 0:
            print(f"[!] Port {port} is already in use. Run:")
            print(f"    netstat -ano | findstr :{port}")
            print(f"    taskkill /PID <pid> /F")
            sys.exit(1)
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
