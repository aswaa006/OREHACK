const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      if (body?.message) {
        message = body.message;
      }
    } catch {
      // Keep generic message when response body is not JSON.
    }
    throw new Error(message);
  }

  return response.json();
}

export interface HackathonSummary {
  id: string;
  name: string;
  status: "Live" | "Upcoming" | "Completed";
  participants: number;
  deadline: string;
}

export interface SubmissionRow {
  id: number;
  team: string;
  repo: string;
  time: string;
  score: number | null;
  status: "Queued" | "Evaluated" | "Rejected";
}

export interface SubmissionStatus {
  id: number;
  team: string;
  repo: string;
  problem_statement?: string | null;
  status: "Queued" | "Evaluated" | "Rejected";
  score: number | null;
  time: string | null;
  submitted_at: string;
}

export interface LeaderboardRow {
  rank: number;
  team: string;
  score: number;
  time: string;
}

export interface HackathonOverview {
  total_submissions: number;
  evaluated: number;
  queued: number;
  avg_score: number;
}

export interface DeveloperOverview {
  activeHackathons: number;
  totalSubmissions: number;
  engineStatus: string;
  avgEvalTime: string;
}

export interface SystemLog {
  timestamp: string;
  level: string;
  message: string;
}

export function getHackathons() {
  return request<HackathonSummary[]>("/hackathons");
}

export function loginTeam(hackathonId: string, teamId: string, password: string) {
  return request<{ ok: boolean; teamId: string }>(`/hackathons/${hackathonId}/team-login`, {
    method: "POST",
    body: JSON.stringify({ teamId, password }),
  });
}

export function submitSubmission(payload: {
  hackathonId: string;
  teamId: string;
  repoUrl: string;
  problemStatement?: string;
}) {
  return request<SubmissionStatus>(
    `/hackathons/${payload.hackathonId}/submissions`,
    {
      method: "POST",
      body: JSON.stringify({
        teamId: payload.teamId,
        repoUrl: payload.repoUrl,
        problemStatement: payload.problemStatement,
      }),
    },
  );
}

export function getHackathonSubmissions(hackathonId: string) {
  return request<SubmissionRow[]>(`/hackathons/${hackathonId}/submissions`);
}

export function getSubmissionStatus(hackathonId: string, submissionId: number) {
  return request<SubmissionStatus>(`/hackathons/${hackathonId}/submissions/${submissionId}`);
}

export function getLeaderboard(hackathonId: string) {
  return request<LeaderboardRow[]>(`/hackathons/${hackathonId}/leaderboard`);
}

export function getHackathonOverview(hackathonId: string) {
  return request<HackathonOverview>(`/admin/hackathon-overview/${hackathonId}`);
}

export function loginAdmin(email: string, password: string, role: "hackathon" | "developer") {
  return request<{ ok: boolean; role: "hackathon" | "developer" }>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export function getDeveloperOverview() {
  return request<DeveloperOverview>("/admin/developer/overview");
}

export function getDeveloperHackathons() {
  return request<HackathonSummary[]>("/admin/developer/hackathons");
}

export function getDeveloperLogs() {
  return request<SystemLog[]>("/admin/developer/logs");
}