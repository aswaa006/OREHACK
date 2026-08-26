import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../utils/http-error";

export async function createEvent(req: Request, res: Response) {
  const { name, institution, description, theme, start_date, end_date, registration_start, registration_end, max_team_size } = req.body;

  if (!name) {
    throw new HttpError(400, "Event name is required");
  }

  const result = await pool.query(
    `INSERT INTO events (name, institution, description, theme, start_date, end_date, registration_start, registration_end, max_team_size, status) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'DRAFT') RETURNING *`,
    [
      name, 
      institution ?? null, 
      description ?? null, 
      theme ?? null, 
      start_date ?? null, 
      end_date ?? null, 
      registration_start ?? null, 
      registration_end ?? null, 
      max_team_size || 4
    ]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
}

export async function getEvents(req: Request, res: Response) {
  // If EVENT_ADMIN, maybe only return assigned events, but we'll assume SUPER_ADMIN sees all
  const userRole = req.auth?.role;
  const userId = req.auth?.sub;

  let query = "SELECT * FROM events ORDER BY created_at DESC";
  let params: any[] = [];

  if (userRole === "EVENT_ADMIN") {
    query = `
      SELECT e.* FROM events e 
      JOIN event_admins ea ON e.id = ea.event_id 
      WHERE ea.user_id = $1 ORDER BY e.created_at DESC
    `;
    params = [userId];
  }

  const result = await pool.query(query, params);
  res.json({ success: true, data: result.rows });
}

export async function getEvent(req: Request, res: Response) {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM events WHERE id = $1", [id]);
  
  if (result.rowCount === 0) {
    throw new HttpError(404, "Event not found");
  }

  res.json({ success: true, data: result.rows[0] });
}

export async function getEventStats(req: Request, res: Response) {
  const { id } = req.params;

  const query = `
    SELECT
      e.id,
      e.name,
      e.status,
      COUNT(DISTINCT t.id) AS team_count,
      COUNT(DISTINCT tm.id) AS participant_count,
      COUNT(DISTINCT s.id) AS submission_count,
      COUNT(DISTINCT CASE WHEN EXISTS (SELECT 1 FROM scores sc WHERE sc.submission_id = s.id) THEN s.id END) AS evaluated_count,
      ROUND(AVG(sub_totals.total), 2) AS average_score,
      ROUND(MAX(sub_totals.total), 2) AS highest_score
    FROM events e
    LEFT JOIN teams t ON t.event_id = e.id
    LEFT JOIN team_members tm ON tm.team_id = t.id
    LEFT JOIN submissions s ON s.team_id = t.id
    LEFT JOIN (
      SELECT submission_id, SUM(points) AS total FROM scores GROUP BY submission_id
    ) sub_totals ON sub_totals.submission_id = s.id
    WHERE e.id = $1
    GROUP BY e.id
  `;

  const result = await pool.query(query, [id]);
  if (result.rowCount === 0) throw new HttpError(404, "Event not found");

  res.json({ success: true, data: result.rows[0] });
}

export async function archiveEvent(req: Request, res: Response) {
  const { id } = req.params;
  const result = await pool.query(
    "UPDATE events SET status = 'ARCHIVED', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id]
  );
  if (result.rowCount === 0) throw new HttpError(404, "Event not found");
  res.json({ success: true, data: result.rows[0] });
}

export async function updateEvent(req: Request, res: Response) {
  const { id } = req.params;
  const { name, institution, description, theme, start_date, end_date, registration_start, registration_end, max_team_size, status } = req.body;

  const result = await pool.query(
    `UPDATE events 
     SET name = COALESCE($1, name), 
         institution = COALESCE($2, institution), 
         description = COALESCE($3, description), 
         theme = COALESCE($4, theme), 
         start_date = COALESCE($5, start_date), 
         end_date = COALESCE($6, end_date), 
         registration_start = COALESCE($7, registration_start), 
         registration_end = COALESCE($8, registration_end), 
         max_team_size = COALESCE($9, max_team_size),
         status = COALESCE($10, status),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $11 RETURNING *`,
    [
      name ?? null, 
      institution ?? null, 
      description ?? null, 
      theme ?? null, 
      start_date ?? null, 
      end_date ?? null, 
      registration_start ?? null, 
      registration_end ?? null, 
      max_team_size ?? null, 
      status ?? null, 
      id
    ]
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, "Event not found");
  }

  res.json({ success: true, data: result.rows[0] });
}
