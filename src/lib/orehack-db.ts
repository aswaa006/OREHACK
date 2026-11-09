import { supabase } from "./supabase";

export interface OrehackTeam {
  id?: string;
  team_special_id: string;
  team_name: string;
  leader_name: string;
  phone?: string;       // 10-digit phone number
  password?: string;    // Complete 10-digit phone number
  is_approved: boolean;
  problem_statement?: string; // Common problem statement
  repo_link?: string;
  branch?: string;
  assigned_jury_id?: string | null;
  assigned_jury_name?: string | null;

  // Round-wise jury assignments
  assigned_jury_r1_id?: string | null;
  assigned_jury_r1_name?: string | null;
  assigned_jury_r2_id?: string | null;
  assigned_jury_r2_name?: string | null;
  assigned_jury_sidequest_id?: string | null;
  assigned_jury_sidequest_name?: string | null;

  // Round-wise scores
  r1_score?: number;       // Round 1 (Max 35)
  r2_jury_score?: number;  // Round 2 Jury Raw (Max 50)
  r2_tool_score?: number;  // Automated tool score (out of 30, contributes 30% in R2)
  r2_score?: number;       // Effective Round 2 Score (Max 50)
  sidequest_score?: number;// Side Quest (Max 25)
  total_score?: number;    // Grand Total (Max 110)

  // Criteria-wise breakdowns for full audit & editing
  r1_breakdown?: {
    problem_understanding: number; // Max 5
    core_functionality: number;    // Max 15
    ui_ux: number;                 // Max 10
    innovation: number;            // Max 5
  };
  r2_breakdown?: {
    problem_understanding: number;    // Max 5
    core_functionality: number;       // Max 20
    technical_implementation: number; // Max 10
    ui_ux: number;                    // Max 10
    innovation: number;               // Max 5
  };
  sidequest_breakdown?: {
    correct_implementation: number; // Max 10
    integration: number;            // Max 5
    technical_quality: number;      // Max 2
    ui_ux: number;                  // Max 5
    creativity: number;             // Max 3
  };

  // Automated OreHack Tool Evaluation details
  tool_evaluation?: {
    total_score: number;
    tech_score?: number;
    innov_score?: number;
    completeness_score?: number;
    progress?: string | number;
    reasoning?: string;
    repo_url?: string;
    problem_statement?: string;
    evaluated_at?: string;
  };

  rank?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrehackJury {
  id?: string;
  jury_id: string;
  name: string;
  phone: string;     // 10-digit phone number
  password: string;  // 10-digit phone number
  panel_name: string;
  assigned_team_ids?: string[];
  created_at?: string;
}

export interface OrehackEvaluation {
  id?: string;
  team_id?: string;
  team_name: string;
  jury_id: string;
  jury_name: string;
  round: "Round 1" | "Round 2" | "Side Quest" | string;
  rubrics: Record<string, number>;
  raw_score: number;
  normalized_score: number;
  feedback?: string;
  updated_at?: string;
}

export interface OrehackEventSettings {
  id?: string;
  submissions_open: boolean;
  jury_evaluation_open: boolean;
  active_round: "Round 1" | "Round 2" | "Side Quest";
  leaderboard_published: boolean;
  common_problem_statement: string;
  common_problem_description: string;
  updated_at?: string;
}

export interface AuthResult {
  success: boolean;
  team?: OrehackTeam;
  jury?: OrehackJury;
  error?: string;
  isPendingApproval?: boolean;
}

// ── Clean initial state (Zero mock data - populated via Admin & CSV import) ──
const DEFAULT_TEAMS: OrehackTeam[] = [];
const DEFAULT_JURY: OrehackJury[] = [];

export const DEFAULT_COMMON_PROBLEM_STATEMENT =
  "Emergency Response & Disaster Management Platform";

export const DEFAULT_COMMON_PROBLEM_DESCRIPTION =
  "Build a web-based platform that helps users report emergency incidents and enables administrators to monitor incidents, prioritise emergencies, and coordinate response operations across Round 1, Round 2, and Side Quest.";

const DEFAULT_SETTINGS: OrehackEventSettings = {
  submissions_open: true,
  jury_evaluation_open: true,
  active_round: "Round 1",
  leaderboard_published: true,
  common_problem_statement: DEFAULT_COMMON_PROBLEM_STATEMENT,
  common_problem_description: DEFAULT_COMMON_PROBLEM_DESCRIPTION,
};

// ── Auto-purge obsolete storage from previous local test runs ──
if (typeof window !== "undefined") {
  try {
    const dbVer = localStorage.getItem("orehack_codeclash_db_ver");
    if (dbVer !== "codeclash_2026_v1") {
      localStorage.removeItem("orehack_teams");
      localStorage.removeItem("orehack_jury");
      localStorage.removeItem("orehack_evaluations");
      sessionStorage.removeItem("orehack_active_jury");
      localStorage.setItem("orehack_codeclash_db_ver", "codeclash_2026_v1");
    }
  } catch (e) {}
}

// ── Local Storage Helper (with Node fallback) ──
const memoryStore = new Map<string, string>();

function getStore<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage !== "undefined") {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } else {
      const raw = memoryStore.get(key);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {}
  return fallback;
}

function setStore<T>(key: string, data: T) {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      memoryStore.set(key, JSON.stringify(data));
    }
  } catch (e) {}
}

// ── SUPABASE CONNECTION & SCHEMA HEALTH CHECK ──
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tablesExist: boolean;
  error?: string;
  url: string;
}> {
  const url = import.meta.env.VITE_SUPABASE_URL || "https://eezidlqxekfcnvtpfdox.supabase.co";
  try {
    const { data, error } = await supabase.from("orehack_teams").select("id").limit(1);
    if (error) {
      if (error.code === "PGRST205") {
        return {
          connected: true,
          tablesExist: false,
          error: "Database table 'orehack_teams' does not exist in Supabase yet. Please run the provided SQL in your Supabase SQL Editor.",
          url,
        };
      }
      return { connected: false, tablesExist: false, error: error.message, url };
    }
    return { connected: true, tablesExist: true, url };
  } catch (err: any) {
    return { connected: false, tablesExist: false, error: err?.message || String(err), url };
  }
}

