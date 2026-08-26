/**
 * Typed API client for the /api/v2/ backend.
 * All methods auto-inject Authorization header from localStorage.
 */

const API_BASE = "/api/v2";
const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

// ── Token helpers ─────────────────────────────────────────────────────────────

export function getAdminToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAdminUser(): AdminUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminUser(user: AdminUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAdminSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "EVENT_ADMIN" | "PARTICIPANT";
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationInfo;
  message?: string;
}

export interface Event {
  id: string;
  name: string;
  institution?: string;
  description?: string;
  theme?: string;
  start_date?: string;
  end_date?: string;
  registration_start?: string;
  registration_end?: string;
  max_team_size: number;
  status: "DRAFT" | "REGISTRATION_OPEN" | "REGISTRATION_CLOSED" | "EVALUATION" | "COMPLETED" | "ARCHIVED";
  leaderboard_visible: boolean;
  slug?: string;
  created_at: string;
  updated_at: string;
  // stats (populated by some endpoints)
  team_count?: number;
  submission_count?: number;
  evaluated_count?: number;
}

export interface EventStats {
  id: string;
  name: string;
  status: string;
  team_count: number;
  participant_count: number;
  submission_count: number;
  evaluated_count: number;
  average_score: number | null;
  highest_score: number | null;
}

export interface Team {
  id: string;
  team_code?: string;
  team_name: string;
  institution?: string;
  department?: string;
  event_id: string;
  event_name?: string;
  leader_name?: string;
  leader_email?: string;
  member_count: number;
  submission_code?: string;
  repo_url?: string;
  demo_url?: string;
  submission_status?: string;
  score_locked?: boolean;
  evaluation_status: "EVALUATED" | "PENDING";
  total_score: number;
  members?: TeamMember[];
  submission?: Submission;
  scores?: TeamScores;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  institution?: string;
  is_leader: boolean;
}

export interface Submission {
  id: string;
  submission_code: string;
  problem_statement: string;
  problem_description?: string;
  repo_url?: string;
  demo_url?: string;
  status: string;
  score_locked: boolean;
  reasoning?: string;
  submitted_at: string;
}

export interface TeamScores {
  technical: number;
  innovation: number;
  completeness: number;
  total: number;
  evaluated: boolean;
}

export interface Participant {
  participant_id: string;
  participant_name: string;
  email: string;
  phone?: string;
  department?: string;
  participant_institution?: string;
  is_leader: boolean;
  team_id: string;
  team_name: string;
  team_institution?: string;
  team_code?: string;
  event_id: string;
  event_name?: string;
  submission_code?: string;
  submission_status?: string;
  submitted_at?: string;
  evaluation_status: "EVALUATED" | "PENDING" | "NO_SUBMISSION";
}

export interface DashboardStats {
  total_hackathons: string;
  active_hackathons: string;
  total_teams: string;
  total_participants: string;
  pending_evaluation: string;
  evaluated_teams: string;
  average_score: string | null;
  highest_score: string | null;
}

export interface LeaderboardTeam {
  team_id: string;
  team_code?: string;
  team_name: string;
  institution?: string;
  submission_code: string;
  repo_url?: string;
  score_locked: boolean;
  total_score: number;
  technical_score: number;
  innovation_score: number;
  completeness_score: number;
  evaluation_status: "EVALUATED" | "PENDING";
  rank: number;
}

export interface ScoreImport {
  id: string;
  file_name: string;
  file_name_original?: string;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  status: string;
  created_at: string;
  uploaded_by?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  created_at: string;
  user_email?: string;
}

export interface RecentActivity {
  id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  created_at: string;
  user_email?: string;
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAdminToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAdminSession();
    window.location.href = "/admin/auth";
    throw new Error("Session expired. Please login again.");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? `API error: ${response.status}`);
  }

  return data;
}

