import { withTransaction } from "../db/transaction";
import { HttpError } from "../utils/http-error";
import type { JuryScoreInput } from "../mappers/request-mappers";
import type { Team, JuryScore } from "../types/db";

export async function createJuryScore(input: JuryScoreInput, juryAdminId: string) {
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

    const juryResult = await client.query(
      `
        INSERT INTO public.jury_scores (
          hackathon_slug,
          team_id,
          jury_member_id,
          jury_round,
          score,
          remarks
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, evaluated_at
      `,
      [
        input.hackathonSlug,
        teamDbId,
        juryAdminId,
        input.juryRound,
        input.score,
        input.remarks || null,
      ],
    );

    return {
      id: juryResult.rows[0].id as string,
      evaluatedAt: juryResult.rows[0].evaluated_at as string,
      teamDbId,
      teamId: input.teamId,
      score: input.score,
      juryRound: input.juryRound,
    };
  });
}
