import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { withTransaction } from "../db/transaction";
import { HttpError } from "../utils/http-error";

// Column mapping: Python CLI output → DB category names
const SCORE_COLUMN_MAP: Record<string, string> = {
  tech_scores: "technical",
  innov_scores: "innovation",
  completeness_scores: "completeness",
  // Also accept without underscore
  tech: "technical",
  innov: "innovation",
  completeness: "completeness",
  technical: "technical",
  innovation: "innovation",
};

// Python CLI score columns (in origin results.csv format)
const CLI_SCORE_COLUMNS = ["Tech_Scores", "Innov_Scores", "Completeness_Scores"];
const SCORE_CATEGORY_NAMES = ["technical", "innovation", "completeness"];

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/\s+/g, "_");
}

function resolveCategory(rawKey: string): string | null {
  return SCORE_COLUMN_MAP[normalizeKey(rawKey)] ?? null;
}

function getScoreFromRow(row: any, cliColumn: string): number | null {
  // Try exact, case-insensitive, and normalized versions
  for (const key of Object.keys(row)) {
    if (normalizeKey(key) === normalizeKey(cliColumn)) {
      const val = parseFloat(row[key]);
      return isNaN(val) ? null : val;
    }
  }
  return null;
}

/**
 * Clean participant export for Python CLI
 * Columns: submission_id, teamID, Team_Name, Problem_Statement, Repo_URL, Progress
 * NEVER exports passwords or scores.
 */
