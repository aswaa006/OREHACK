import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../utils/http-error";

// Helper to escape CSV values
function escapeCSV(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsvRow(values: (string | number | null | undefined)[]): string {
  return values.map((v) => escapeCSV(String(v ?? ""))).join(",");
}

/**
 * CLEAN PARTICIPANT EXPORT — for Python CLI input
 * Columns: submission_id, teamID, Team_Name, Problem_Statement, Repo_URL, Progress
 * NEVER exports passwords or scores.
 */
export async function exportParticipantsCsv(req: Request, res: Response) {
  const { eventId } = req.params;

  // Verify event exists
  const eventCheck = await pool.query("SELECT id, name FROM events WHERE id = $1", [eventId]);
  if (eventCheck.rowCount === 0) throw new HttpError(404, "Event not found");
  const eventName = eventCheck.rows[0].name;

  const query = `
    SELECT
      s.submission_id,
      COALESCE(t.team_code, t.id::text) AS team_id,
      t.name AS team_name,
      s.problem_statement,
      COALESCE(s.repo_url, '') AS repo_url,
      LOWER(s.status) AS progress
    FROM submissions s
    JOIN teams t ON s.team_id = t.id
    WHERE t.event_id = $1
    ORDER BY s.created_at ASC
  `;

  const result = await pool.query(query, [eventId]);

  const headers = ["submission_id", "teamID", "Team_Name", "Problem_Statement", "Repo_URL", "Progress"];
  const lines: string[] = [headers.join(",")];

  for (const row of result.rows) {
    lines.push(
      buildCsvRow([
        row.submission_id,
        row.team_id,
        row.team_name,
        row.problem_statement,
        row.repo_url,
        row.progress,
      ])
    );
  }

  const csvContent = lines.join("\n");
  const safeEventName = eventName.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="participants_${safeEventName}_${Date.now()}.csv"`);
  res.send(csvContent);
}

/**
 * EVALUATION EXPORT — includes all scores + reasoning (no passwords)
 */
export async function exportEvaluationCsv(req: Request, res: Response) {
  const { eventId } = req.params;

  const eventCheck = await pool.query("SELECT id, name FROM events WHERE id = $1", [eventId]);
  if (eventCheck.rowCount === 0) throw new HttpError(404, "Event not found");
  const eventName = eventCheck.rows[0].name;

  const query = `
    SELECT
      s.submission_id,
      COALESCE(t.team_code, t.id::text) AS team_id,
      t.name AS team_name,
      t.institution,
      s.problem_statement,
      COALESCE(s.repo_url, '') AS repo_url,
      LOWER(s.status) AS progress,
      COALESCE((
        SELECT sc.points::text FROM scores sc
        JOIN score_categories cat ON cat.id = sc.category_id
        WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'technical' LIMIT 1
      ), '') AS tech_scores,
      COALESCE((
        SELECT sc.points::text FROM scores sc
        JOIN score_categories cat ON cat.id = sc.category_id
        WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'innovation' LIMIT 1
      ), '') AS innov_scores,
      COALESCE((
        SELECT sc.points::text FROM scores sc
        JOIN score_categories cat ON cat.id = sc.category_id
        WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'completeness' LIMIT 1
      ), '') AS completeness_scores,
      COALESCE((
        SELECT SUM(sc.points)::text FROM scores sc
        WHERE sc.submission_id = s.id
      ), '') AS total_scores,
      COALESCE(s.reasoning, '') AS reasoning
    FROM submissions s
    JOIN teams t ON s.team_id = t.id
    WHERE t.event_id = $1
    ORDER BY (SELECT SUM(sc.points) FROM scores sc WHERE sc.submission_id = s.id) DESC NULLS LAST
  `;

  const result = await pool.query(query, [eventId]);

  const headers = [
    "submission_id", "teamID", "Team_Name", "Institution", "Problem_Statement",
    "Repo_URL", "Progress", "Tech_Scores", "Innov_Scores", "Completeness_Scores",
    "Total_Scores", "Reasoning"
  ];
  const lines: string[] = [headers.join(",")];

  for (const row of result.rows) {
    lines.push(
      buildCsvRow([
        row.submission_id, row.team_id, row.team_name, row.institution,
        row.problem_statement, row.repo_url, row.progress,
        row.tech_scores, row.innov_scores, row.completeness_scores,
        row.total_scores, row.reasoning,
      ])
    );
  }

  const csvContent = lines.join("\n");
  const safeEventName = eventName.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="evaluation_${safeEventName}_${Date.now()}.csv"`);
  res.send(csvContent);
}

