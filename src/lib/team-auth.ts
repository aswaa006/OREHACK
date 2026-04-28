import { supabase } from "@/lib/supabase";
import { passwordMatches } from "@/lib/password-utils";

export type TeamCredentialResult = {
  valid: boolean;
  teamDbId: string | null;
  teamCode: string;
  teamName: string;
  error?: string;
};

type TeamRow = {
  id: string;
  team_id: string;
  team_name: string;
  password_hash: string | null;
  is_active: boolean | null;
};

type RpcPayload =
  | boolean
  | {
      valid?: boolean;
      is_valid?: boolean;
      success?: boolean;
      ok?: boolean;
      team_id?: string | null;
      team_code?: string | null;
      team_name?: string | null;
      message?: string;
      error?: string;
    }
  | Array<{
      valid?: boolean;
      is_valid?: boolean;
      success?: boolean;
      ok?: boolean;
      team_id?: string | null;
      team_code?: string | null;
      team_name?: string | null;
      message?: string;
      error?: string;
    }>;

const isMissingRpcError = (error: { code?: string; message?: string } | null) => {
  if (!error) return false;
  const code = String(error.code || "").toUpperCase();
  if (code === "PGRST202" || code === "42883") return true;

  const message = String(error.message || "").toLowerCase();
  return (
    message.includes("could not find the function") ||
    message.includes("function") && message.includes("does not exist")
  );
};

const parseRpcPayload = (payload: RpcPayload) => {
  const row = Array.isArray(payload) ? payload[0] : payload;

  if (typeof row === "boolean") {
    return { valid: row, teamDbId: null as string | null, teamCode: null as string | null, teamName: null as string | null, error: row ? undefined : "Invalid team credentials." };
  }

  if (!row || typeof row !== "object") {
    return { valid: false, teamDbId: null, teamCode: null, teamName: null, error: "Invalid team credentials." };
  }

  const validFlag =
    typeof row.valid === "boolean" ? row.valid :
    typeof row.is_valid === "boolean" ? row.is_valid :
    typeof row.success === "boolean" ? row.success :
    typeof row.ok === "boolean" ? row.ok :
    false;

  return {
    valid: validFlag,
    teamDbId: row.team_id ? String(row.team_id) : null,
    teamCode: row.team_code ? String(row.team_code) : null,
    teamName: row.team_name ? String(row.team_name) : null,
    error: row.message || row.error || (validFlag ? undefined : "Invalid team credentials."),
  };
};

export async function verifyTeamCredentials(input: {
  hackathonSlug: string;
  teamCode: string;
  teamName: string;
  password: string;
}): Promise<TeamCredentialResult> {
  const teamCode = input.teamCode.trim();
  const teamName = input.teamName.trim();
  const password = input.password.trim();

  // 1) Server-side verification via RPC (preferred)
  const rpcCandidates: Array<{ fn: string; args: Record<string, string> }> = [];

  for (const candidate of rpcCandidates) {
    const { data, error } = await supabase.rpc(candidate.fn, candidate.args);

    if (error) {
      if (isMissingRpcError(error)) {
        continue;
      }
      return {
        valid: false,
        teamDbId: null,
        teamCode,
        teamName,
        error: error.message || "Unable to verify team credentials.",
      };
    }

    const parsed = parseRpcPayload(data as RpcPayload);
    if (!parsed.valid) {
      return {
        valid: false,
        teamDbId: null,
        teamCode,
        teamName,
        error: parsed.error || "Invalid Team ID, Team Name, or password.",
      };
    }

    // Canonicalize returned data with teams table when possible.
    if (parsed.teamDbId) {
      const { data: team } = await supabase
        .from("teams")
        .select("id, team_id, team_name")
        .eq("id", parsed.teamDbId)
        .maybeSingle<{ id: string; team_id: string; team_name: string }>();

      if (team) {
        return {
          valid: true,
          teamDbId: String(team.id),
          teamCode: team.team_id || teamCode,
          teamName: team.team_name || teamName,
        };
      }
    }

    return {
      valid: true,
      teamDbId: parsed.teamDbId,
      teamCode: parsed.teamCode || teamCode,
      teamName: parsed.teamName || teamName,
    };
  }

  // 2) Fallback: local compatibility verification
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, team_id, team_name, password_hash, is_active")
    .eq("hackathon_slug", input.hackathonSlug)
    .eq("team_id", teamCode)
    .maybeSingle<TeamRow>();

  if (teamError) {
    return {
      valid: false,
      teamDbId: null,
      teamCode,
      teamName,
      error: teamError.message || "Login failed. Please try again.",
    };
  }

  if (team) {
    if (team.is_active === false) {
      return {
        valid: false,
        teamDbId: String(team.id),
        teamCode,
        teamName,
        error: "This team is currently inactive.",
      };
    }

    if ((team.team_name || "").trim().toLowerCase() !== teamName.toLowerCase()) {
      return {
        valid: false,
        teamDbId: String(team.id),
        teamCode,
        teamName,
        error: "Team name does not match this Team ID.",
      };
    }

    const passOk = await passwordMatches(password, {
      hash: team.password_hash,
    });

    if (!passOk) {
      return {
        valid: false,
        teamDbId: String(team.id),
        teamCode,
        teamName,
        error: "Password does not match this Team ID.",
      };
    }

    return {
      valid: true,
      teamDbId: String(team.id),
      teamCode: team.team_id || teamCode,
      teamName: team.team_name || teamName,
    };
  }

  return {
    valid: false,
    teamDbId: null,
    teamCode,
    teamName,
    error: "Invalid Team ID, Team Name, or password.",
  };
}
