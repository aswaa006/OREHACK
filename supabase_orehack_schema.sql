-- ==============================================================================
-- CODE CLASH 2026 - PRODUCTION DATABASE SCHEMA & POLICIES (COMPLETE)
-- Run in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eezidlqxekfcnvtpfdox/sql
-- ==============================================================================

-- 1. EVENT SETTINGS & CONTROLS
CREATE TABLE IF NOT EXISTS public.orehack_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'cobotex_config',
    submissions_open BOOLEAN DEFAULT TRUE,
    jury_evaluation_open BOOLEAN DEFAULT TRUE,
    active_round VARCHAR(50) DEFAULT 'Round 1',
    leaderboard_published BOOLEAN DEFAULT TRUE,
    common_problem_statement TEXT DEFAULT 'Emergency Response & Disaster Management Platform',
    common_problem_description TEXT DEFAULT 'Build a web-based platform that helps users report emergency incidents and enables administrators to monitor incidents, prioritise emergencies, and coordinate response operations.',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. JURY MEMBERS TABLE (Password = 10-digit phone number)
CREATE TABLE IF NOT EXISTS public.orehack_jury (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jury_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    password VARCHAR(20) NOT NULL,
    panel_name VARCHAR(100) DEFAULT 'General Panel',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEAMS TABLE (Password = 10-digit phone number; Round 1 /35, Round 2 /50, Side Quest /25, Total /110)
CREATE TABLE IF NOT EXISTS public.orehack_teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_special_id VARCHAR(50) UNIQUE,
    team_name VARCHAR(100) NOT NULL,
    leader_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    password VARCHAR(20) NOT NULL,
    is_approved BOOLEAN DEFAULT TRUE,
    problem_statement TEXT DEFAULT 'Emergency Response & Disaster Management Platform',
    repo_link TEXT,
    branch VARCHAR(50) DEFAULT 'main',
    
    -- Legacy / general jury assignment
    assigned_jury_id VARCHAR(50),
    assigned_jury_name VARCHAR(100),
    
    -- Round-wise jury assignments
    assigned_jury_r1_id VARCHAR(50),
    assigned_jury_r1_name VARCHAR(100),
    assigned_jury_r2_id VARCHAR(50),
    assigned_jury_r2_name VARCHAR(100),
    assigned_jury_sidequest_id VARCHAR(50),
    assigned_jury_sidequest_name VARCHAR(100),

    -- Round-wise scores
    r1_score NUMERIC(5,2) DEFAULT 0,       -- Max 35
    r2_jury_score NUMERIC(5,2) DEFAULT 0,  -- Max 50
    r2_tool_score NUMERIC(5,2) DEFAULT 0,  -- Out of 30, contributes 30% in R2
    r2_score NUMERIC(5,2) DEFAULT 0,       -- Final R2 score (Max 50)
    sidequest_score NUMERIC(5,2) DEFAULT 0,-- Max 25
    total_score NUMERIC(5,2) DEFAULT 0,    -- Grand Total (Max 110)

    -- Full rubrics breakdown and tool evaluation details
    r1_breakdown JSONB DEFAULT '{}'::jsonb,
    r2_breakdown JSONB DEFAULT '{}'::jsonb,
    sidequest_breakdown JSONB DEFAULT '{}'::jsonb,
    tool_evaluation JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EVALUATIONS TABLE (Round-wise rubrics & feedback)
CREATE TABLE IF NOT EXISTS public.orehack_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES public.orehack_teams(id) ON DELETE CASCADE,
    team_name VARCHAR(100) NOT NULL,
    jury_id VARCHAR(50) NOT NULL,
    jury_name VARCHAR(100) NOT NULL,
    round VARCHAR(50) NOT NULL,
    rubrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    raw_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    normalized_score NUMERIC(5,2) NOT NULL DEFAULT 0,
    feedback TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_team_jury_round UNIQUE (team_name, jury_id, round)
);

-- 5. ADMIN USERS TABLE (Dynamic credentials)
CREATE TABLE IF NOT EXISTS public.orehack_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'superadmin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.orehack_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orehack_jury ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orehack_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orehack_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orehack_admins ENABLE ROW LEVEL SECURITY;

-- 7. PUBLIC ACCESS POLICIES (anon client)
DROP POLICY IF EXISTS "Allow public on orehack_settings" ON public.orehack_settings;
CREATE POLICY "Allow public on orehack_settings" ON public.orehack_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public on orehack_jury" ON public.orehack_jury;
CREATE POLICY "Allow public on orehack_jury" ON public.orehack_jury FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public on orehack_teams" ON public.orehack_teams;
CREATE POLICY "Allow public on orehack_teams" ON public.orehack_teams FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public on orehack_evaluations" ON public.orehack_evaluations;
CREATE POLICY "Allow public on orehack_evaluations" ON public.orehack_evaluations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public on orehack_admins" ON public.orehack_admins;
CREATE POLICY "Allow public on orehack_admins" ON public.orehack_admins FOR ALL USING (true) WITH CHECK (true);

-- 8. SEED ADMIN CREDENTIALS (admin / coboorehack)
INSERT INTO public.orehack_admins (username, password, role)
VALUES ('admin', 'coboorehack', 'superadmin')
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, updated_at = NOW();

-- 9. SEED CLEAN EVENT CONFIGURATION
INSERT INTO public.orehack_settings (
    id, 
    submissions_open, 
    jury_evaluation_open, 
    active_round, 
    leaderboard_published,
    common_problem_statement,
    common_problem_description
)
VALUES (
    'cobotex_config', 
    true, 
    true, 
    'Round 1', 
    true,
    'Emergency Response & Disaster Management Platform',
    'Build a web-based platform that helps users report emergency incidents and enables administrators to monitor incidents, prioritise emergencies, and coordinate response operations.'
)
ON CONFLICT (id) DO UPDATE SET 
    common_problem_statement = EXCLUDED.common_problem_statement,
    common_problem_description = EXCLUDED.common_problem_description,
    updated_at = NOW();
