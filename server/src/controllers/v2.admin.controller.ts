import type { Request, Response } from "express";
import { pool } from "../db/pool";

export async function getDashboardStats(_req: Request, res: Response) {
  const statsQuery = `
    SELECT
      (SELECT COUNT(*) FROM events) AS total_hackathons,
      (SELECT COUNT(*) FROM events WHERE status IN ('REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'EVALUATION')) AS active_hackathons,
      (SELECT COUNT(*) FROM teams) AS total_teams,
      (SELECT COUNT(*) FROM team_members) AS total_participants,
      (SELECT COUNT(*) FROM submissions s
       WHERE NOT EXISTS (SELECT 1 FROM scores sc WHERE sc.submission_id = s.id)) AS pending_evaluation,
      (SELECT COUNT(DISTINCT s.id) FROM submissions s
       WHERE EXISTS (SELECT 1 FROM scores sc WHERE sc.submission_id = s.id)) AS evaluated_teams,
      (SELECT ROUND(AVG(sub_totals.total), 2)
       FROM (
         SELECT s.id, SUM(sc.points) AS total
         FROM submissions s
         JOIN scores sc ON sc.submission_id = s.id
         GROUP BY s.id
       ) sub_totals) AS average_score,
      (SELECT ROUND(MAX(sub_totals.total), 2)
       FROM (
         SELECT s.id, SUM(sc.points) AS total
         FROM submissions s
         JOIN scores sc ON sc.submission_id = s.id
         GROUP BY s.id
       ) sub_totals) AS highest_score
  `;

  const result = await pool.query(statsQuery);
  const stats = result.rows[0];

  res.json({ success: true, data: stats });
}

export async function getActiveHackathons(_req: Request, res: Response) {
  const query = `
    SELECT
      e.id,
      e.name,
      e.institution,
      e.status,
      e.start_date,
      e.end_date,
      e.leaderboard_visible,
      COUNT(DISTINCT t.id) AS team_count,
      COUNT(DISTINCT s.id) AS submission_count,
      COUNT(DISTINCT sc_eval.submission_id) AS evaluated_count
    FROM events e
    LEFT JOIN teams t ON t.event_id = e.id
    LEFT JOIN submissions s ON s.team_id = t.id
    LEFT JOIN (
      SELECT DISTINCT submission_id FROM scores
    ) sc_eval ON sc_eval.submission_id = s.id
    WHERE e.status IN ('REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'EVALUATION')
    GROUP BY e.id
    ORDER BY e.created_at DESC
  `;

  const result = await pool.query(query);
  res.json({ success: true, data: result.rows });
}

export async function getRecentSubmissions(_req: Request, res: Response) {
  const query = `
    SELECT
      s.submission_id,
      s.created_at AS submitted_at,
      s.status,
      t.name AS team_name,
      t.institution,
      t.team_code,
      e.name AS event_name,
      CASE
        WHEN EXISTS (SELECT 1 FROM scores sc WHERE sc.submission_id = s.id) THEN 'EVALUATED'
        ELSE 'PENDING'
      END AS evaluation_status
    FROM submissions s
    JOIN teams t ON s.team_id = t.id
    JOIN events e ON t.event_id = e.id
    ORDER BY s.created_at DESC
    LIMIT 10
  `;

  const result = await pool.query(query);
  res.json({ success: true, data: result.rows });
}

export async function getRecentActivity(_req: Request, res: Response) {
  const query = `
    SELECT
      al.id,
      al.action,
      al.entity_type,
      al.entity_id,
      al.details,
      al.created_at,
      u.email AS user_email
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ORDER BY al.created_at DESC
    LIMIT 20
  `;

  const result = await pool.query(query);
  res.json({ success: true, data: result.rows });
}
