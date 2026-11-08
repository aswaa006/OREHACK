-- 002_admin_platform.sql
-- Non-destructive ALTER TABLE additions for the admin platform

-- Add team_code column for CSV-compatible short IDs (e.g. SHC-ORIGIN-0EOFY)
ALTER TABLE teams ADD COLUMN IF NOT EXISTS team_code VARCHAR(50);
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_team_code ON teams(team_code) WHERE team_code IS NOT NULL;

-- Add leaderboard visibility control to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS leaderboard_visible BOOLEAN DEFAULT FALSE;

-- Add reasoning column to submissions for Python CLI AI output
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reasoning TEXT;

-- Add score_locked flag to submissions (admin can lock scores to prevent further changes)
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS score_locked BOOLEAN DEFAULT FALSE;

-- Add slug to events for URL-friendly identifiers
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug) WHERE slug IS NOT NULL;

-- Ensure score_imports has original file name column
ALTER TABLE score_imports ADD COLUMN IF NOT EXISTS file_name_original VARCHAR(255);

-- Create a view for easy score totals per submission
CREATE OR REPLACE VIEW submission_scores AS
SELECT
  s.id AS submission_id,
  s.submission_id AS submission_code,
  t.id AS team_id,
  t.name AS team_name,
  t.institution,
  t.team_code,
  e.id AS event_id,
  e.name AS event_name,
  s.problem_statement,
  s.repo_url,
  s.status,
  s.score_locked,
  s.reasoning,
  s.created_at AS submission_date,
  COALESCE(
    (SELECT SUM(sc.points) FROM scores sc WHERE sc.submission_id = s.id),
    0
  ) AS total_score,
  COALESCE(
    (SELECT sc.points FROM scores sc
     JOIN score_categories cat ON sc.category_id = cat.id
     WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'technical'
     LIMIT 1), 0
  ) AS technical_score,
  COALESCE(
    (SELECT sc.points FROM scores sc
     JOIN score_categories cat ON sc.category_id = cat.id
     WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'innovation'
     LIMIT 1), 0
  ) AS innovation_score,
  COALESCE(
    (SELECT sc.points FROM scores sc
     JOIN score_categories cat ON sc.category_id = cat.id
     WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'completeness'
     LIMIT 1), 0
  ) AS completeness_score,
  CASE 
    WHEN EXISTS (SELECT 1 FROM scores sc WHERE sc.submission_id = s.id) THEN 'EVALUATED'
    ELSE 'PENDING'
  END AS evaluation_status
FROM submissions s
JOIN teams t ON s.team_id = t.id
JOIN events e ON t.event_id = e.id;

-- Update default super admin password hash to match 'admin@orehack' (bcrypt)
-- (Keeping existing default, adding documentation only)
-- Default: admin@orehack.com / admin123

-- Ensure audit_logs has proper indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_event_id ON teams(event_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_submissions_team_id ON submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_scores_submission_id ON scores(submission_id);
CREATE INDEX IF NOT EXISTS idx_score_imports_event_id ON score_imports(event_id);
