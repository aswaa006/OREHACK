import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../utils/http-error";

export async function getPublicEvents(req: Request, res: Response) {
  // Return all events that are not DRAFT or ARCHIVED
  const query = `
    SELECT id, name, institution, description, theme, start_date, end_date, max_team_size, status, slug 
    FROM events 
    WHERE status NOT IN ('DRAFT', 'ARCHIVED') 
    ORDER BY created_at DESC
  `;
  const result = await pool.query(query);
  res.json({ success: true, data: result.rows });
}

export async function registerTeam(req: Request, res: Response) {
  const { id: eventId } = req.params;
  const { teamCode, institution, teamName, leaderName, email, phone } = req.body;

  if (!teamCode || !teamName || !leaderName || !email) {
    throw new HttpError(400, "Missing required registration fields");
  }

  // Validate event
  const eventResult = await pool.query("SELECT id, slug FROM events WHERE id = $1 AND status NOT IN ('DRAFT', 'ARCHIVED')", [eventId]);
  if (eventResult.rowCount === 0) {
    throw new HttpError(404, "Hackathon not found or not active");
  }
  const event = eventResult.rows[0];

  // Start transaction
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Check if team code exists
    const checkTeam = await client.query("SELECT id FROM teams WHERE team_code = $1 AND event_id = $2", [teamCode, eventId]);
    if (checkTeam.rowCount && checkTeam.rowCount > 0) {
      throw new HttpError(400, "Team code already exists for this hackathon");
    }

    // Insert team
    const teamInsert = await client.query(
      `INSERT INTO teams (team_code, team_name, institution, event_id) VALUES ($1, $2, $3, $4) RETURNING id`,
      [teamCode, teamName, institution || null, eventId]
    );
    const teamId = teamInsert.rows[0].id;

    // Insert leader
    await client.query(
      `INSERT INTO team_members (team_id, name, email, phone, is_leader) VALUES ($1, $2, $3, $4, true)`,
      [teamId, leaderName, email, phone || null]
    );

    // Create a lightweight team session token
    const token = `team:${teamCode}:${Date.now()}`;

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      data: {
        token,
        team: {
          id: teamId,
          teamId: teamCode,
          teamName: teamName,
          hackathonSlug: event.slug || event.id,
        },
      }
    });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function loginTeam(req: Request, res: Response) {
  const { id: eventId } = req.params;
  const { teamCode } = req.body;

  if (!teamCode) {
    throw new HttpError(400, "Team code is required");
  }

  const query = `
    SELECT t.id, t.team_code, t.team_name, e.slug, e.id as event_id
    FROM teams t
    JOIN events e ON t.event_id = e.id
    WHERE t.team_code = $1 AND t.event_id = $2
  `;
  const result = await pool.query(query, [teamCode, eventId]);

  if (result.rowCount === 0) {
    throw new HttpError(401, "Invalid team code for this hackathon");
  }

  const team = result.rows[0];
  const token = `team:${team.team_code}:${Date.now()}`;

  res.json({
    success: true,
    data: {
      token,
      team: {
        id: team.id,
        teamId: team.team_code,
        teamName: team.team_name,
        hackathonSlug: team.slug || team.event_id,
      }
    }
  });
}

export async function submitStageLinks(req: Request, res: Response) {
  const { teamId } = req.params;
  const { pptLink, repoLink } = req.body; // stage 1 and stage 2
  
  if (!pptLink && !repoLink) {
    throw new HttpError(400, "Must provide at least one link");
  }

  const client = await pool.connect();
  try {
    // Check if team exists
    const teamResult = await client.query("SELECT id FROM teams WHERE id = $1 OR team_code = $1", [teamId]);
    if (teamResult.rowCount === 0) {
      throw new HttpError(404, "Team not found");
    }
    const internalTeamId = teamResult.rows[0].id;

    // Check if submission exists
    const subResult = await client.query("SELECT id, demo_url, repo_url FROM submissions WHERE team_id = $1", [internalTeamId]);
    
    if (subResult.rowCount && subResult.rowCount > 0) {
      // Update
      const subId = subResult.rows[0].id;
      await client.query(
        "UPDATE submissions SET demo_url = COALESCE($1, demo_url), repo_url = COALESCE($2, repo_url) WHERE id = $3",
        [pptLink || null, repoLink || null, subId]
      );
    } else {
      // Insert
      await client.query(
        "INSERT INTO submissions (team_id, demo_url, repo_url, status) VALUES ($1, $2, $3, 'SUBMITTED')",
        [internalTeamId, pptLink || null, repoLink || null]
      );
    }

    res.json({ success: true, message: "Submission updated successfully" });
  } finally {
    client.release();
  }
}

export async function getTeamDashboard(req: Request, res: Response) {
  const { teamId } = req.params;
  
  // This query uses the submission_scores view to grab all data at once
  const query = `
    SELECT 
      t.id, t.team_code, t.team_name, t.institution, t.event_id,
      e.name as event_name,
      s.demo_url as ppt_link,
      s.repo_url,
      s.problem_statement,
      ss.total_score,
      ss.evaluation_status
    FROM teams t
    JOIN events e ON t.event_id = e.id
    LEFT JOIN submissions s ON s.team_id = t.id
    LEFT JOIN submission_scores ss ON ss.team_id = t.id
    WHERE t.id = $1 OR t.team_code = $1
  `;
  
  const result = await pool.query(query, [teamId]);
  if (result.rowCount === 0) {
    throw new HttpError(404, "Team not found");
  }
  
  res.json({ success: true, data: result.rows[0] });
}