export async function exportParticipantsCsv(req: Request, res: Response) {
  const { eventId } = req.params;

  const eventCheck = await pool.query("SELECT id, name FROM events WHERE id = $1", [eventId]);
  if (eventCheck.rowCount === 0) throw new HttpError(404, "Event not found");

  const query = `
    SELECT
      s.submission_id,
      COALESCE(t.team_code, t.id::text) AS "teamID",
      t.name AS "Team_Name",
      s.problem_statement AS "Problem_Statement",
      COALESCE(s.repo_url, '') AS "Repo_URL",
      LOWER(s.status) AS "Progress"
    FROM submissions s
    JOIN teams t ON s.team_id = t.id
    WHERE t.event_id = $1
    ORDER BY s.created_at ASC
  `;

  const result = await pool.query(query, [eventId]);

  const headers = ["submission_id", "teamID", "Team_Name", "Problem_Statement", "Repo_URL", "Progress"];

  function escapeCSV(val: string | null | undefined): string {
    if (val == null) return "";
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  const lines = [headers.join(",")];
  for (const row of result.rows) {
    lines.push([
      escapeCSV(row.submission_id),
      escapeCSV(row.teamID),
      escapeCSV(row.Team_Name),
      escapeCSV(row.Problem_Statement),
      escapeCSV(row.Repo_URL),
      escapeCSV(row.Progress),
    ].join(","));
  }

  const eventName = eventCheck.rows[0].name.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="participants_${eventName}_${Date.now()}.csv"`);
  res.send(lines.join("\n"));
}

/**
 * Preview score import — validates CSV rows against DB without modifying anything
 * Accepts JSON array of rows (frontend parses CSV with PapaParse)
 */
export async function previewScoreImport(req: Request, res: Response) {
  const { eventId } = req.params;
  const rows: any[] = req.body.rows;

  if (!rows || !Array.isArray(rows)) {
    throw new HttpError(400, "rows must be a JSON array");
  }
  if (rows.length === 0) {
    throw new HttpError(400, "CSV appears to be empty");
  }
  if (rows.length > 5000) {
    throw new HttpError(400, "Maximum 5000 rows allowed per import");
  }

  // Validate required columns exist in first row
  const firstRow = rows[0];
  const rowKeys = Object.keys(firstRow).map(normalizeKey);
  if (!rowKeys.includes("submission_id")) {
    throw new HttpError(400, "CSV must have a 'submission_id' column");
  }

  const hasScores = CLI_SCORE_COLUMNS.some((col) =>
    rowKeys.includes(normalizeKey(col))
  );
  if (!hasScores) {
    throw new HttpError(
      400,
      `CSV must have score columns: ${CLI_SCORE_COLUMNS.join(", ")}`
    );
  }

  // Load all submissions for this event
  const dbResult = await pool.query(
    `SELECT s.id, s.submission_id, s.score_locked,
            COALESCE(t.team_code, t.id::text) AS team_code
     FROM submissions s
     JOIN teams t ON s.team_id = t.id
     WHERE t.event_id = $1`,
    [eventId]
  );

  const validSubs = new Map(dbResult.rows.map((r) => [r.submission_id, r]));

  // Check which already have scores
  const scoredResult = await pool.query(
    `SELECT DISTINCT s.submission_id
     FROM scores sc
     JOIN submissions s ON s.id = sc.submission_id
     JOIN teams t ON t.id = s.team_id
     WHERE t.event_id = $1`,
    [eventId]
  );
  const alreadyScored = new Set(scoredResult.rows.map((r) => r.submission_id));

  const preview = {
    totalRows: rows.length,
    valid: 0,
    alreadyEvaluated: 0,
    errors: 0,
    scoreUpdates: 0,
    rows: [] as any[],
  };

  for (const row of rows) {
    const subId = (row.submission_id ?? row.Submission_ID ?? "").trim();
    if (!subId) {
      preview.errors++;
      preview.rows.push({ ...row, _status: "error", _error: "Missing submission_id" });
      continue;
    }

    const dbSub = validSubs.get(subId);
    if (!dbSub) {
      preview.errors++;
      preview.rows.push({ ...row, _status: "error", _error: "Unknown submission_id for this event" });
      continue;
    }

    // Check for protected field modifications (warn but don't block)
    const warnings: string[] = [];
    const PROTECTED_FIELDS = ["Team_Name", "teamID", "Problem_Statement", "Repo_URL"];
    for (const field of PROTECTED_FIELDS) {
      if (row[field] !== undefined) {
        warnings.push(`${field} modification ignored (read-only)`);
      }
    }

    // Parse scores
    const tech = getScoreFromRow(row, "Tech_Scores");
    const innov = getScoreFromRow(row, "Innov_Scores");
    const completeness = getScoreFromRow(row, "Completeness_Scores");
    const totalFromCsv = getScoreFromRow(row, "Total_Scores");
    const reasoning = row.Reasoning ?? row.reasoning ?? "";

    const scoreErrors: string[] = [];
    if (tech === null) scoreErrors.push("Invalid/missing Tech_Scores");
    if (innov === null) scoreErrors.push("Invalid/missing Innov_Scores");
    if (completeness === null) scoreErrors.push("Invalid/missing Completeness_Scores");

    if (scoreErrors.length > 0) {
      preview.errors++;
      preview.rows.push({ ...row, _status: "error", _error: scoreErrors.join("; ") });
      continue;
    }

    const computedTotal = parseFloat(((tech ?? 0) + (innov ?? 0) + (completeness ?? 0)).toFixed(2));
    if (totalFromCsv !== null && Math.abs(totalFromCsv - computedTotal) > 0.5) {
      warnings.push(`Total_Scores in CSV (${totalFromCsv}) differs from computed (${computedTotal}). Computed value will be used.`);
    }

    const isAlreadyScored = alreadyScored.has(subId);
    if (isAlreadyScored) {
      preview.alreadyEvaluated++;
    } else {
      preview.valid++;
    }

    if (dbSub.score_locked) {
      preview.errors++;
      preview.rows.push({ ...row, _status: "locked", _error: "Score is locked by admin" });
    } else {
      preview.scoreUpdates++;
      preview.rows.push({
        submission_id: subId,
        team_code: dbSub.team_code,
        tech_scores: tech,
        innov_scores: innov,
        completeness_scores: completeness,
        computed_total: computedTotal,
        reasoning,
        _status: isAlreadyScored ? "update" : "new",
        _warnings: warnings,
      });
    }
  }

  res.json({ success: true, data: preview });
}

/**
 * Confirm score import — applies validated rows to DB in a transaction
 */
export async function confirmScoreImport(req: Request, res: Response) {
  const { eventId } = req.params;
  const rows: any[] = req.body.rows;
  const fileName: string = req.body.fileName ?? "score_import.csv";
  const userId = req.auth?.sub;

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    throw new HttpError(400, "No rows to import");
  }

  const data = await withTransaction(async (client) => {
    // Create import record
    const importRecord = await client.query(
      `INSERT INTO score_imports (event_id, uploaded_by, file_name, file_name_original, total_rows, status)
       VALUES ($1, $2, $3, $4, $5, 'PROCESSING') RETURNING id`,
      [eventId, userId ?? null, fileName, fileName, rows.length]
    );
    const importId = importRecord.rows[0].id;

    // Ensure score categories exist
    const categoryMap = new Map<string, string>();
    for (const catName of SCORE_CATEGORY_NAMES) {
      let catRes = await client.query(
        "SELECT id FROM score_categories WHERE event_id = $1 AND LOWER(name) = $2",
        [eventId, catName]
      );
      if (catRes.rowCount === 0) {
        const maxPoints = catName === "technical" ? 50 : catName === "innovation" ? 30 : 20;
        catRes = await client.query(
          "INSERT INTO score_categories (event_id, name, max_points) VALUES ($1, $2, $3) RETURNING id",
          [eventId, catName, maxPoints]
        );
      }
      categoryMap.set(catName, catRes.rows[0].id);
    }

    let success = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const subRes = await client.query(
          `SELECT s.id FROM submissions s
           JOIN teams t ON s.team_id = t.id
           WHERE s.submission_id = $1 AND t.event_id = $2 AND s.score_locked = false`,
          [row.submission_id, eventId]
        );

        if (subRes.rowCount === 0) {
          failed++;
          await client.query(
            "INSERT INTO score_import_rows (import_id, submission_id, error_message, status) VALUES ($1, $2, $3, 'FAILED')",
            [importId, row.submission_id, "Submission not found or score locked"]
          );
          continue;
        }

        const subUUID = subRes.rows[0].id;

        // Upsert each category score
        const scoreData: Record<string, number> = {
          technical: row.tech_scores,
          innovation: row.innov_scores,
          completeness: row.completeness_scores,
        };

        for (const [catName, points] of Object.entries(scoreData)) {
          if (typeof points !== "number" || isNaN(points)) continue;
          const catId = categoryMap.get(catName);
          if (!catId) continue;

          await client.query(
            `INSERT INTO scores (submission_id, category_id, points, scored_by)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (submission_id, category_id)
             DO UPDATE SET points = EXCLUDED.points, scored_by = EXCLUDED.scored_by, updated_at = CURRENT_TIMESTAMP`,
            [subUUID, catId, points, userId ?? null]
          );
        }

        // Update reasoning on submission
        if (row.reasoning) {
          await client.query(
            "UPDATE submissions SET reasoning = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [row.reasoning, subUUID]
          );
        }

        success++;
        await client.query(
          "INSERT INTO score_import_rows (import_id, submission_id, row_data, status) VALUES ($1, $2, $3, 'SUCCESS')",
          [importId, row.submission_id, JSON.stringify(row)]
        );
      } catch (err: any) {
        failed++;
        await client.query(
          "INSERT INTO score_import_rows (import_id, submission_id, error_message, status) VALUES ($1, $2, $3, 'FAILED')",
          [importId, row.submission_id, err.message]
        );
      }
    }

    await client.query(
      "UPDATE score_imports SET successful_rows = $1, failed_rows = $2, total_rows = $3, status = 'COMPLETED' WHERE id = $4",
      [success, failed, rows.length, importId]
    );

    // Log to audit
    if (userId) {
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, 'SCORE_IMPORT', 'event', $2, $3)`,
        [userId, eventId, JSON.stringify({ importId, success, failed, fileName })]
      );
    }

    return { importId, success, failed, total: rows.length };
  });

  res.json({ success: true, data });
}

