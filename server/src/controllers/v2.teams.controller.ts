import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../utils/http-error";

export async function getTeams(req: Request, res: Response) {
  const { event_id, page = "1", limit = "20", search = "" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  let whereClause = "";
  const params: any[] = [];
  let paramIndex = 1;

  if (event_id) {
    whereClause += ` WHERE t.event_id = $${paramIndex++}`;
    params.push(event_id);
  }

  if (search) {
    const op = whereClause ? " AND" : " WHERE";
    whereClause += `${op} (LOWER(t.name) LIKE $${paramIndex} OR LOWER(t.institution) LIKE $${paramIndex})`;
    params.push(`%${(search as string).toLowerCase()}%`);
    paramIndex++;
  }

  const countQuery = `SELECT COUNT(DISTINCT t.id) AS total FROM teams t${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].total, 10);

  const query = `
    SELECT
      t.id,
      t.team_code,
      t.name AS team_name,
      t.institution,
      t.department,
      t.created_at,
      e.id AS event_id,
      e.name AS event_name,
      (SELECT m.name FROM team_members m WHERE m.team_id = t.id AND m.is_leader = true LIMIT 1) AS leader_name,
      (SELECT m.email FROM team_members m WHERE m.team_id = t.id AND m.is_leader = true LIMIT 1) AS leader_email,
      COUNT(DISTINCT tm.id) AS member_count,
      s.submission_id AS submission_code,
      s.repo_url,
      s.demo_url,
      s.status AS submission_status,
      s.score_locked,
      CASE WHEN EXISTS (SELECT 1 FROM scores sc WHERE sc.submission_id = s.id) THEN 'EVALUATED' ELSE 'PENDING' END AS evaluation_status,
      COALESCE((SELECT SUM(sc.points) FROM scores sc WHERE sc.submission_id = s.id), 0) AS total_score
    FROM teams t
    LEFT JOIN events e ON e.id = t.event_id
    LEFT JOIN team_members tm ON tm.team_id = t.id
    LEFT JOIN submissions s ON s.team_id = t.id
    ${whereClause}
    GROUP BY t.id, e.id, s.id
    ORDER BY t.created_at DESC
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

export async function getTeam(req: Request, res: Response) {
  const { id } = req.params;

  const teamQuery = `
    SELECT
      t.id,
      t.team_code,
      t.name AS team_name,
      t.institution,
      t.department,
      t.created_at,
      e.id AS event_id,
      e.name AS event_name
    FROM teams t
    LEFT JOIN events e ON e.id = t.event_id
    WHERE t.id = $1
  `;

  const teamResult = await pool.query(teamQuery, [id]);
  if (teamResult.rowCount === 0) throw new HttpError(404, "Team not found");

  const team = teamResult.rows[0];

  // Get members
  const membersResult = await pool.query(
    `SELECT id, name, email, phone, department, institution, is_leader
     FROM team_members WHERE team_id = $1 ORDER BY is_leader DESC, name ASC`,
    [id]
  );

  // Get submission with scores
  const submissionQuery = `
    SELECT
      s.id,
      s.submission_id AS submission_code,
      s.problem_statement,
      s.problem_description,
      s.repo_url,
      s.demo_url,
      s.status,
      s.score_locked,
      s.reasoning,
      s.created_at AS submitted_at
    FROM submissions s
    WHERE s.team_id = $1
    LIMIT 1
  `;
  const subResult = await pool.query(submissionQuery, [id]);
  const submission = subResult.rows[0] || null;

  let scores = null;
  if (submission) {
    const scoresQuery = `
      SELECT
        cat.name AS category,
        sc.points,
        sc.remarks,
        sc.created_at
      FROM scores sc
      JOIN score_categories cat ON cat.id = sc.category_id
      WHERE sc.submission_id = $1
    `;
    const scoresResult = await pool.query(scoresQuery, [submission.id]);
    const scoreMap: Record<string, number> = {};
    let total = 0;
    for (const row of scoresResult.rows) {
      scoreMap[row.category.toLowerCase()] = parseFloat(row.points);
      total += parseFloat(row.points);
    }
    scores = {
      technical: scoreMap["technical"] ?? 0,
      innovation: scoreMap["innovation"] ?? 0,
      completeness: scoreMap["completeness"] ?? 0,
      total: parseFloat(total.toFixed(2)),
      evaluated: (scoresResult.rowCount ?? 0) > 0,
    };
  }

  res.json({
    success: true,
    data: { ...team, members: membersResult.rows, submission, scores },
  });
}

export async function toggleScoreLock(req: Request, res: Response) {
  const { id } = req.params;

  const current = await pool.query(
    "SELECT score_locked FROM submissions WHERE team_id = $1",
    [id]
  );
  if (current.rowCount === 0) throw new HttpError(404, "Submission not found");

  const newLocked = !current.rows[0].score_locked;
  await pool.query(
    "UPDATE submissions SET score_locked = $1 WHERE team_id = $2",
    [newLocked, id]
  );

  res.json({ success: true, data: { score_locked: newLocked } });
}

export async function updateTeamSubmission(req: Request, res: Response) {
  const { id } = req.params;
  const { problem_statement, problem_description, demo_url, repo_url } = req.body;

  const current = await pool.query("SELECT id FROM submissions WHERE team_id = $1", [id]);
  
  if (current.rowCount === 0) {
    // Need to create a submission record if one doesn't exist
    await pool.query(
      `INSERT INTO submissions (team_id, problem_statement, problem_description, demo_url, repo_url, status)
       VALUES ($1, $2, $3, $4, $5, 'SUBMITTED')`,
      [id, problem_statement || '', problem_description || null, demo_url || null, repo_url || null]
    );
  } else {
    // Update existing
    await pool.query(
      `UPDATE submissions 
       SET problem_statement = COALESCE($1, problem_statement),
           problem_description = COALESCE($2, problem_description),
           demo_url = COALESCE($3, demo_url),
           repo_url = COALESCE($4, repo_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE team_id = $5`,
      [problem_statement ?? null, problem_description ?? null, demo_url ?? null, repo_url ?? null, id]
    );
  }

  res.json({ success: true, message: "Submission updated successfully" });
}

export async function evaluateTeam(req: Request, res: Response) {
  const { id } = req.params;
  const { technical, innovation, completeness, reasoning } = req.body;
  const userId = req.auth?.sub;

  const subRes = await pool.query(
    "SELECT s.id, s.score_locked, t.event_id FROM submissions s JOIN teams t ON s.team_id = t.id WHERE s.team_id = $1",
    [id]
  );
  
  if (subRes.rowCount === 0) {
    throw new HttpError(404, "Team has no submission yet");
  }
  
  const sub = subRes.rows[0];
  if (sub.score_locked) {
    throw new HttpError(403, "Cannot evaluate: team score is locked");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Get category IDs
    const SCORE_CATEGORY_NAMES = ["technical", "innovation", "completeness"];
    const categoryMap = new Map<string, string>();
    
    for (const catName of SCORE_CATEGORY_NAMES) {
      let catRes = await client.query(
        "SELECT id FROM score_categories WHERE event_id = $1 AND LOWER(name) = $2",
        [sub.event_id, catName]
      );
      
      if (catRes.rowCount === 0) {
        const maxPoints = catName === "technical" ? 50 : catName === "innovation" ? 30 : 20;
        catRes = await client.query(
          "INSERT INTO score_categories (event_id, name, max_points) VALUES ($1, $2, $3) RETURNING id",
          [sub.event_id, catName, maxPoints]
        );
      }
      categoryMap.set(catName, catRes.rows[0].id);
    }

    const scoreData: Record<string, number | undefined> = {
      technical,
      innovation,
      completeness,
    };

    for (const [catName, points] of Object.entries(scoreData)) {
      if (points === undefined || points === null) continue;
      const catId = categoryMap.get(catName);
      if (!catId) continue;

      await client.query(
        `INSERT INTO scores (submission_id, category_id, points, scored_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (submission_id, category_id)
         DO UPDATE SET points = EXCLUDED.points, scored_by = EXCLUDED.scored_by, updated_at = CURRENT_TIMESTAMP`,
        [sub.id, catId, points, userId ?? null]
      );
    }

    if (reasoning !== undefined) {
      await client.query(
        "UPDATE submissions SET reasoning = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
        [reasoning, sub.id]
      );
    }

    await client.query("COMMIT");
    res.json({ success: true, message: "Team evaluated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
