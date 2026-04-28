import { pool } from "../db/pool";
import { HttpError } from "../utils/http-error";
import type { Hackathon } from "../types/db";

export type HackathonFlags = {
  slug: string;
  loginEnabled: boolean;
  stage1Active: boolean;
  stage2Active: boolean;
  stage3Active: boolean;
  stage4Active: boolean;
  stage5Active: boolean;
  autoEvalWeight: number;
  juryWeight: number;
};

export async function getHackathonFlags(hackathonSlug: string): Promise<HackathonFlags> {
  const result = await pool.query(
    `
      SELECT
        slug,
        login_enabled,
        stage1_active,
        stage2_active,
        stage3_active,
        stage4_active,
        stage5_active,
        auto_eval_weight,
        jury_weight
      FROM public.hackathons
      WHERE slug = $1
      LIMIT 1
    `,
    [hackathonSlug],
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, "Hackathon not found.");
  }

  const row = result.rows[0] as Pick<
    Hackathon,
    | 'slug'
    | 'login_enabled'
    | 'stage1_active'
    | 'stage2_active'
    | 'stage3_active'
    | 'stage4_active'
    | 'stage5_active'
    | 'auto_eval_weight'
    | 'jury_weight'
  >;

  return {
    slug: row.slug,
    loginEnabled: row.login_enabled,
    stage1Active: row.stage1_active,
    stage2Active: row.stage2_active,
    stage3Active: row.stage3_active,
    stage4Active: row.stage4_active,
    stage5Active: row.stage5_active,
    autoEvalWeight: Number(row.auto_eval_weight),
    juryWeight: Number(row.jury_weight),
  };
}