// ── SQL MIGRATION SCHEMA STRING ──
export const OREHACK_SQL_SCHEMA = `-- ==============================================================================
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
    updated_at = NOW();`;

// ── EVENT SETTINGS ──
export async function getEventSettings(): Promise<OrehackEventSettings> {
  try {
    const { data, error } = await supabase
      .from("orehack_settings")
      .select("*")
      .eq("id", "cobotex_config")
      .maybeSingle();

    if (!error && data) {
      return {
        ...DEFAULT_SETTINGS,
        ...data,
        common_problem_statement:
          data.common_problem_statement || DEFAULT_COMMON_PROBLEM_STATEMENT,
        common_problem_description:
          data.common_problem_description || DEFAULT_COMMON_PROBLEM_DESCRIPTION,
      };
    }
  } catch (e) {}
  return getStore("orehack_settings", DEFAULT_SETTINGS);
}

export async function updateEventSettings(
  patch: Partial<OrehackEventSettings>
): Promise<OrehackEventSettings> {
  const current = await getEventSettings();
  const updated = { ...current, ...patch, updated_at: new Date().toISOString() };

  try {
    await supabase.from("orehack_settings").upsert({ id: "cobotex_config", ...updated });
  } catch (e) {}

  setStore("orehack_settings", updated);
  return updated;
}

// ── SCORE CALCULATION ENGINE ──
/**
 * Official Mark Sheet Distribution (Total 110 marks):
 * - Round 1: Max 35 marks (Pure Jury)
 * - Round 2: Max 50 marks. Tool contributes 30% for Round 2 alone!
 *   If Tool score is provided (> 0):
 *     R2 = (Jury / 50 * 35) + (Tool / 30 * 15)  [Max 50]
 *   If Tool score is 0: R2 = Jury (Max 50)
 * - Side Quest: Max 25 marks (Pure Jury)
 * - Grand Total = R1 + R2 + Side Quest = Max 110 marks
 */
export function calculateCombinedScores(params: {
  r1: number;
  r2_jury: number;
  r2_tool?: number;
  sidequest: number;
}): {
  r1_score: number;
  r2_jury_score: number;
  r2_tool_score: number;
  r2_score: number;
  sidequest_score: number;
  total_score: number;
} {
  const r1 = Math.min(35, Math.max(0, Number(params.r1 || 0)));
  const r2_jury = Math.min(50, Math.max(0, Number(params.r2_jury || 0)));
  const r2_tool = Math.min(30, Math.max(0, Number(params.r2_tool || 0)));
  const sidequest = Math.min(25, Math.max(0, Number(params.sidequest || 0)));

  let r2_score = r2_jury;
  if (r2_tool > 0) {
    // 70% Jury (max 35) + 30% Tool (max 15) = max 50
    r2_score = Number(((r2_jury / 50) * 35 + (r2_tool / 30) * 15).toFixed(2));
  }

  const total_score = Number(
    Math.min(110, r1 + r2_score + sidequest).toFixed(2)
  );

  return {
    r1_score: Number(r1.toFixed(2)),
    r2_jury_score: Number(r2_jury.toFixed(2)),
    r2_tool_score: Number(r2_tool.toFixed(2)),
    r2_score: Number(r2_score.toFixed(2)),
    sidequest_score: Number(sidequest.toFixed(2)),
    total_score,
  };
}

// ── ADMIN AUTHENTICATION (Supabase Dynamic Credential Validation) ──
export interface OrehackAdminUser {
  id?: string;
  username: string;
  password: string;
  role?: string;
  created_at?: string;
}

export async function authenticateOrehackAdmin(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; error?: string }> {
  const cleanUser = usernameInput.trim();
  const cleanPass = passwordInput.trim();

  if (!cleanUser || !cleanPass) {
    return { success: false, error: "Please enter both Admin Username and Passkey." };
  }

  // 1. Check Supabase orehack_admins table
  try {
    const { data, error } = await supabase
      .from("orehack_admins")
      .select("*")
      .ilike("username", cleanUser)
      .maybeSingle();

    if (!error && data) {
      if (data.password === cleanPass) {
        return { success: true };
      }
      return { success: false, error: "Incorrect Admin passkey." };
    }
  } catch (e) {}

  // 2. Direct fallback for initial setup if table is pending migration
  if (cleanUser.toLowerCase() === "admin" && cleanPass === "coboorehack") {
    return { success: true };
  }

  return { success: false, error: "Invalid Admin username or passkey." };
}

