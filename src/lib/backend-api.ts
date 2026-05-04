import { supabase } from "./supabase";
import { verifyTeamCredentials } from "./team-auth";

export type AdminLoginResponse = {
  token: string;
  admin: {
    id: string;
    email: string;
    displayName: string | null;
    role: string | null;
    hackathonSlug: string | null;
  };
};

export type TeamLoginResponse = {
  token: string;
  team: {
    id: string | null;
    teamId: string;
    teamName: string;
    hackathonSlug: string;
  };
};

export type CreateSubmissionResponse = {
  submissionId: string;
  submittedAt: string;
  teamId: string;
  teamDbId: string | null;
  repoLink: string;
};

const TEAM_TOKEN_KEY = "orehack_team_token";

export async function loginAdmin(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  } as any);

  if (authError || !authData?.data) {
    throw new Error(authError?.message || "Admin login failed.");
  }

  const user = authData.data.user;

  // Attempt to read admin profile from `admins` table
  const { data: adminRow, error: adminError } = await supabase
    .from("admins")
    .select("id, email, display_name, role, hackathon_slug")
    .eq("email", email)
    .maybeSingle();

  if (adminError) {
    throw new Error(adminError.message || "Unable to lookup admin profile.");
  }

  const admin = adminRow || {
    id: user?.id ?? "",
    email: user?.email ?? email,
    display_name: user?.user_metadata?.full_name ?? null,
    role: null,
    hackathon_slug: null,
  } as any;

  const token = authData.data.session?.access_token ?? "";

  return {
    token,
    admin: {
      id: String(admin.id),
      email: String(admin.email),
      displayName: admin.display_name ?? null,
      role: admin.role ?? null,
      hackathonSlug: admin.hackathon_slug ?? null,
    },
  } as AdminLoginResponse;
}

export async function loginTeam(
  hackathonSlug: string,
  teamId: string,
  teamName: string,
  password: string,
): Promise<TeamLoginResponse> {
  const result = await verifyTeamCredentials({
    hackathonSlug,
    teamCode: teamId,
    teamName,
    password,
  });

  if (!result.valid) {
    throw new Error(result.error || "Invalid team credentials.");
  }

  // Create a lightweight client session token (not a secure JWT) so UI code can treat it like a session
  const token = `team:${result.teamDbId || result.teamCode}:${Date.now()}`;
  localStorage.setItem(TEAM_TOKEN_KEY, token);

  return {
    token,
    team: {
      id: result.teamDbId,
      teamId: result.teamCode,
      teamName: result.teamName,
      hackathonSlug,
    },
  } as TeamLoginResponse;
}

export async function createSubmission(input: {
  hackathonSlug: string;
  teamId: string;
  repoLink: string;
  problemId?: string;
  problemStatement?: string;
}): Promise<CreateSubmissionResponse> {
  const payload: any = {
    hackathon_slug: input.hackathonSlug,
    team_id: input.teamId,
    repository_url: input.repoLink,
    problem_id: input.problemId ?? null,
    problem_statement: input.problemStatement ?? null,
    submitted_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from("submissions").insert(payload).select("id, submitted_at, team_id, repository_url").maybeSingle();

  if (error || !data) {
    throw new Error(error?.message || "Failed to create submission.");
  }

  return {
    submissionId: String(data.id),
    submittedAt: data.submitted_at ?? new Date().toISOString(),
    teamId: data.team_id,
    teamDbId: data.id ?? null,
    repoLink: data.repository_url,
  };
}

export function setTeamToken(token: string) {
  localStorage.setItem(TEAM_TOKEN_KEY, token);
}

export function getTeamToken() {
  return localStorage.getItem(TEAM_TOKEN_KEY);
}

export function clearBackendTokens() {
  localStorage.removeItem(TEAM_TOKEN_KEY);
}

const ADMIN_TOKEN_KEY = "orehack_admin_token";

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}