/**
 * Get import history for an event
 */
export async function getImportHistory(req: Request, res: Response) {
  const { eventId } = req.params;
  const { page = "1", limit = "20" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const countResult = await pool.query(
    "SELECT COUNT(*) AS total FROM score_imports WHERE event_id = $1",
    [eventId]
  );

  const query = `
    SELECT
      si.id,
      si.file_name,
      si.file_name_original,
      si.total_rows,
      si.successful_rows,
      si.failed_rows,
      si.status,
      si.created_at,
      u.email AS uploaded_by
    FROM score_imports si
    LEFT JOIN users u ON u.id = si.uploaded_by
    WHERE si.event_id = $1
    ORDER BY si.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [eventId, limitNum, (pageNum - 1) * limitNum]);

  res.json({
    success: true,
    data: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].total, 10),
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(countResult.rows[0].total / limitNum),
    },
  });
}

/**
 * Get single import detail with rows
 */
export async function getImportDetail(req: Request, res: Response) {
  const { importId } = req.params;

  const importResult = await pool.query(
    `SELECT si.*, u.email AS uploaded_by
     FROM score_imports si LEFT JOIN users u ON u.id = si.uploaded_by
     WHERE si.id = $1`,
    [importId]
  );
  if (importResult.rowCount === 0) throw new HttpError(404, "Import not found");

  const rowsResult = await pool.query(
    "SELECT * FROM score_import_rows WHERE import_id = $1 ORDER BY created_at ASC",
    [importId]
  );

  res.json({
    success: true,
    data: {
      import: importResult.rows[0],
      rows: rowsResult.rows,
    },
  });
}