// ── TEAM AUTHENTICATION (10-Digit Phone Number as Password) ──
export async function authenticateOrehackTeam(
  teamName: string,
  leaderName: string,
  passwordInput: string
): Promise<AuthResult> {
  const cleanTeam = teamName.trim();
  const cleanLeader = leaderName.trim();
  const cleanPass = passwordInput.trim().replace(/\D/g, ""); // 10 digits

  // 1. Try Supabase
  try {
    const { data: teams, error } = await supabase
      .from("orehack_teams")
      .select("*")
      .ilike("team_name", cleanTeam);

    if (!error && teams && teams.length > 0) {
      const matched = teams.find(
        (t) => t.leader_name.trim().toLowerCase() === cleanLeader.toLowerCase()
      );
      if (!matched) {
        return {
          success: false,
          error: `Leader name "${cleanLeader}" does not match the registered leader for Team "${cleanTeam}".`,
        };
      }

      // Check against stored password or phone number (10 digits)
      const storedPass = (matched.password || "").trim().replace(/\D/g, "");
      const storedPhone = (matched.phone || "").trim().replace(/\D/g, "");

      if (cleanPass !== storedPass && cleanPass !== storedPhone) {
        return {
          success: false,
          error: "Incorrect 10-digit phone number password.",
        };
      }

      if (!matched.is_approved) {
        return {
          success: false,
          error: `Team "${matched.team_name}" is currently pending approval by hackathon organizers.`,
          isPendingApproval: true,
          team: matched,
        };
      }
      return { success: true, team: matched };
    }
  } catch (e) {}

  // 2. Fallback local store
  const localTeams = getStore("orehack_teams", DEFAULT_TEAMS);
  const matched = localTeams.find(
    (t) => t.team_name.trim().toLowerCase() === cleanTeam.toLowerCase()
  );

  if (!matched) {
    return {
      success: false,
      error: `Team "${cleanTeam}" is not registered in our database. Please ask the administrator to import the teams list.`,
    };
  }
  if (matched.leader_name.trim().toLowerCase() !== cleanLeader.toLowerCase()) {
    return {
      success: false,
      error: `Leader name "${cleanLeader}" does not match the registered leader for Team "${cleanTeam}".`,
    };
  }

  const storedPass = (matched.password || "").trim().replace(/\D/g, "");
  const storedPhone = (matched.phone || "").trim().replace(/\D/g, "");

  if (cleanPass !== storedPass && cleanPass !== storedPhone) {
    return {
      success: false,
      error: "Incorrect 10-digit phone number password.",
    };
  }

  if (!matched.is_approved) {
    return {
      success: false,
      error: `Team "${matched.team_name}" is currently pending approval by hackathon organizers.`,
      isPendingApproval: true,
      team: matched,
    };
  }

  return { success: true, team: matched };
}

// ── TEAMS MANAGEMENT (ADMIN) ──
export async function getAllTeams(): Promise<OrehackTeam[]> {
  try {
    const { data, error } = await supabase
      .from("orehack_teams")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data) {
      setStore("orehack_teams", data);
      return data;
    }
  } catch (e) {}

  return getStore("orehack_teams", DEFAULT_TEAMS);
}

export async function addOrUpdateTeam(team: OrehackTeam): Promise<OrehackTeam> {
  const cleanPhone = (team.phone || team.password || "").replace(/\D/g, "").slice(-10);
  const finalSpecialId =
    team.team_special_id ||
    `CC-${team.team_name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}-${cleanPhone.slice(-4) || Math.floor(1000 + Math.random() * 9000)}`;

  const calculated = calculateCombinedScores({
    r1: team.r1_score || 0,
    r2_jury: team.r2_jury_score || 0,
    r2_tool: team.r2_tool_score || 0,
    sidequest: team.sidequest_score || 0,
  });

  const payload: OrehackTeam = {
    ...team,
    team_special_id: finalSpecialId,
    phone: cleanPhone,
    password: cleanPhone,
    r1_score: calculated.r1_score,
    r2_jury_score: calculated.r2_jury_score,
    r2_tool_score: calculated.r2_tool_score,
    r2_score: calculated.r2_score,
    sidequest_score: calculated.sidequest_score,
    total_score: calculated.total_score,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("orehack_teams")
      .upsert(payload, { onConflict: "team_special_id" })
      .select()
      .single();

    if (!error && data) {
      payload.id = data.id;
    }
  } catch (e) {}

  const current = getStore("orehack_teams", DEFAULT_TEAMS);
  const idx = current.findIndex(
    (t) =>
      t.team_special_id === finalSpecialId ||
      t.team_name.toLowerCase() === team.team_name.toLowerCase()
  );

  if (idx >= 0) {
    current[idx] = { ...current[idx], ...payload };
  } else {
    current.push(payload);
  }
  setStore("orehack_teams", current);
  return payload;
}

export async function deleteTeam(teamSpecialId: string): Promise<boolean> {
  try {
    await supabase.from("orehack_teams").delete().eq("team_special_id", teamSpecialId);
  } catch (e) {}

  const current = getStore("orehack_teams", DEFAULT_TEAMS);
  const filtered = current.filter((t) => t.team_special_id !== teamSpecialId);
  setStore("orehack_teams", filtered);
  return true;
}

export async function deleteAllTeams(passkey: string): Promise<{ success: boolean; message: string }> {
  if (passkey.trim() !== "OREHACKOK") {
    return { success: false, message: "Invalid passkey. Deletion cancelled." };
  }

  try {
    // Delete in Supabase (deleting all records)
    await supabase.from("orehack_submissions").delete().neq("problem_statement", "___NEVER_MATCH___");
  } catch (e) {}

  try {
    await supabase.from("orehack_evaluations").delete().neq("round", "___NEVER_MATCH___");
  } catch (e) {}

  try {
    await supabase.from("orehack_teams").delete().neq("leader_name", "___NEVER_MATCH___");
  } catch (e) {}

  // Clear local storage
  setStore("orehack_teams", []);
  setStore("orehack_evaluations", []);
  setStore("orehack_submissions", []);

  return { success: true, message: "All teams and associated evaluation data have been permanently deleted." };
}

