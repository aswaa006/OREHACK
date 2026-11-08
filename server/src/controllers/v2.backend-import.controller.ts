import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { withTransaction } from "../db/transaction";
import { HttpError } from "../utils/http-error";

const SCORE_CATEGORY_NAMES = ["technical", "innovation", "completeness"];

type ImportMode = "production" | "dev";

function normalizeKey(key: string): string {
  return key.trim().toLowerCase().replace(/[\s_]+/g, "_");
}

function getFromRow(row: any, ...candidates: string[]): string | null {
  for (const key of Object.keys(row)) {
    if (candidates.some((c) => normalizeKey(key) === normalizeKey(c))) {
      const v = row[key];
      if (v === null || v === undefined || String(v).trim() === "") return null;
      return String(v).trim();
    }
  }
  return null;
}

function getScoreFromRow(row: any, ...candidates: string[]): number | null {
  const raw = getFromRow(row, ...candidates);
  if (raw === null) return null;
  const val = parseFloat(raw);
  return isNaN(val) ? null : val;
}

/**
 * Preview backend CSV import
 * Matches by teamID (team_code) within a hackathon.
 * mode=production → only scores + reasoning
 * mode=dev → also updates team name, institution, problem statement, repo URL, progress
 */
export async function previewBackendImport(req: Request, res: Response) {
  const { eventId } = req.params;
  const rows: any[] = req.body.rows;
  const mode: ImportMode = req.body.mode === "dev" ? "dev" : "production";

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    throw new HttpError(400, "rows must be a non-empty JSON array");
  }
  if (rows.length > 5000) {
    throw new HttpError(400, "Maximum 5000 rows per import");
  }

  const eventCheck = await pool.query(
    "SELECT id, name FROM events WHERE id = $1",
    [eventId]
  );
  if (eventCheck.rowCount === 0) throw new HttpError(404, "Event not found");

  const firstRow = rows[0];
  const hasTeamId = Object.keys(firstRow).some((k) => normalizeKey(k) === "teamid");
  if (!hasTeamId) {
    throw new HttpError(400, "CSV must have a 'teamID' column");
  }

  // Load all teams + submissions for this event, keyed by team_code
  const dbResult = await pool.query(
    `SELECT t.id AS team_id, t.name AS team_name, t.institution,
            COALESCE(t.team_code, t.id::text) AS team_code,
            s.id AS submission_id, s.score_locked,
            s.problem_statement, s.repo_url, s.status
     FROM teams t
     LEFT JOIN submissions s ON s.team_id = t.id
     WHERE t.event_id = $1`,
    [eventId]
  );

  const teamsByCode = new Map(dbResult.rows.map((r) => [r.team_code, r]));

  // Check which already have scores
  const scoredResult = await pool.query(
    `SELECT DISTINCT COALESCE(t.team_code, t.id::text) AS team_code
     FROM scores sc
     JOIN submissions s ON s.id = sc.submission_id
     JOIN teams t ON t.id = s.team_id
     WHERE t.event_id = $1`,
    [eventId]
  );
  const alreadyScored = new Set(scoredResult.rows.map((r) => r.team_code));

  const preview = {
    totalRows: rows.length,
    valid: 0,
    alreadyEvaluated: 0,
    errors: 0,
    skippedNoScores: 0,
    mode,
    rows: [] as any[],
  };

  for (const row of rows) {
    const teamId = getFromRow(row, "teamID", "team_id");
    if (!teamId) {
      preview.errors++;
      preview.rows.push({ ...row, _status: "error", _error: "Missing teamID" });
      continue;
    }

    // DEV-mode extra fields
    const csvTeamName = getFromRow(row, "Team_Name", "team_name");
    const csvInstitution = getFromRow(row, "Institution", "institution");
    const csvProblemStatement = getFromRow(row, "Problem_Statement", "problem_statement");
    const csvRepoUrl = getFromRow(row, "Repo_URL", "repo_url");
    const csvProgress = getFromRow(row, "Progress", "progress");

    let dbTeam = teamsByCode.get(teamId);
    let isNewTeam = false;

    if (!dbTeam) {
      if (mode === "dev") {
        isNewTeam = true;
        dbTeam = {
          team_id: null,
          team_name: csvTeamName || teamId,
          institution: csvInstitution || null,
          team_code: teamId,
          submission_id: null,
          score_locked: false,
          problem_statement: null,
          repo_url: null,
          status: "queued"
        };
      } else {
        preview.errors++;
        preview.rows.push({ ...row, _status: "error", _error: `Team '${teamId}' not found in this hackathon` });
        continue;
      }
    }

    if (!dbTeam.submission_id && mode !== "dev") {
      preview.errors++;
      preview.rows.push({ ...row, _status: "error", _error: `Team '${teamId}' has no submission yet` });
      continue;
    }

    if (dbTeam.score_locked) {
      preview.errors++;
      preview.rows.push({ ...row, _status: "locked", _error: "Score is locked by admin" });
      continue;
    }

    // Parse scores — null means skip that category
    const tech = getScoreFromRow(row, "Tech_Scores", "tech_scores", "technical");
    const innov = getScoreFromRow(row, "Innov_Scores", "innov_scores", "innovation");
    const completeness = getScoreFromRow(row, "Completeness_Scores", "completeness_scores", "completeness");
    const reasoning = getFromRow(row, "Reasoning", "reasoning") ?? "";

    // Determine what will actually change in dev mode
    const devChanges: string[] = [];
    if (mode === "dev") {
      if (isNewTeam) {
        devChanges.push("New team + submission will be created");
      } else {
        if (csvTeamName && csvTeamName !== dbTeam.team_name) devChanges.push(`Name: "${dbTeam.team_name}" → "${csvTeamName}"`);
        if (csvInstitution && csvInstitution !== dbTeam.institution) devChanges.push(`Institution updated`);
        if (csvProblemStatement && csvProblemStatement !== dbTeam.problem_statement) devChanges.push(`Problem statement updated`);
        if (csvRepoUrl && csvRepoUrl !== dbTeam.repo_url) devChanges.push(`Repo URL updated`);
        if (csvProgress && csvProgress !== dbTeam.status) devChanges.push(`Status: "${dbTeam.status}" → "${csvProgress}"`);
      }
    }

    // If no scores AND no dev changes → skip row
    const hasScores = tech !== null || innov !== null || completeness !== null || reasoning;
    const hasDevChanges = mode === "dev" && devChanges.length > 0;
    if (!hasScores && !hasDevChanges) {
      preview.skippedNoScores++;
      preview.rows.push({ ...row, _status: "skip", _error: "Nothing to update — all cells blank" });
      continue;
    }

    const computedTotal = parseFloat(((tech ?? 0) + (innov ?? 0) + (completeness ?? 0)).toFixed(2));
    const isAlreadyScored = alreadyScored.has(teamId);
    if (isAlreadyScored) {
      preview.alreadyEvaluated++;
    } else {
      preview.valid++;
    }

    preview.rows.push({
      team_code: teamId,
      team_name: dbTeam.team_name,
      submission_id: dbTeam.submission_id,
      team_uuid: dbTeam.team_id,
      tech_scores: tech,
      innov_scores: innov,
      completeness_scores: completeness,
      computed_total: hasScores ? computedTotal : null,
      reasoning,
      // Dev-mode fields
      csv_team_name: csvTeamName,
      csv_institution: csvInstitution,
      csv_problem_statement: csvProblemStatement,
      csv_repo_url: csvRepoUrl,
      csv_progress: csvProgress,
      dev_changes: devChanges,
      _status: isAlreadyScored ? "update" : "new",
      _mode: mode,
    });
  }

  res.json({ success: true, data: preview });
}

