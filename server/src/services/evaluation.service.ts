import { withTransaction } from "../db/transaction";
import { HttpError } from "../utils/http-error";
import type { EvaluationInput } from "../mappers/request-mappers";
import type { Team, Submission, EvaluationReport } from "../types/db";

export async function upsertEvaluation(input: EvaluationInput) {
  return withTransaction(async (client) => {
    const teamResult = await client.query(
      `
        SELECT id
        FROM public.teams
        WHERE hackathon_slug = $1 AND team_id = $2
        LIMIT 1
      `,
      [input.hackathonSlug, input.teamId],
    );

    if (teamResult.rowCount === 0) {
      throw new HttpError(404, "Team not found for this hackathon.");
    }

    const teamDbId = (teamResult.rows[0] as Pick<Team, 'id'>).id;

    const submissionResult = await client.query(
      `
        UPDATE public.submissions
        SET status = $1,
            final_score = COALESCE($2, final_score),
            eval_round = $3,
            evaluation_timestamp = NOW(),
            updated_at = NOW()
        WHERE id = $4
          AND hackathon_slug = $5
          AND team_id = $6
        RETURNING id, status, final_score, evaluation_timestamp
      `,
      [
        input.status,
        input.score ?? null,
        input.evalRound,
        input.submissionId,
        input.hackathonSlug,
        teamDbId,
      ],
    );

    if (submissionResult.rowCount === 0) {
      throw new HttpError(404, "Submission not found for this team and hackathon.");
    }

    const reportResult = await client.query(
      `
        INSERT INTO public.evaluation_reports (
          hackathon_slug,
          submission_id,
          team_id,
          eval_round,
          report_json,
          score
        )
        VALUES ($1, $2, $3, $4, $5::jsonb, $6)
        RETURNING id, generated_at
      `,
      [
        input.hackathonSlug,
        input.submissionId,
        teamDbId,
        input.evalRound,
        JSON.stringify(input.reportJson),
        input.score ?? null,
      ],
    );

    return {
      submission: submissionResult.rows[0],
      report: {
        id: reportResult.rows[0].id as string,
        generatedAt: reportResult.rows[0].generated_at as string,
      },
    };
  });
}
