import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { withTransaction } from "../db/transaction";
import { HttpError } from "../utils/http-error";

// Generate a random permanent ID, e.g. SUB-2026-000001
async function generateSubmissionId(client: any): Promise<string> {
  const year = new Date().getFullYear();
  let unique = false;
  let id = "";
  
  while (!unique) {
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    id = `SUB-${year}-${randomNum}`;
    const result = await client.query("SELECT id FROM submissions WHERE submission_id = $1", [id]);
    if (result.rowCount === 0) {
      unique = true;
    }
  }
  return id;
}

export async function createSubmission(req: Request, res: Response) {
  const { event_id, team_name, institution, department, team_size, leader, members, problem_statement, problem_description, repo_url, demo_url, ppt_url } = req.body;

  if (!event_id || !team_name || !leader || !problem_statement) {
    throw new HttpError(400, "Missing required fields");
  }

  const data = await withTransaction(async (client) => {
    // Check if team already exists for this event
    const existingTeam = await client.query("SELECT id FROM teams WHERE event_id = $1 AND name = $2", [event_id, team_name]);
    if ((existingTeam.rowCount ?? 0) > 0) {
      throw new HttpError(400, "Team name already exists for this hackathon");
    }

    // 1. Create Team
    const teamResult = await client.query(
      `INSERT INTO teams (event_id, name, institution, department) VALUES ($1, $2, $3, $4) RETURNING *`,
      [event_id, team_name, institution, department]
    );
    const team = teamResult.rows[0];

    // 2. Create Leader
    await client.query(
      `INSERT INTO team_members (team_id, name, email, phone, department, institution, is_leader) VALUES ($1, $2, $3, $4, $5, $6, true)`,
      [team.id, leader.name, leader.email, leader.phone, leader.department, leader.institution]
    );

    // 3. Create Members
    if (members && Array.isArray(members)) {
      for (const member of members) {
        if (member.name && member.email) {
          await client.query(
            `INSERT INTO team_members (team_id, name, email, phone, department, institution, is_leader) VALUES ($1, $2, $3, $4, $5, $6, false)`,
            [team.id, member.name, member.email, member.phone, member.department, member.institution]
          );
        }
      }
    }

    // 4. Generate Submission ID & Create Submission
    const submissionId = await generateSubmissionId(client);
    const subResult = await client.query(
      `INSERT INTO submissions (submission_id, team_id, problem_statement, problem_description, repo_url, demo_url, ppt_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [submissionId, team.id, problem_statement, problem_description, repo_url, demo_url, ppt_url]
    );

    return {
      team,
      submission: subResult.rows[0]
    };
  });

  res.status(201).json({ success: true, data });
}

export async function getSubmissions(req: Request, res: Response) {
  // Can filter by event_id query param
  const eventId = req.query.event_id;
  
  let query = `
    SELECT s.*, t.name as team_name, t.institution as team_institution, e.name as event_name 
    FROM submissions s
    JOIN teams t ON s.team_id = t.id
    JOIN events e ON t.event_id = e.id
  `;
  const params: any[] = [];
  
  if (eventId) {
    query += ` WHERE t.event_id = $1`;
    params.push(eventId);
  }
  
  query += ` ORDER BY s.created_at DESC`;
  
  const result = await pool.query(query, params);
  res.json({ success: true, data: result.rows });
}