// ── CSV BULK IMPORT FOR TEAMS ──
export function parseTeamsCSV(csvContent: string, defaultPS: string): OrehackTeam[] {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const header = lines[0]
    .toLowerCase()
    .split(",")
    .map((h) => h.trim().replace(/^["']|["']$/g, ""));

  const nameIdx = header.findIndex(
    (h) => h.includes("team") && (h.includes("name") || h === "team")
  );
  const leaderIdx = header.findIndex(
    (h) => h.includes("leader") || (h.includes("name") && !h.includes("team"))
  );
  const phoneIdx = header.findIndex(
    (h) =>
      h.includes("phone") ||
      h.includes("mobile") ||
      h.includes("contact") ||
      h.includes("number")
  );

  const teams: OrehackTeam[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Simple CSV parser handling quotes
    const values: string[] = [];
    let insideQuote = false;
    let currentVal = "";
    for (let c of rawLine) {
      if (c === '"') {
        insideQuote = !insideQuote;
      } else if (c === "," && !insideQuote) {
        values.push(currentVal.trim().replace(/^["']|["']$/g, ""));
        currentVal = "";
      } else {
        currentVal += c;
      }
    }
    values.push(currentVal.trim().replace(/^["']|["']$/g, ""));

    const teamName =
      nameIdx >= 0 && values[nameIdx] ? values[nameIdx].trim() : values[0]?.trim();
    const leaderName =
      leaderIdx >= 0 && values[leaderIdx]
        ? values[leaderIdx].trim()
        : values[1]?.trim() || "Leader";
    let rawPhone =
      phoneIdx >= 0 && values[phoneIdx]
        ? values[phoneIdx].trim()
        : values[2]?.trim() || "";

    const cleanPhone = rawPhone.replace(/\D/g, "").slice(-10) || "9876543210";

    if (!teamName) continue;

    const sanitizedIdSlug = teamName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 8);
    const specialId = `CC-${sanitizedIdSlug}-${cleanPhone.slice(-4) || Math.floor(1000 + Math.random() * 9000)}`;

    teams.push({
      team_special_id: specialId,
      team_name: teamName,
      leader_name: leaderName,
      phone: cleanPhone,
      password: cleanPhone, // Complete 10 numbers as password
      is_approved: true,
      problem_statement: defaultPS,
      r1_score: 0,
      r2_jury_score: 0,
      r2_tool_score: 0,
      r2_score: 0,
      sidequest_score: 0,
      total_score: 0,
    });
  }

  return teams;
}

export async function bulkImportTeams(
  teams: OrehackTeam[]
): Promise<{ count: number; teams: OrehackTeam[] }> {
  try {
    await supabase.from("orehack_teams").upsert(teams, { onConflict: "team_special_id" });
  } catch (e) {}

  const current = getStore<OrehackTeam[]>("orehack_teams", []);
  for (const t of teams) {
    const idx = current.findIndex(
      (c) =>
        c.team_special_id === t.team_special_id ||
        c.team_name.toLowerCase() === t.team_name.toLowerCase()
    );
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...t };
    } else {
      current.push(t);
    }
  }
  setStore("orehack_teams", current);
  return { count: teams.length, teams: current };
}

// ── OREHACK TOOL EVALUATION CSV IMPORT & 30% R2 INTEGRATION ──
export interface ParsedToolScore {
  team_name: string;
  problem_statement?: string;
  repo_url?: string;
  progress?: string;
  total_scores: number;
  tech_scores?: number;
  innov_scores?: number;
  completeness_scores?: number;
  reasoning?: string;
  normalized_r2_tool: number; // Max 30 marks
}

export function parseToolScoresCSV(content: string): ParsedToolScore[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const isTab = lines[0].includes("\t");

  const splitLine = (line: string): string[] => {
    if (isTab) {
      return line.split("\t").map((v) => v.trim().replace(/^["']|["']$/g, ""));
    }
    const values: string[] = [];
    let insideQuote = false;
    let currentVal = "";
    for (let c of line) {
      if (c === '"') {
        insideQuote = !insideQuote;
      } else if (c === "," && !insideQuote) {
        values.push(currentVal.trim().replace(/^["']|["']$/g, ""));
        currentVal = "";
      } else {
        currentVal += c;
      }
    }
    values.push(currentVal.trim().replace(/^["']|["']$/g, ""));
    return values;
  };

  const header = splitLine(lines[0]).map((h) => h.toLowerCase().replace(/[\s_-]+/g, ""));

  const teamIdx = header.findIndex((h) => h.includes("team"));
  const psIdx = header.findIndex((h) => h.includes("problem") || h === "ps");
  const repoIdx = header.findIndex((h) => h.includes("repo") || h.includes("github") || h.includes("url"));
  const progressIdx = header.findIndex((h) => h.includes("progress"));
  const totalIdx = header.findIndex((h) => h.includes("total") || h === "score" || h === "scores");
  const techIdx = header.findIndex((h) => h.includes("tech"));
  const innovIdx = header.findIndex((h) => h.includes("innov"));
  const compIdx = header.findIndex((h) => h.includes("complete") || h.includes("completeness"));
  const reasonIdx = header.findIndex((h) => h.includes("reason") || h.includes("feedback") || h.includes("comment"));

  const results: ParsedToolScore[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i]);
    const teamName = teamIdx >= 0 ? values[teamIdx] : values[0];
    if (!teamName || !teamName.trim()) continue;

    const rawTotal = totalIdx >= 0 ? parseFloat(values[totalIdx]) || 0 : 0;
    const tech = techIdx >= 0 && values[techIdx] ? parseFloat(values[techIdx]) || 0 : undefined;
    const innov = innovIdx >= 0 && values[innovIdx] ? parseFloat(values[innovIdx]) || 0 : undefined;
    const comp = compIdx >= 0 && values[compIdx] ? parseFloat(values[compIdx]) || 0 : undefined;
    const progress = progressIdx >= 0 ? values[progressIdx] : undefined;
    const reasoning = reasonIdx >= 0 ? values[reasonIdx] : undefined;
    const repo = repoIdx >= 0 ? values[repoIdx] : undefined;
    const ps = psIdx >= 0 ? values[psIdx] : undefined;

    // Normalization to 30 marks for R2 Tool score:
    // If rawTotal is between 0 and 30, keep as is.
    // If rawTotal is on 100-point scale (> 30), scale to 30: (rawTotal / 100) * 30.
    let normalized = rawTotal;
    if (rawTotal > 30) {
      normalized = (rawTotal / 100) * 30;
    } else if (rawTotal === 0 && (tech || innov || comp)) {
      const sum = (tech || 0) + (innov || 0) + (comp || 0);
      normalized = sum > 30 ? (sum / 100) * 30 : sum;
    }
    normalized = Math.min(30, Math.max(0, Number(normalized.toFixed(2))));

    results.push({
      team_name: teamName.trim(),
      problem_statement: ps?.trim(),
      repo_url: repo?.trim(),
      progress: progress?.trim(),
      total_scores: rawTotal,
      tech_scores: tech,
      innov_scores: innov,
      completeness_scores: comp,
      reasoning: reasoning?.trim(),
      normalized_r2_tool: normalized,
    });
  }

  return results;
}

// ── REPO URL & TEAM NAME NORMALIZERS ──
export function normalizeRepoUrl(url?: string): string {
  if (!url) return "";
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")
    .replace(/\.git$/, "");
}

export function normalizeTeamName(name?: string): string {
  if (!name) return "";
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export interface MatchValidationResult {
  status: "verified" | "repo_mismatch" | "no_team_repo" | "not_found";
  team?: OrehackTeam;
  message?: string;
}

export function validateToolScoreMatch(
  score: ParsedToolScore,
  teams: OrehackTeam[]
): MatchValidationResult {
  const normScoreName = normalizeTeamName(score.team_name);
  const normScoreRepo = normalizeRepoUrl(score.repo_url);

  // Find candidate by team name or team special ID
  const candidate = teams.find(
    (t) =>
      normalizeTeamName(t.team_name) === normScoreName ||
      normalizeTeamName(t.team_special_id) === normScoreName
  );

  if (!candidate) {
    return {
      status: "not_found",
      message: `Team "${score.team_name}" is not registered in the tournament roster.`,
    };
  }

  const normTeamRepo = normalizeRepoUrl(candidate.repo_link);

  if (!normTeamRepo) {
    return {
      status: "no_team_repo",
      team: candidate,
      message: `Team "${candidate.team_name}" has not submitted a GitHub repository link yet. Both Name & Repo must match.`,
    };
  }

  if (!normScoreRepo) {
    return {
      status: "repo_mismatch",
      team: candidate,
      message: `Evaluation CSV does not contain a valid Repo_URL for Team "${candidate.team_name}".`,
    };
  }

  if (normScoreRepo !== normTeamRepo) {
    return {
      status: "repo_mismatch",
      team: candidate,
      message: `Repo URL mismatch: CSV has "${score.repo_url}", but team registered "${candidate.repo_link}".`,
    };
  }

  return {
    status: "verified",
    team: candidate,
    message: "Both Team Name & GitHub Repository matched successfully.",
  };
}

export async function bulkApplyToolScores(
  toolScores: ParsedToolScore[]
): Promise<{
  updatedCount: number;
  teams: OrehackTeam[];
  mismatchedNames: { team_name: string; reason: string }[];
  notFoundNames: string[];
}> {
  const teams = await getAllTeams();
  const mismatchedNames: { team_name: string; reason: string }[] = [];
  const notFoundNames: string[] = [];
  let updatedCount = 0;

  const updatedTeams = teams.map((team) => {
    const normTeamName = normalizeTeamName(team.team_name);
    const normTeamId = normalizeTeamName(team.team_special_id);
    const normTeamRepo = normalizeRepoUrl(team.repo_link);

    // Strict validation: BOTH Team Name AND Repo URL must match properly!
    if (!normTeamRepo) return team;

    const match = toolScores.find((s) => {
      const normScoreName = normalizeTeamName(s.team_name);
      const nameMatches = normScoreName === normTeamName || normScoreName === normTeamId;
      if (!nameMatches) return false;

      const normScoreRepo = normalizeRepoUrl(s.repo_url);
      return Boolean(normScoreRepo && normScoreRepo === normTeamRepo);
    });

    if (!match) return team;

    updatedCount++;

    const newR2Tool = match.normalized_r2_tool;
    const calc = calculateCombinedScores({
      r1: team.r1_score || 0,
      r2_jury: team.r2_jury_score || 0,
      r2_tool: newR2Tool,
      sidequest: team.sidequest_score || 0,
    });

    const updated: OrehackTeam = {
      ...team,
      r2_tool_score: newR2Tool,
      r2_score: calc.r2_score,
      total_score: calc.total_score,
      tool_evaluation: {
        total_score: match.total_scores,
        tech_score: match.tech_scores,
        innov_score: match.innov_scores,
        completeness_score: match.completeness_scores,
        progress: match.progress,
        reasoning: match.reasoning,
        repo_url: match.repo_url,
        problem_statement: match.problem_statement,
        evaluated_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    };

    return updated;
  });

  // Track any score rows that failed validation
  toolScores.forEach((s) => {
    const val = validateToolScoreMatch(s, teams);
    if (val.status === "not_found") {
      notFoundNames.push(s.team_name);
    } else if (val.status !== "verified") {
      mismatchedNames.push({
        team_name: s.team_name,
        reason: val.message || "Repo or Name mismatch",
      });
    }
  });

  try {
    await supabase.from("orehack_teams").upsert(updatedTeams, { onConflict: "team_special_id" });
  } catch (e) {}

  setStore("orehack_teams", updatedTeams);
  return { updatedCount, teams: updatedTeams, mismatchedNames, notFoundNames };
}

// ── JURY MANAGEMENT ──
export async function getAllJury(): Promise<OrehackJury[]> {
  try {
    const { data, error } = await supabase
      .from("orehack_jury")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      setStore("orehack_jury", data);
      return data;
    }
  } catch (e) {}

  return getStore("orehack_jury", DEFAULT_JURY);
}

export async function addOrUpdateJury(jury: OrehackJury): Promise<OrehackJury> {
  const cleanPhone = (jury.phone || "").replace(/\D/g, "").slice(-10);
  const payload = {
    ...jury,
    phone: cleanPhone,
    password: cleanPhone, // Complete 10 numbers as password
  };

  try {
    await supabase.from("orehack_jury").upsert(payload, { onConflict: "jury_id" });
  } catch (e) {}

  const current = getStore("orehack_jury", DEFAULT_JURY);
  const idx = current.findIndex((j) => j.jury_id === jury.jury_id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...payload };
  } else {
    current.push(payload);
  }
  setStore("orehack_jury", current);
  return payload;
}

export async function deleteJury(juryId: string): Promise<boolean> {
  try {
    await supabase.from("orehack_jury").delete().eq("jury_id", juryId);
  } catch (e) {}

  const current = getStore("orehack_jury", DEFAULT_JURY);
  const filtered = current.filter((j) => j.jury_id !== juryId);
  setStore("orehack_jury", filtered);
  return true;
}

export async function authenticateJury(
  idOrPhone: string,
  pass: string
): Promise<AuthResult> {
  const query = idOrPhone.trim();
  const cleanPass = pass.trim().replace(/\D/g, "");

  // Try Supabase
  try {
    const { data: list, error } = await supabase
      .from("orehack_jury")
      .select("*")
      .or(`jury_id.ilike.${query},phone.ilike.${query}`);

    if (!error && list && list.length > 0) {
      const match = list.find((j) => {
        const jPass = (j.password || "").replace(/\D/g, "");
        const jPhone = (j.phone || "").replace(/\D/g, "");
        return cleanPass === jPass || cleanPass === jPhone;
      });
      if (match) return { success: true, jury: match };
      return { success: false, error: "Incorrect 10-digit phone number password." };
    }
  } catch (e) {}

  // Local fallback
  const localJury = getStore("orehack_jury", DEFAULT_JURY);
  const match = localJury.find(
    (j) =>
      (j.jury_id.toLowerCase() === query.toLowerCase() ||
        j.phone.replace(/\D/g, "") === query.replace(/\D/g, "")) &&
      (j.password.replace(/\D/g, "") === cleanPass ||
        j.phone.replace(/\D/g, "") === cleanPass)
  );

  if (match) return { success: true, jury: match };
  return {
    success: false,
    error: "Invalid Jury credentials. Contact the event administrator.",
  };
}

// ── EVALUATION & JURY SUBMISSION ──
export async function submitJuryEvaluation(evaluation: {
  teamName: string;
  juryId: string;
  juryName: string;
  round: "Round 1" | "Round 2" | "Side Quest" | string;
  rubrics: Record<string, number>;
  rawScore: number;
  feedback?: string;
}): Promise<OrehackEvaluation> {
  const payload: OrehackEvaluation = {
    team_name: evaluation.teamName,
    jury_id: evaluation.juryId,
    jury_name: evaluation.juryName,
    round: evaluation.round,
    rubrics: evaluation.rubrics,
    raw_score: evaluation.rawScore,
    normalized_score: evaluation.rawScore,
    feedback: evaluation.feedback || "",
    updated_at: new Date().toISOString(),
  };

  // 1. Try Supabase insert
  try {
    await supabase.from("orehack_evaluations").upsert(payload, {
      onConflict: "team_name,jury_id,round",
    });
  } catch (e) {}

  // 2. Update local evaluation store
  const evals = getStore<OrehackEvaluation[]>("orehack_evaluations", []);
  const idx = evals.findIndex(
    (e) =>
      e.team_name.toLowerCase() === evaluation.teamName.toLowerCase() &&
      e.jury_id === evaluation.juryId &&
      e.round === evaluation.round
  );
  if (idx >= 0) {
    evals[idx] = payload;
  } else {
    evals.push(payload);
  }
  setStore("orehack_evaluations", evals);

  // 3. Update the team's round score & grand total
  const teams = await getAllTeams();
  const team = teams.find(
    (t) => t.team_name.toLowerCase() === evaluation.teamName.toLowerCase()
  );

  if (team) {
    const patch: Partial<OrehackTeam> = {};
    if (evaluation.round === "Round 1") {
      patch.r1_score = evaluation.rawScore;
      patch.r1_breakdown = evaluation.rubrics as any;
    } else if (evaluation.round === "Round 2") {
      patch.r2_jury_score = evaluation.rawScore;
      patch.r2_breakdown = evaluation.rubrics as any;
    } else if (evaluation.round === "Side Quest") {
      patch.sidequest_score = evaluation.rawScore;
      patch.sidequest_breakdown = evaluation.rubrics as any;
    }

    await addOrUpdateTeam({ ...team, ...patch });
  }

  return payload;
}

export async function getAllEvaluations(): Promise<OrehackEvaluation[]> {
  try {
    const { data, error } = await supabase.from("orehack_evaluations").select("*");
    if (!error && data && data.length > 0) {
      setStore("orehack_evaluations", data);
      return data;
    }
  } catch (e) {}

  return getStore<OrehackEvaluation[]>("orehack_evaluations", []);
}

// ── LEADERBOARD WITH REAL-TIME RANKING ──
export async function getLeaderboard(): Promise<OrehackTeam[]> {
  const teams = await getAllTeams();
  const approvedTeams = teams.filter((t) => t.is_approved);

  // Sort by total_score descending
  const sorted = [...approvedTeams].sort(
    (a, b) => (b.total_score || 0) - (a.total_score || 0)
  );

  // Assign ranks
  return sorted.map((t, i) => ({
    ...t,
    rank: i + 1,
  }));
}

// ── PROJECT WORKBENCH SUBMISSION ──
export async function submitOrehackProject(params: {
  teamName: string;
  teamSpecialId?: string;
  problemStatement: string;
  repoLink: string;
  branch?: string;
}): Promise<{
  success: boolean;
  submission?: any;
  teamSpecialId?: string;
  error?: string;
}> {
  const { teamName, problemStatement, repoLink, branch = "main" } = params;

  const currentTeams = await getAllTeams();
  const existing = currentTeams.find(
    (t) =>
      (params.teamSpecialId && t.team_special_id === params.teamSpecialId) ||
      t.team_name.toLowerCase() === teamName.toLowerCase()
  );

  const finalSpecialId =
    existing?.team_special_id ||
    params.teamSpecialId?.trim() ||
    `CC-${teamName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8)}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

  const submissionPayload = {
    team_special_id: finalSpecialId,
    team_name: teamName.trim(),
    problem_statement: problemStatement.trim(),
    repo_link: repoLink.trim(),
    branch: branch.trim() || "main",
    submitted_at: new Date().toISOString(),
  };

  // Sync to teams
  await addOrUpdateTeam({
    ...(existing || {
      team_special_id: finalSpecialId,
      team_name: teamName.trim(),
      leader_name: "Leader",
      is_approved: true,
    }),
    problem_statement: problemStatement.trim(),
    repo_link: repoLink.trim(),
    branch: branch.trim() || "main",
  });

  return {
    success: true,
    submission: submissionPayload,
    teamSpecialId: finalSpecialId,
  };
}

export async function getOrehackSubmission(
  teamSpecialId?: string,
  teamName?: string
) {
  const teams = await getAllTeams();
  const found = teams.find(
    (t) =>
      (teamSpecialId && t.team_special_id === teamSpecialId) ||
      (teamName && t.team_name.toLowerCase() === teamName.toLowerCase())
  );

  if (found && found.repo_link) {
    return {
      team_special_id: found.team_special_id,
      team_name: found.team_name,
      problem_statement: found.problem_statement || "",
      repo_link: found.repo_link || "",
      branch: found.branch || "main",
      submitted_at: found.updated_at || new Date().toISOString(),
    };
  }
  return null;
}

export interface AutoAssignOptions {
  round?: "Round 1" | "Round 2" | "Side Quest" | "all";
  selectedJuryIds?: string[];
  teamsPerJury?: number;
}

// ── AUTO ASSIGN TEAMS TO JURY (WITH ROUND, JURY SELECTION & CAPACITY) ──
export async function autoAssignTeamsToJury(
  options: AutoAssignOptions = {}
): Promise<{
  assignedCount: number;
  juryCount: number;
  teams: OrehackTeam[];
}> {
  const [teams, allJuries] = await Promise.all([getAllTeams(), getAllJury()]);
  if (teams.length === 0 || allJuries.length === 0) {
    return { assignedCount: 0, juryCount: allJuries.length, teams };
  }

  const round = options.round || "Round 1";
  const activeJuries =
    options.selectedJuryIds && options.selectedJuryIds.length > 0
      ? allJuries.filter((j) => options.selectedJuryIds!.includes(j.jury_id))
      : allJuries;

  if (activeJuries.length === 0) {
    return { assignedCount: 0, juryCount: 0, teams };
  }

  // Determine capacity per judge
  const maxPerJury =
    options.teamsPerJury && options.teamsPerJury > 0
      ? options.teamsPerJury
      : Math.ceil(teams.length / activeJuries.length);

  // Track each jury's assigned count
  const juryAssignedCounts = new Map<string, number>();
  activeJuries.forEach((j) => juryAssignedCounts.set(j.jury_id, 0));

  let assignedCounter = 0;
  const updatedTeams: OrehackTeam[] = teams.map((team, idx) => {
    // Find an active jury that hasn't reached maxPerJury
    const juryIndex = idx % activeJuries.length;
    let chosenJury = activeJuries[juryIndex];

    if ((juryAssignedCounts.get(chosenJury.jury_id) || 0) >= maxPerJury) {
      const available = activeJuries.find(
        (j) => (juryAssignedCounts.get(j.jury_id) || 0) < maxPerJury
      );
      if (available) {
        chosenJury = available;
      } else {
        // All selected juries have reached capacity, leave unassigned for this round
        return team;
      }
    }

    juryAssignedCounts.set(
      chosenJury.jury_id,
      (juryAssignedCounts.get(chosenJury.jury_id) || 0) + 1
    );
    assignedCounter++;

    const updated = { ...team, updated_at: new Date().toISOString() };

    if (round === "Round 1") {
      updated.assigned_jury_r1_id = chosenJury.jury_id;
      updated.assigned_jury_r1_name = chosenJury.name;
      updated.assigned_jury_id = chosenJury.jury_id;
      updated.assigned_jury_name = chosenJury.name;
    } else if (round === "Round 2") {
      updated.assigned_jury_r2_id = chosenJury.jury_id;
      updated.assigned_jury_r2_name = chosenJury.name;
    } else if (round === "Side Quest") {
      updated.assigned_jury_sidequest_id = chosenJury.jury_id;
      updated.assigned_jury_sidequest_name = chosenJury.name;
    } else {
      // "all"
      updated.assigned_jury_id = chosenJury.jury_id;
      updated.assigned_jury_name = chosenJury.name;
      updated.assigned_jury_r1_id = chosenJury.jury_id;
      updated.assigned_jury_r1_name = chosenJury.name;
      updated.assigned_jury_r2_id = chosenJury.jury_id;
      updated.assigned_jury_r2_name = chosenJury.name;
      updated.assigned_jury_sidequest_id = chosenJury.jury_id;
      updated.assigned_jury_sidequest_name = chosenJury.name;
    }

    return updated;
  });

  try {
    await supabase.from("orehack_teams").upsert(updatedTeams, { onConflict: "team_special_id" });
  } catch (e) {}

  setStore("orehack_teams", updatedTeams);
  return {
    assignedCount: assignedCounter,
    juryCount: activeJuries.length,
    teams: updatedTeams,
  };
}

// ── REVOKE ALL JURY ASSIGNMENTS (ALL OR BY ROUND) ──
export async function revokeAllJuryAssignments(
  round?: "Round 1" | "Round 2" | "Side Quest" | "all"
): Promise<OrehackTeam[]> {
  const teams = await getAllTeams();
  const targetRound = round || "all";

  const updatedTeams = teams.map((t) => {
    const updated = { ...t, updated_at: new Date().toISOString() };
    if (targetRound === "Round 1") {
      updated.assigned_jury_r1_id = null;
      updated.assigned_jury_r1_name = null;
      updated.assigned_jury_id = null;
      updated.assigned_jury_name = null;
    } else if (targetRound === "Round 2") {
      updated.assigned_jury_r2_id = null;
      updated.assigned_jury_r2_name = null;
    } else if (targetRound === "Side Quest") {
      updated.assigned_jury_sidequest_id = null;
      updated.assigned_jury_sidequest_name = null;
    } else {
      updated.assigned_jury_id = null;
      updated.assigned_jury_name = null;
      updated.assigned_jury_r1_id = null;
      updated.assigned_jury_r1_name = null;
      updated.assigned_jury_r2_id = null;
      updated.assigned_jury_r2_name = null;
      updated.assigned_jury_sidequest_id = null;
      updated.assigned_jury_sidequest_name = null;
    }
    return updated;
  });

  try {
    await supabase.from("orehack_teams").upsert(updatedTeams, { onConflict: "team_special_id" });
  } catch (e) {}

  setStore("orehack_teams", updatedTeams);
  return updatedTeams;
}

// ── REASSIGN TEAM JURY (WITH ROUND SUPPORT & UNASSIGNMENT) ──
export async function reassignTeamJury(
  teamSpecialId: string,
  newJuryId: string | null,
  round: "Round 1" | "Round 2" | "Side Quest" | "all" = "all"
): Promise<OrehackTeam | null> {
  const [teams, juryList] = await Promise.all([getAllTeams(), getAllJury()]);
  const team = teams.find((t) => t.team_special_id === teamSpecialId);
  if (!team) return null;

  const cleanJuryId = (newJuryId || "").trim();
  const newJury = cleanJuryId ? juryList.find((j) => j.jury_id === cleanJuryId) : null;
  const juryId = newJury ? newJury.jury_id : null;
  const juryName = newJury ? newJury.name : null;

  const updatedTeam: OrehackTeam = {
    ...team,
    updated_at: new Date().toISOString(),
  };

  if (round === "Round 1") {
    updatedTeam.assigned_jury_r1_id = juryId;
    updatedTeam.assigned_jury_r1_name = juryName;
    updatedTeam.assigned_jury_id = juryId;
    updatedTeam.assigned_jury_name = juryName;
  } else if (round === "Round 2") {
    updatedTeam.assigned_jury_r2_id = juryId;
    updatedTeam.assigned_jury_r2_name = juryName;
  } else if (round === "Side Quest") {
    updatedTeam.assigned_jury_sidequest_id = juryId;
    updatedTeam.assigned_jury_sidequest_name = juryName;
  } else {
    // "all"
    updatedTeam.assigned_jury_id = juryId;
    updatedTeam.assigned_jury_name = juryName;
    updatedTeam.assigned_jury_r1_id = juryId;
    updatedTeam.assigned_jury_r1_name = juryName;
    updatedTeam.assigned_jury_r2_id = juryId;
    updatedTeam.assigned_jury_r2_name = juryName;
    updatedTeam.assigned_jury_sidequest_id = juryId;
    updatedTeam.assigned_jury_sidequest_name = juryName;
  }

  try {
    await supabase.from("orehack_teams").upsert(updatedTeam, { onConflict: "team_special_id" });
  } catch (e) {}

  const idx = teams.findIndex((t) => t.team_special_id === teamSpecialId);
  if (idx >= 0) {
    teams[idx] = updatedTeam;
  }
  setStore("orehack_teams", teams);
  return updatedTeam;
}

// ── CLEAR / RESET TEAM EVALUATION STATUS ──
export async function clearTeamEvaluationStatus(
  teamSpecialId: string,
  roundToClear?: string
): Promise<OrehackTeam | null> {
  const teams = await getAllTeams();
  const team = teams.find((t) => t.team_special_id === teamSpecialId);
  if (!team) return null;

  // 1. Delete evaluations from Supabase & local storage
  try {
    if (roundToClear) {
      await supabase
        .from("orehack_evaluations")
        .delete()
        .eq("team_name", team.team_name)
        .eq("round", roundToClear);
    } else {
      await supabase
        .from("orehack_evaluations")
        .delete()
        .eq("team_name", team.team_name);
    }
  } catch (e) {}

  const evals = getStore<OrehackEvaluation[]>("orehack_evaluations", []);
  const filteredEvals = evals.filter((e) => {
    if (e.team_name.toLowerCase() !== team.team_name.toLowerCase()) return true;
    if (roundToClear && e.round !== roundToClear) return true;
    return false;
  });
  setStore("orehack_evaluations", filteredEvals);

  // 2. Reset team scores
  let updatedTeam: OrehackTeam;
  if (roundToClear === "Round 1") {
    const calc = calculateCombinedScores({
      r1: 0,
      r2_jury: team.r2_jury_score || 0,
      r2_tool: team.r2_tool_score || 0,
      sidequest: team.sidequest_score || 0,
    });
    updatedTeam = {
      ...team,
      r1_score: 0,
      r1_breakdown: undefined,
      total_score: calc.total_score,
      updated_at: new Date().toISOString(),
    };
  } else if (roundToClear === "Round 2") {
    const calc = calculateCombinedScores({
      r1: team.r1_score || 0,
      r2_jury: 0,
      r2_tool: 0,
      sidequest: team.sidequest_score || 0,
    });
    updatedTeam = {
      ...team,
      r2_jury_score: 0,
      r2_tool_score: 0,
      r2_score: 0,
      r2_breakdown: undefined,
      total_score: calc.total_score,
      updated_at: new Date().toISOString(),
    };
  } else if (roundToClear === "Side Quest") {
    const calc = calculateCombinedScores({
      r1: team.r1_score || 0,
      r2_jury: team.r2_jury_score || 0,
      r2_tool: team.r2_tool_score || 0,
      sidequest: 0,
    });
    updatedTeam = {
      ...team,
      sidequest_score: 0,
      sidequest_breakdown: undefined,
      total_score: calc.total_score,
      updated_at: new Date().toISOString(),
    };
  } else {
    // Reset all rounds
    updatedTeam = {
      ...team,
      r1_score: 0,
      r1_breakdown: undefined,
      r2_jury_score: 0,
      r2_tool_score: 0,
      r2_score: 0,
      r2_breakdown: undefined,
      sidequest_score: 0,
      sidequest_breakdown: undefined,
      total_score: 0,
      updated_at: new Date().toISOString(),
    };
  }

  try {
    await supabase.from("orehack_teams").upsert(updatedTeam, { onConflict: "team_special_id" });
  } catch (e) {}

  const idx = teams.findIndex((t) => t.team_special_id === teamSpecialId);
  if (idx >= 0) {
    teams[idx] = updatedTeam;
  }
  setStore("orehack_teams", teams);

  return updatedTeam;
}
