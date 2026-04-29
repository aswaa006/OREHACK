import { clearBackendTokens } from "@/lib/backend-api";

export const ADMIN_SESSION_KEY = "orehack_admin_session";
export const LEGACY_ADMIN_SESSION_KEY = "admin_session";

export type DashboardRole = "developer_admin" | "hackathon_admin" | "participant" | "unknown";

export interface StoredAdminSession {
  userId: string;
  email: string | null;
  role: DashboardRole;
  hackathonId: string | null;
  source: "supabase" | "legacy" | "backend";
  createdAt: number;
}

export function normalizeDashboardRole(value: unknown): DashboardRole {
  if (typeof value !== "string") return "unknown";

  const role = value.toLowerCase().trim();
  if (!role) return "unknown";
  if (role.includes("developer")) return "developer_admin";
  if (role.includes("hackathon") || role.includes("organizer") || role.includes("judge") || role.includes("admin")) {
    return "hackathon_admin";
  }
  if (role.includes("participant") || role.includes("team")) return "participant";
  return "unknown";
}

export function resolveAdminRoute(role: DashboardRole): string {
  switch (role) {
    case "developer_admin":
      return "/admin/developer";
    case "hackathon_admin":
      return "/admin/hackathon";
    case "participant":
      return "/hackathons";
    default:
      return "/admin/auth";
  }
}

export function readLegacyAdminSession(): StoredAdminSession | null {
  if (typeof window === "undefined") return null;

  const rawSession = localStorage.getItem(ADMIN_SESSION_KEY);
  if (rawSession) {
    try {
      return JSON.parse(rawSession) as StoredAdminSession;
    } catch {
      localStorage.removeItem(ADMIN_SESSION_KEY);
    }
  }

  const legacyRaw = localStorage.getItem(LEGACY_ADMIN_SESSION_KEY);
  if (!legacyRaw) return null;

  try {
    const legacySession = JSON.parse(atob(legacyRaw)) as {
      user_id?: string;
      email?: string;
      timestamp?: number;
    };

    if (!legacySession.user_id) return null;

    return {
      userId: legacySession.user_id,
      email: legacySession.email ?? null,
      role: "unknown",
      hackathonId: null,
      source: "legacy",
      createdAt: legacySession.timestamp ?? Date.now(),
    };
  } catch {
    localStorage.removeItem(LEGACY_ADMIN_SESSION_KEY);
    return null;
  }
}

export function storeAdminSession(session: StoredAdminSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem(LEGACY_ADMIN_SESSION_KEY);
  clearBackendTokens();
}
