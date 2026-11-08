-- 002_add_submission_toggles.sql

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS ppt_submission_open BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS git_submission_open BOOLEAN DEFAULT true;

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS ppt_url VARCHAR(1024);
