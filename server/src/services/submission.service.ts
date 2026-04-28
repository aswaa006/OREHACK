import { withTransaction } from "../db/transaction";
import { HttpError } from "../utils/http-error";
import type { SubmissionInput } from "../mappers/request-mappers";
import type { Team, Submission } from "../types/db";

export async function createSubmission(input: SubmissionInput) {
  return withTransaction(async (client) => {
    const teamResult = await client.query(
      `
        SELECT id, team_id, team_name, assigned_problem_id, repo_locked
        FROM public.teams
        WHERE hackathon_slug = $1 AND team_id = $2 AND is_active = true
        LIMIT 1
      `,
      [input.hackathonSlug, input.teamId],
    );

    if (teamResult.rowCount === 0) {
      throw new HttpError(404, "Team not found for this hackathon.");
    }

    const team = teamResult.rows[0] as Pick<Team, 'id' | 'team_id' | 'team_name' | 'assigned_problem_id' | 'repo_locked'>;

    if (team.repo_locked) {
      throw new HttpError(409, "Repository is already locked for this team.");
    }

    const problemId = input.problemId || team.assigned_problem_id;

    // Mapping note: frontend repoLink/repoUrl/Repo_URL maps to submissions.repository_url.
    const submissionResult = await client.query(
      `
        INSERT INTO public.submissions (
          hackathon_slug,
          team_id,
          team_name,
          problem_id,
          repository_url,
          problem_statement,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'queued')
        RETURNING id, submitted_at
      `,
      [
        input.hackathonSlug,
        team.id,
        team.team_name,
        problemId,
        input.repoLink,
        input.problemStatement || null,
      ],
    );

    await client.query(
      `
        UPDATE public.teams
        SET repo_url = $1,
            repo_locked = true,
            repo_submitted_at = NOW(),
            updated_at = NOW()
        WHERE id = $2
      `,
      [input.repoLink, team.id],
    );

    return {
      submissionId: submissionResult.rows[0].id as string,
      submittedAt: submissionResult.rows[0].submitted_at as string,
      teamId: team.team_id,
      teamDbId: team.id,
      repoLink: input.repoLink,
    };
  });
}