/**
 * LEADERBOARD EXPORT — ranked teams, no passwords
 */
export async function exportLeaderboardCsv(req: Request, res: Response) {
  const { eventId } = req.params;

  const eventCheck = await pool.query("SELECT id, name FROM events WHERE id = $1", [eventId]);
  if (eventCheck.rowCount === 0) throw new HttpError(404, "Event not found");
  const eventName = eventCheck.rows[0].name;

  const query = `
    SELECT
      t.name AS team_name,
      t.institution,
      COALESCE(t.team_code, t.id::text) AS team_id,
      s.submission_id,
      COALESCE(SUM(sc.points), 0) AS total_score,
      COALESCE(MAX(CASE WHEN LOWER(cat.name) = 'technical' THEN sc.points END), 0) AS technical_score,
      COALESCE(MAX(CASE WHEN LOWER(cat.name) = 'innovation' THEN sc.points END), 0) AS innovation_score,
      COALESCE(MAX(CASE WHEN LOWER(cat.name) = 'completeness' THEN sc.points END), 0) AS completeness_score
    FROM teams t
    JOIN events e ON e.id = t.event_id
    JOIN submissions s ON s.team_id = t.id
    LEFT JOIN scores sc ON sc.submission_id = s.id
    LEFT JOIN score_categories cat ON cat.id = sc.category_id
    WHERE e.id = $1 AND EXISTS (SELECT 1 FROM scores sc2 WHERE sc2.submission_id = s.id)
    GROUP BY t.id, t.name, t.institution, t.team_code, s.submission_id
    ORDER BY total_score DESC, t.name ASC
  `;

  const result = await pool.query(query, [eventId]);

  // Add ranks with tie handling
  let rank = 1;
  let prevScore: number | null = null;

  const headers = ["Rank", "Team_Name", "Institution", "Technical", "Innovation", "Completeness", "Total_Score"];
  const lines: string[] = [headers.join(",")];

  result.rows.forEach((row, index) => {
    const score = parseFloat(row.total_score);
    if (score !== prevScore) {
      rank = index + 1;
      prevScore = score;
    }
    lines.push(
      buildCsvRow([
        rank, row.team_name, row.institution,
        row.technical_score, row.innovation_score, row.completeness_score, row.total_score,
      ])
    );
  });

  const csvContent = lines.join("\n");
  const safeEventName = eventName.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="leaderboard_${safeEventName}_${Date.now()}.csv"`);
  res.send(csvContent);
}

/**
 * BACKEND EXPORT — structured for Python backend
 */
export async function exportBackendCsv(req: Request, res: Response) {
  const { eventId } = req.params;

  const eventCheck = await pool.query("SELECT id, name FROM events WHERE id = $1", [eventId]);
  if (eventCheck.rowCount === 0) throw new HttpError(404, "Event not found");
  const eventName = eventCheck.rows[0].name;

  const query = `
    SELECT
      COALESCE(t.team_code, t.id::text) AS team_id,
      t.name AS team_name,
      COALESCE(s.problem_statement, '') AS problem_statement,
      COALESCE(s.repo_url, '') AS repo_url,
      COALESCE(LOWER(s.status), 'queued') AS progress,
      COALESCE((
        SELECT SUM(sc.points)::text FROM scores sc
        WHERE sc.submission_id = s.id
      ), '') AS total_scores,
      COALESCE((
        SELECT sc.points::text FROM scores sc
        JOIN score_categories cat ON cat.id = sc.category_id
        WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'technical' LIMIT 1
      ), '') AS tech_scores,
      COALESCE((
        SELECT sc.points::text FROM scores sc
        JOIN score_categories cat ON cat.id = sc.category_id
        WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'innovation' LIMIT 1
      ), '') AS innov_scores,
      COALESCE((
        SELECT sc.points::text FROM scores sc
        JOIN score_categories cat ON cat.id = sc.category_id
        WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'completeness' LIMIT 1
      ), '') AS completeness_scores,
      COALESCE(s.reasoning, '') AS reasoning,
      COALESCE((
        SELECT m.email FROM team_members m
        WHERE m.team_id = t.id AND m.is_leader = true
        LIMIT 1
      ), '') AS password
    FROM teams t
    LEFT JOIN submissions s ON s.team_id = t.id
    WHERE t.event_id = $1
    ORDER BY t.created_at ASC
  `;

  const result = await pool.query(query, [eventId]);

  const headers = [
    "teamID", "Team_Name", "Problem_Statement", "Repo_URL", "Progress",
    "Total_Scores", "Tech_Scores", "Innov_Scores", "Completeness_Scores",
    "Reasoning", "password"
  ];
  const lines: string[] = [headers.join(",")];

  for (const row of result.rows) {
    lines.push(
      buildCsvRow([
        row.team_id, row.team_name, row.problem_statement, row.repo_url,
        row.progress, row.total_scores, row.tech_scores, row.innov_scores,
        row.completeness_scores, row.reasoning, row.password,
      ])
    );
  }

  const csvContent = lines.join("\n");
  const safeEventName = eventName.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="backend_${safeEventName}_${Date.now()}.csv"`);
  res.send(csvContent);
}

