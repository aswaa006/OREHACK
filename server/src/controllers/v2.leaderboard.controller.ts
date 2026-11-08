import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../utils/http-error";

export async function getLeaderboard(req: Request, res: Response) {
  const { eventId } = req.params;

  const query = `
    SELECT
      t.id AS team_id,
      t.team_code,
      t.name AS team_name,
      t.institution,
      s.submission_id AS submission_code,
      s.repo_url,
      s.score_locked,
      COALESCE(SUM(sc.points), 0) AS total_score,
      COALESCE(MAX(CASE WHEN LOWER(cat.name) = 'technical' THEN sc.points END), 0) AS technical_score,
      COALESCE(MAX(CASE WHEN LOWER(cat.name) = 'innovation' THEN sc.points END), 0) AS innovation_score,
      COALESCE(MAX(CASE WHEN LOWER(cat.name) = 'completeness' THEN sc.points END), 0) AS completeness_score,
      CASE WHEN COUNT(sc.id) > 0 THEN 'EVALUATED' ELSE 'PENDING' END AS evaluation_status
    FROM teams t
    JOIN events e ON e.id = t.event_id
    JOIN submissions s ON s.team_id = t.id
    LEFT JOIN scores sc ON sc.submission_id = s.id
    LEFT JOIN score_categories cat ON cat.id = sc.category_id
    WHERE e.id = $1
    GROUP BY t.id, t.team_code, t.name, t.institution, s.submission_id, s.repo_url, s.score_locked
    ORDER BY total_score DESC, t.name ASC
  `;

  const result = await pool.query(query, [eventId]);

  // Add rank with tie handling (teams with same score share rank)
  let rank = 1;
  let prevScore: number | null = null;
  let rankCount = 0;

  const ranked = result.rows.map((row, index) => {
    const score = parseFloat(row.total_score);
    if (score !== prevScore) {
      rank = index + 1;
      prevScore = score;
    }
    rankCount++;
    return { ...row, rank };
  });

  // Get event visibility
  const eventResult = await pool.query("SELECT leaderboard_visible FROM events WHERE id = $1", [eventId]);
  if (eventResult.rowCount === 0) throw new HttpError(404, "Event not found");

  res.json({
    success: true,
    data: {
      teams: ranked,
      leaderboard_visible: eventResult.rows[0].leaderboard_visible,
      total: ranked.length,
    },
  });
}

export async function toggleLeaderboardVisibility(req: Request, res: Response) {
  const { eventId } = req.params;

  const current = await pool.query("SELECT leaderboard_visible FROM events WHERE id = $1", [eventId]);
  if (current.rowCount === 0) throw new HttpError(404, "Event not found");

  const newVisible = !current.rows[0].leaderboard_visible;
  await pool.query("UPDATE events SET leaderboard_visible = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [
    newVisible,
    eventId,
  ]);

  res.json({ success: true, data: { leaderboard_visible: newVisible } });
}