// For CSV downloads — returns raw response
async function apiFetchRaw(path: string): Promise<Response> {
  const token = getAdminToken();
  return fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginAdmin(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
  const res = await apiFetch<{ token: string; user: AdminUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.data;
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await apiFetch<DashboardStats>("/admin/dashboard");
  return res.data;
}

export async function getActiveHackathons(): Promise<Event[]> {
  const res = await apiFetch<Event[]>("/admin/hackathons/active");
  return res.data;
}

export async function getRecentSubmissions(): Promise<any[]> {
  const res = await apiFetch<any[]>("/admin/submissions/recent");
  return res.data;
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  const res = await apiFetch<RecentActivity[]>("/admin/activity");
  return res.data;
}

// ── Events ────────────────────────────────────────────────────────────────────

export async function getEvents(): Promise<Event[]> {
  const res = await apiFetch<Event[]>("/events");
  return res.data;
}

export async function getEvent(id: string): Promise<Event> {
  const res = await apiFetch<Event>(`/events/${id}`);
  return res.data;
}

export async function getEventStats(id: string): Promise<EventStats> {
  const res = await apiFetch<EventStats>(`/events/${id}/stats`);
  return res.data;
}

export async function createEvent(data: Partial<Event>): Promise<Event> {
  const res = await apiFetch<Event>("/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateEvent(id: string, data: Partial<Event>): Promise<Event> {
  const res = await apiFetch<Event>(`/events/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function archiveEvent(id: string): Promise<Event> {
  const res = await apiFetch<Event>(`/events/${id}/archive`, { method: "POST" });
  return res.data;
}

// ── Teams ────────────────────────────────────────────────────────────────────

export interface TeamsQuery {
  event_id?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export async function getTeams(query: TeamsQuery = {}): Promise<ApiResponse<Team[]>> {
  const params = new URLSearchParams();
  if (query.event_id) params.set("event_id", query.event_id);
  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.search) params.set("search", query.search);
  return apiFetch<Team[]>(`/teams?${params.toString()}`);
}

export async function getTeam(id: string): Promise<Team> {
  const res = await apiFetch<Team>(`/teams/${id}`);
  return res.data;
}

export async function toggleTeamScoreLock(teamId: string) {
  return apiFetch(`/teams/${teamId}/toggle-lock`, { method: "POST" });
}

export async function updateTeamSubmission(teamId: string, data: {
  problem_statement?: string;
  problem_description?: string;
  demo_url?: string;
  repo_url?: string;
}) {
  return apiFetch(`/teams/${teamId}/submission`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function evaluateTeam(teamId: string, data: {
  technical: number;
  innovation: number;
  completeness: number;
  reasoning: string;
}) {
  return apiFetch(`/teams/${teamId}/scores`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ── Participants ──────────────────────────────────────────────────────────────

export interface ParticipantsQuery {
  event_id?: string;
  page?: number;
  limit?: number;
  search?: string;
  institution?: string;
  submission_status?: string;
  evaluation_status?: string;
}

export async function getParticipants(query: ParticipantsQuery = {}): Promise<ApiResponse<Participant[]>> {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
  return apiFetch<Participant[]>(`/participants?${params.toString()}`);
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

export async function getLeaderboard(eventId: string): Promise<{ teams: LeaderboardTeam[]; leaderboard_visible: boolean; total: number }> {
  const res = await apiFetch<{ teams: LeaderboardTeam[]; leaderboard_visible: boolean; total: number }>(`/leaderboard/${eventId}`);
  return res.data;
}

export async function toggleLeaderboardVisibility(eventId: string): Promise<{ leaderboard_visible: boolean }> {
  const res = await apiFetch<{ leaderboard_visible: boolean }>(`/leaderboard/${eventId}/toggle-visibility`, { method: "POST" });
  return res.data;
}

// ── Score Import ──────────────────────────────────────────────────────────────

export interface ImportPreview {
  totalRows: number;
  valid: number;
  alreadyEvaluated: number;
  errors: number;
  scoreUpdates: number;
  rows: any[];
}

export async function previewScoreImport(eventId: string, rows: any[]): Promise<ImportPreview> {
  const res = await apiFetch<ImportPreview>(`/scores/import/${eventId}/preview`, {
    method: "POST",
    body: JSON.stringify({ rows }),
  });
  return res.data;
}

export async function confirmScoreImport(
  eventId: string,
  rows: any[],
  fileName: string
): Promise<{ importId: string; success: number; failed: number; total: number }> {
  const res = await apiFetch<any>(`/scores/import/${eventId}/confirm`, {
    method: "POST",
    body: JSON.stringify({ rows, fileName }),
  });
  return res.data;
}

export async function getImportHistory(eventId: string, page = 1): Promise<ApiResponse<ScoreImport[]>> {
  return apiFetch<ScoreImport[]>(`/scores/imports/${eventId}?page=${page}`);
}

export async function getImportDetail(importId: string): Promise<any> {
  const res = await apiFetch<any>(`/scores/import-detail/${importId}`);
  return res.data;
}

// ── Exports (CSV Downloads) ───────────────────────────────────────────────────

export async function downloadParticipantsCsv(eventId: string): Promise<void> {
  const response = await apiFetchRaw(`/export/${eventId}/participants`);
  if (!response.ok) throw new Error("Export failed");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? `participants_${eventId}.csv`;
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadEvaluationCsv(eventId: string): Promise<void> {
  const response = await apiFetchRaw(`/export/${eventId}/evaluation`);
  if (!response.ok) throw new Error("Export failed");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? `evaluation_${eventId}.csv`;
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadLeaderboardCsv(eventId: string): Promise<void> {
  const response = await apiFetchRaw(`/export/${eventId}/leaderboard`);
  if (!response.ok) throw new Error("Export failed");
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = response.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? `leaderboard_${eventId}.csv`;
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<any[]> {
  const res = await apiFetch<any[]>("/users");
  return res.data;
}

export async function createAdminUser(email: string, password: string, role = "EVENT_ADMIN"): Promise<any> {
  const res = await apiFetch<any>("/users", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
  return res.data;
}

export async function assignEventAdmin(userId: string, eventId: string): Promise<void> {
  await apiFetch("/users/assign", {
    method: "POST",
    body: JSON.stringify({ userId, eventId }),
  });
}

export async function getAuditLogs(params: { page?: number; action?: string } = {}): Promise<ApiResponse<AuditLog[]>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.action) qs.set("action", params.action);
  return apiFetch<AuditLog[]>(`/users/audit-logs?${qs.toString()}`);
}