export async function getBackendExportData(req: Request, res: Response) {
  const { eventId } = req.params;

  const eventCheck = await pool.query("SELECT id, name FROM events WHERE id = $1", [eventId]);
  if (eventCheck.rowCount === 0) throw new HttpError(404, "Event not found");

  const query = `
    SELECT
      COALESCE(t.team_code, t.id::text) AS "teamID",
      t.name AS "Team_Name",
      COALESCE(s.problem_statement, '') AS "Problem_Statement",
      COALESCE(s.repo_url, '') AS "Repo_URL",
      COALESCE(LOWER(s.status), 'queued') AS "Progress",
      COALESCE((
        SELECT SUM(sc.points)::text FROM scores sc
        WHERE sc.submission_id = s.id
      ), '') AS "Total_Scores",
      COALESCE((
        SELECT sc.points::text FROM scores sc
        JOIN score_categories cat ON cat.id = sc.category_id
        WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'technical' LIMIT 1
      ), '') AS "Tech_Scores",
      COALESCE((
        SELECT sc.points::text FROM scores sc
        JOIN score_categories cat ON cat.id = sc.category_id
        WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'innovation' LIMIT 1
      ), '') AS "Innov_Scores",
      COALESCE((
        SELECT sc.points::text FROM scores sc
        JOIN score_categories cat ON cat.id = sc.category_id
        WHERE sc.submission_id = s.id AND LOWER(cat.name) = 'completeness' LIMIT 1
      ), '') AS "Completeness_Scores",
      COALESCE(s.reasoning, '') AS "Reasoning",
      COALESCE((
        SELECT m.email FROM team_members m
        WHERE m.team_id = t.id AND m.is_leader = true
        LIMIT 1
      ), '') AS "password"
    FROM teams t
    LEFT JOIN submissions s ON s.team_id = t.id
    WHERE t.event_id = $1
    ORDER BY t.created_at ASC
  `;

  const result = await pool.query(query, [eventId]);
  res.json({ data: result.rows });
}