/**
 * Confirm backend CSV import — applies rows to DB
 * mode=production → only scores + reasoning
 * mode=dev → also updates teams + submissions fields
 */
export async function confirmBackendImport(req: Request, res: Response) {
  const { eventId } = req.params;
  const rows: any[] = req.body.rows;
  const fileName: string = req.body.fileName ?? "backend_import.csv";
  const mode: ImportMode = req.body.mode === "dev" ? "dev" : "production";
  const userId = req.auth?.sub;

  if (!rows || !Array.isArray(rows) || rows.length === 0) {
    throw new HttpError(400, "No rows to import");
  }

  const data = await withTransaction(async (client) => {
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

    let rowIndex = 0;
    for (const row of rows) {
      rowIndex++;
      const sp = `row_${rowIndex}`;
      await client.query(`SAVEPOINT ${sp}`);
      try {
        let subUUID = row.submission_id;
        let teamUUID = row.team_uuid;

        // Verify not locked if submission exists
        if (subUUID) {
          const lockCheck = await client.query(
            "SELECT id FROM submissions WHERE id = $1 AND score_locked = false",
            [subUUID]
          );
          if (lockCheck.rowCount === 0) {
            failed++;
            await client.query(
              "INSERT INTO score_import_rows (import_id, submission_id, error_message, status) VALUES ($1, $2, $3, 'FAILED')",
              [importId, row.team_code, "Submission not found or score locked"]
            ).catch(() => {});
            continue;
          }
        }

        // ── DEV MODE: also update teams + submissions fields (or create new) ──────────────
        if (mode === "dev") {
          if (!teamUUID) {
            // CREATE TEAM
            const newTeam = await client.query(
              `INSERT INTO teams (event_id, name, institution, team_code) 
               VALUES ($1, $2, $3, $4) RETURNING id`,
              [eventId, row.csv_team_name || row.team_code, row.csv_institution || null, row.team_code]
            );
            teamUUID = newTeam.rows[0].id;
            row.team_uuid = teamUUID;
          } else {
            // Update teams table
            const teamUpdates: string[] = [];
            const teamParams: any[] = [];
            if (row.csv_team_name) {
              teamUpdates.push(`name = $${teamUpdates.length + 2}`);
              teamParams.push(row.csv_team_name);
            }
            if (row.csv_institution) {
              teamUpdates.push(`institution = $${teamUpdates.length + 2}`);
              teamParams.push(row.csv_institution);
            }
            if (teamUpdates.length > 0) {
              await client.query(
                `UPDATE teams SET ${teamUpdates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [teamUUID, ...teamParams]
              );
            }
          }

          if (!subUUID) {
            // CREATE SUBMISSION
            const statusMap: Record<string, string> = {
              completed: "completed", done: "completed",
              processing: "processing", queued: "queued",
              rejected: "rejected", pending: "queued",
            };
            const prog = row.csv_progress ? row.csv_progress.toLowerCase() : "completed"; // Default to completed if scores exist
            const normalizedStatus = statusMap[prog] ?? "completed";

            const newSub = await client.query(
              `INSERT INTO submissions (team_id, submission_id, problem_statement, repo_url, status)
               VALUES ($1, $2, $3, $4, $5) RETURNING id`,
              [
                teamUUID,
                `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                row.csv_problem_statement ? row.csv_problem_statement.substring(0, 255) : 'Imported Team',
                row.csv_repo_url || null,
                normalizedStatus
              ]
            );
            subUUID = newSub.rows[0].id;
            row.submission_id = subUUID;
          } else {
            // Update submissions table
            const subUpdates: string[] = [];
            const subParams: any[] = [];
            if (row.csv_problem_statement) {
              subUpdates.push(`problem_statement = $${subUpdates.length + 2}`);
              subParams.push(row.csv_problem_statement.substring(0, 255));
            }
            if (row.csv_repo_url) {
              subUpdates.push(`repo_url = $${subUpdates.length + 2}`);
              subParams.push(row.csv_repo_url);
            }
            if (row.csv_progress) {
              // Normalize to valid status values
              const statusMap: Record<string, string> = {
                completed: "completed", done: "completed",
                processing: "processing", queued: "queued",
                rejected: "rejected", pending: "queued",
              };
              const normalized = statusMap[row.csv_progress.toLowerCase()] ?? row.csv_progress.toLowerCase();
              subUpdates.push(`status = $${subUpdates.length + 2}`);
              subParams.push(normalized);
            }
            if (subUpdates.length > 0) {
              await client.query(
                `UPDATE submissions SET ${subUpdates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [subUUID, ...subParams]
              );
            }
          }
        }

        if (!subUUID) { failed++; continue; }

        // ── SCORES (both modes) ───────────────────────────────────────────
        const scoreData: Record<string, number | null> = {
          technical: row.tech_scores,
          innovation: row.innov_scores,
          completeness: row.completeness_scores,
        };
        for (const [catName, points] of Object.entries(scoreData)) {
          if (points === null || points === undefined || isNaN(points as number)) continue;
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

        // Reasoning (both modes)
        if (row.reasoning && row.reasoning.trim()) {
          await client.query(
            "UPDATE submissions SET reasoning = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [row.reasoning.trim(), subUUID]
          );
        }

        success++;
        await client.query(
          "INSERT INTO score_import_rows (import_id, submission_id, row_data, status) VALUES ($1, $2, $3, 'SUCCESS')",
          [importId, row.team_code, JSON.stringify(row)]
        );
        await client.query(`RELEASE SAVEPOINT ${sp}`);
      } catch (err: any) {
        await client.query(`ROLLBACK TO SAVEPOINT ${sp}`);
        failed++;
        await client.query(
          "INSERT INTO score_import_rows (import_id, submission_id, error_message, status) VALUES ($1, $2, $3, 'FAILED')",
          [importId, row.team_code, err.message]
        ).catch(() => {});
      }
    }

    await client.query(
      "UPDATE score_imports SET successful_rows = $1, failed_rows = $2, total_rows = $3, status = 'COMPLETED' WHERE id = $4",
      [success, failed, rows.length, importId]
    );

    if (userId) {
      await client.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES ($1, 'BACKEND_IMPORT', 'event', $2, $3)`,
        [userId, eventId, JSON.stringify({ importId, success, failed, fileName, mode })]
      );
    }

    return { importId, success, failed, total: rows.length, mode };
  });

  res.json({ success: true, data });
}
