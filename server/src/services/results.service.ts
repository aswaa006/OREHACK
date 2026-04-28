import { withTransaction } from "../db/transaction";
import { HttpError } from "../utils/http-error";
import type { Hackathon, FinalResult } from "../types/db";

export async function computeFinalResults(hackathonSlug: string) {
  return withTransaction(async (client) => {
    const hackathonResult = await client.query(
      `
        SELECT slug, auto_eval_weight, jury_weight
        FROM public.hackathons
        WHERE slug = $1
        LIMIT 1
      `,
      [hackathonSlug],
    );

    if (hackathonResult.rowCount === 0) {
      throw new HttpError(404, "Hackathon not found.");
    }

    const weights = hackathonResult.rows[0] as Pick<Hackathon, 'slug' | 'auto_eval_weight' | 'jury_weight'>;

    await client.query(`DELETE FROM public.final_results WHERE hackathon_slug = $1`, [hackathonSlug]);

    const insertResult = await client.query(
      `
        WITH submission_scores AS (
          SELECT
            s.team_id,
            MAX(s.final_score) AS auto_eval_score
          FROM public.submissions s
          WHERE s.hackathon_slug = $1
          GROUP BY s.team_id
        ),
        jury_averages AS (
          SELECT
            j.team_id,
            AVG(j.score) AS jury_score
          FROM public.jury_scores j
          WHERE j.hackathon_slug = $1
          GROUP BY j.team_id
        ),
        merged_scores AS (
          SELECT
            t.id AS team_id,
            COALESCE(ss.auto_eval_score, 0) AS auto_eval_score,
            COALESCE(ja.jury_score, 0) AS jury_score,
            (
              (COALESCE(ss.auto_eval_score, 0) * $2::numeric) +
              (COALESCE(ja.jury_score, 0) * $3::numeric)
            ) AS final_score
          FROM public.teams t
          LEFT JOIN submission_scores ss ON ss.team_id = t.id
          LEFT JOIN jury_averages ja ON ja.team_id = t.id
          WHERE t.hackathon_slug = $1
        ),
        ranked AS (
          SELECT
            team_id,
            auto_eval_score,
            jury_score,
            final_score,
            RANK() OVER (ORDER BY final_score DESC) AS rank
          FROM merged_scores
        )
        INSERT INTO public.final_results (
          hackathon_slug,
          team_id,
          auto_eval_score,
          jury_score,
          final_score,
          auto_eval_weight,
          jury_weight,
          rank,
          computed_at
        )
        SELECT
          $1,
          r.team_id,
          r.auto_eval_score,
          r.jury_score,
          r.final_score,
          $2::numeric,
          $3::numeric,
          r.rank,
          NOW()
        FROM ranked r
        RETURNING id, team_id, final_score, rank
      `,
      [hackathonSlug, Number(weights.auto_eval_weight), Number(weights.jury_weight)],
    );

    return {
      count: insertResult.rowCount,
      results: insertResult.rows,
      weights: {
        autoEvalWeight: Number(weights.auto_eval_weight),
        juryWeight: Number(weights.jury_weight),
      },
    };
  });
}
