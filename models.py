from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, Boolean, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    participant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    repo_url = Column(Text, nullable=False)
    problem_statement = Column(Text, nullable=False)

    status = Column(String(20), default="pending", nullable=False)
    assigned_worker_id = Column(Integer, nullable=True)

    started_at = Column(TIMESTAMP)
    completed_at = Column(TIMESTAMP)
    heartbeat_at = Column(TIMESTAMP)

    evaluation_json = Column(JSONB)
    total_score = Column(Numeric(5,2))

    created_at = Column(TIMESTAMP, server_default=func.now())