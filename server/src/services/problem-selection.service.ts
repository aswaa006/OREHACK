import { withTransaction } from "../db/transaction";
import { HttpError } from "../utils/http-error";
import type { ProblemSelectionInput } from "../mappers/request-mappers";
import type { Team, Problem, ProblemSelection } from "../types/db";

export async function selectProblem(input: ProblemSelectionInput) {
  return withTransaction(async (client) => {
    const teamResult = await client.query(
      `
        SELECT id, team_id, team_name
        FROM public.teams
        WHERE hackathon_slug = $1 AND team_id = $2 AND is_active = true
        LIMIT 1
      `,
      [input.hackathonSlug, input.teamId],
    );

    if (teamResult.rowCount === 0) {
      throw new HttpError(404, "Team not found for this hackathon.");
    }

    const team = teamResult.rows[0] as Pick<Team, 'id' | 'team_id' | 'team_name'>;

    const existingSelection = await client.query(
      `
        SELECT id, problem_id
        FROM public.problem_selections
        WHERE hackathon_slug = $1 AND team_id = $2
        LIMIT 1
      `,
      [input.hackathonSlug, team.id],
    );

    if ((existingSelection.rowCount ?? 0) > 0) {
      throw new HttpError(409, "Team has already selected a problem.");
    }

    const problemResult = await client.query(
      `
        SELECT id, slots_remaining
        FROM public.problems
        WHERE id = $1 AND hackathon_slug = $2 AND is_active = true
        FOR UPDATE
      `,
      [input.problemId, input.hackathonSlug],
    );

    if (problemResult.rowCount === 0) {
      throw new HttpError(404, "Problem not found or unavailable.");
    }

    const problem = problemResult.rows[0] as Pick<Problem, 'id' | 'slots_remaining'>;

    if (problem.slots_remaining <= 0) {
      throw new HttpError(409, "No slots remaining for this problem.");
    }

    const insertResult = await client.query(
      `
        INSERT INTO public.problem_selections (hackathon_slug, team_id, problem_id)
        VALUES ($1, $2, $3)
        RETURNING id, selected_at
      `,
      [input.hackathonSlug, team.id, problem.id],
    );

    await client.query(
      `
        UPDATE public.problems
        SET slots_remaining = slots_remaining - 1,
            updated_at = NOW()
        WHERE id = $1
      `,
      [problem.id],
    );

    await client.query(
      `
        UPDATE public.teams
        SET assigned_problem_id = $1,
            updated_at = NOW()
        WHERE id = $2
      `,
      [problem.id, team.id],
    );

    return {
      selectionId: insertResult.rows[0].id as string,
      selectedAt: insertResult.rows[0].selected_at as string,
      problemId: problem.id,
      teamId: team.team_id,
      teamDbId: team.id,
    };
  });
}
