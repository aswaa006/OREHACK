export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (import.meta.env.DEV ? "http://localhost:4000/api" : "/api");

export const ADMIN_TOKEN_KEY = "orehack_admin_token";
export const TEAM_TOKEN_KEY = "orehack_team_token";

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

async function requestJson<T>(
  path: string,
  method: "GET" | "POST",
  body?: Record<string, unknown>,
  token?: string,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await res.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!res.ok || !payload?.success || !payload.data) {
    const message = payload?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return payload.data;
}

export type AdminLoginResponse = {
  token: string;
  admin: {
    id: string;
    email: string;
    displayName: string | null;
    role: "developer_admin" | "hackathon_admin" | "jury";
    hackathonSlug: string | null;
  };
};

export type TeamLoginResponse = {
  token: string;
  team: {
    id: string;
    teamId: string;
    teamName: string;
    hackathonSlug: string;
  };
};

export type CreateSubmissionResponse = {
  submissionId: string;
  submittedAt: string;
  teamId: string;
  teamDbId: string;
  repoLink: string;
};

export async function loginAdmin(email: string, password: string) {
  return requestJson<AdminLoginResponse>("/auth/admin/login", "POST", {
    email,
    password,
  });
}

export async function loginTeam(
  hackathonSlug: string,
  teamId: string,
  teamName: string,
  password: string,
) {
  return requestJson<TeamLoginResponse>("/auth/team/login", "POST", {
    hackathonSlug,
    teamId,
    teamName,
    password,
  });
}

export async function createSubmission(input: {
  hackathonSlug: string;
  teamId: string;
  repoLink: string;
  problemId?: string;
  problemStatement?: string;
}) {
  const token = getTeamToken();
  if (!token) {
    throw new Error("Team session expired. Please login again.");
  }

  return requestJson<CreateSubmissionResponse>(
    "/submissions",
    "POST",
    {
      hackathonSlug: input.hackathonSlug,
      teamId: input.teamId,
      repoLink: input.repoLink,
      problemId: input.problemId,
      problemStatement: input.problemStatement,
    },
    token,
  );
}

export function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setTeamToken(token: string) {
  localStorage.setItem(TEAM_TOKEN_KEY, token);
}

export function getTeamToken() {
  return localStorage.getItem(TEAM_TOKEN_KEY);
}

export function clearBackendTokens() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(TEAM_TOKEN_KEY);
}
