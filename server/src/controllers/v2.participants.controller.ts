import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../utils/http-error";

export async function getParticipants(req: Request, res: Response) {
  const {
    event_id,
    page = "1",
    limit = "25",
    search = "",
    institution = "",
    submission_status = "",
    evaluation_status = "",
  } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  const params: any[] = [];
  const conditions: string[] = [];
  let paramIndex = 1;

  if (event_id) {
    conditions.push(`t.event_id = $${paramIndex++}`);
    params.push(event_id);
  }

  if (search) {
    conditions.push(`(LOWER(tm.name) LIKE $${paramIndex} OR LOWER(tm.email) LIKE $${paramIndex} OR LOWER(t.name) LIKE $${paramIndex})`);
    params.push(`%${(search as string).toLowerCase()}%`);
    paramIndex++;
  }

  if (institution) {
    conditions.push(`LOWER(t.institution) LIKE $${paramIndex++}`);
    params.push(`%${(institution as string).toLowerCase()}%`);
  }

  if (submission_status) {
    conditions.push(`s.status = $${paramIndex++}`);
    params.push(submission_status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const baseQuery = `
    FROM team_members tm
    JOIN teams t ON t.id = tm.team_id
    LEFT JOIN events e ON e.id = t.event_id
    LEFT JOIN submissions s ON s.team_id = t.id
    ${whereClause}
  `;

  let evalFilter = "";
  if (evaluation_status === "EVALUATED") {
    evalFilter = `AND EXISTS (SELECT 1 FROM scores sc WHERE sc.submission_id = s.id)`;
  } else if (evaluation_status === "PENDING") {
    evalFilter = `AND NOT EXISTS (SELECT 1 FROM scores sc WHERE sc.submission_id = s.id)`;
  }

  const countQuery = `SELECT COUNT(DISTINCT tm.id) AS total ${baseQuery} ${evalFilter ? `AND ${evalFilter.slice(4)}` : ""}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total, 10);

  const query = `
    SELECT
      tm.id AS participant_id,
      tm.name AS participant_name,
      tm.email,
      tm.phone,
      tm.department,
      tm.institution AS participant_institution,
      tm.is_leader,
      t.id AS team_id,
      t.name AS team_name,
      t.institution AS team_institution,
      t.team_code,
      e.id AS event_id,
      e.name AS event_name,
      s.submission_id AS submission_code,
      s.status AS submission_status,
      s.created_at AS submitted_at,
      CASE
        WHEN s.id IS NULL THEN 'NO_SUBMISSION'
        WHEN EXISTS (SELECT 1 FROM scores sc WHERE sc.submission_id = s.id) THEN 'EVALUATED'
        ELSE 'PENDING'
      END AS evaluation_status
    ${baseQuery}
    ORDER BY s.created_at DESC NULLS LAST, tm.name ASC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limitNum, offset);

  const result = await pool.query(query, params);

  res.json({
    success: true,
    data: result.rows,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
}

export async function getParticipant(req: Request, res: Response) {
  const { id } = req.params;

  const query = `
    SELECT
      tm.id AS participant_id,
      tm.name AS participant_name,
      tm.email,
      tm.phone,
      tm.department,
      tm.institution,
      tm.is_leader,
      tm.created_at,
      t.id AS team_id,
      t.name AS team_name,
      t.institution AS team_institution,
      t.team_code,
      e.id AS event_id,
      e.name AS event_name,
      s.submission_id AS submission_code,
      s.repo_url,
      s.status AS submission_status,
      s.created_at AS submitted_at
    FROM team_members tm
    JOIN teams t ON t.id = tm.team_id
    LEFT JOIN events e ON e.id = t.event_id
    LEFT JOIN submissions s ON s.team_id = t.id
    WHERE tm.id = $1
  `;

  const result = await pool.query(query, [id]);
  if (result.rowCount === 0) throw new HttpError(404, "Participant not found");

  res.json({ success: true, data: result.rows[0] });
}
