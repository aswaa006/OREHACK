import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { pool } from "../db/pool";
import { env } from "../config/env";
import { HttpError } from "../utils/http-error";
import { signJwt } from "../utils/jwt";
import type { AdminLoginInput, TeamLoginInput } from "../mappers/request-mappers";
import type { Admin, Team, Hackathon } from "../types/db";

const supabaseUrl = env.supabaseUrl;
const supabaseServiceRoleKey = env.supabaseServiceRoleKey;
const supabaseClient =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

const normalizeHashCompare = async (plain: string, storedHash: string) => {
  const direct = plain === storedHash;
  if (direct) return true;

  try {
    return await bcrypt.compare(plain, storedHash);
  } catch {
    return false;
  }
};

export async function teamLogin(input: TeamLoginInput) {
  const hackathonResult = await pool.query(
    `SELECT slug, login_enabled FROM public.hackathons WHERE slug = $1 LIMIT 1`,
    [input.hackathonSlug],
  );

  if (hackathonResult.rowCount === 0) {
    throw new HttpError(404, "Hackathon not found.");
  }

  const hackathon = hackathonResult.rows[0] as Pick<Hackathon, 'slug' | 'login_enabled'>;

  if (!hackathon.login_enabled) {
    throw new HttpError(403, "Team login is not enabled for this hackathon.");
  }

  // Mapping note: frontend teamId corresponds to teams.team_id.
  const teamResult = await pool.query(
    `
      SELECT id, team_id, team_name, password_hash, is_active
      FROM public.teams
      WHERE hackathon_slug = $1 AND team_id = $2
      LIMIT 1
    `,
    [input.hackathonSlug, input.teamId],
  );

  if (teamResult.rowCount === 0) {
    throw new HttpError(401, "Invalid team credentials.");
  }

  const team = teamResult.rows[0] as Pick<Team, 'id' | 'team_id' | 'team_name' | 'password_hash' | 'is_active'>;

  if (!team.is_active) {
    throw new HttpError(403, "Team account is inactive.");
  }

  if (input.teamName && input.teamName.toLowerCase() !== team.team_name.toLowerCase()) {
    throw new HttpError(401, "Team name does not match this team ID.");
  }

  const passwordOk = await normalizeHashCompare(input.password, team.password_hash);
  if (!passwordOk) {
    throw new HttpError(401, "Invalid team credentials.");
  }

  const token = signJwt({
    sub: team.id,
    role: "team",
    hackathonSlug: input.hackathonSlug,
    teamId: team.team_id,
  });

  return {
    token,
    team: {
      id: team.id,
      teamId: team.team_id,
      teamName: team.team_name,
      hackathonSlug: input.hackathonSlug,
    },
  };
}

export async function adminLogin(input: AdminLoginInput) {
  const email = input.email.toLowerCase();

  let admin: Admin | null = null;
  let poolErrorMessage: string | null = null;

  try {
    const result = await pool.query(
      `
        SELECT id, email, password_hash, display_name, role, hackathon_slug, is_active
        FROM public.admins
        WHERE email = $1
        LIMIT 1
      `,
      [email],
    );

    if (result.rowCount > 0) {
      admin = result.rows[0] as Admin;
    }
  } catch (error) {
    poolErrorMessage = error instanceof Error ? error.message : "Unknown PostgreSQL error";
    admin = null;
  }

  if (!admin && supabaseClient) {
    const { data, error } = await supabaseClient
      .from("admins")
      .select("id, email, password_hash, display_name, role, hackathon_slug, is_active")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      throw new HttpError(500, `Admin lookup failed: ${error.message}`);
    }

    admin = (data as Admin | null) ?? null;
  }

  if (!admin && !supabaseClient && poolErrorMessage) {
    throw new HttpError(
      500,
      `Admin lookup failed in PostgreSQL and Supabase fallback is not configured: ${poolErrorMessage}`,
    );
  }

  if (!admin) {
    throw new HttpError(401, "Invalid admin credentials.");
  }

  if (!admin.is_active) {
    throw new HttpError(403, "Admin account is inactive.");
  }

  const passwordOk = await normalizeHashCompare(input.password, admin.password_hash);
  if (!passwordOk) {
    throw new HttpError(401, "Invalid admin credentials.");
  }

  const token = signJwt({
    sub: admin.id,
    role: admin.role,
    email: admin.email,
    hackathonSlug: admin.hackathon_slug || undefined,
  });

  return {
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      displayName: admin.display_name,
      role: admin.role,
      hackathonSlug: admin.hackathon_slug,
    },
  };
}
