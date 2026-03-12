import "dotenv/config";
import cors from "cors";
import express from "express";
import { closePool, databaseConfig, getPool, initDatabase } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

function asyncRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  };
}

async function writeLog(message, level = "info") {
  const pool = getPool();
  await pool.query("INSERT INTO orehack_system_logs (level, message) VALUES ($1, $2)", [level, message]);
}

app.get(
  "/api/health",
  asyncRoute(async (_req, res) => {
    const pool = getPool();
    await pool.query("SELECT 1");
    res.json({ ok: true });
  }),
);

app.get(
  "/api/hackathons",
  asyncRoute(async (_req, res) => {
    const pool = getPool();
    const result = await pool.query(`
      SELECT
        id,
        name,
        status,
        participants,
        deadline_text AS deadline
      FROM orehack_hackathons
      ORDER BY
        CASE status
          WHEN 'Live' THEN 1
          WHEN 'Upcoming' THEN 2
          ELSE 3
        END,
        name;
    `);
    res.json(result.rows);
  }),
);

app.post(
  "/api/hackathons/:hackathonId/team-login",
  asyncRoute(async (req, res) => {
    const pool = getPool();
    const { hackathonId } = req.params;
    const { teamId, password } = req.body || {};

    if (!teamId || !password) {
      return res.status(400).json({ message: "teamId and password are required" });
    }

    const team = await pool.query(
      `
      SELECT team_id
      FROM orehack_teams
      WHERE hackathon_id = $1
        AND lower(team_id) = lower($2)
        AND password = $3
      LIMIT 1;
      `,
      [hackathonId, String(teamId).trim(), String(password)],
    );

    if (team.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    await writeLog(`Team login success: ${team.rows[0].team_id} (${hackathonId})`);
    return res.json({ ok: true, teamId: team.rows[0].team_id });
  }),
);

app.get(
  "/api/hackathons/:hackathonId/submissions",
  asyncRoute(async (req, res) => {
    const pool = getPool();
    const { hackathonId } = req.params;

    const result = await pool.query(
      `
      SELECT
        team_id AS team,
        repo_url AS repo,
        to_char(submitted_at, 'HH24:MI') AS time,
        score::float AS score,
        status
      FROM orehack_submissions
      WHERE hackathon_id = $1
      ORDER BY submitted_at DESC;
      `,
      [hackathonId],
    );

    res.json(result.rows);
  }),
);

app.post(
  "/api/hackathons/:hackathonId/submissions",
  asyncRoute(async (req, res) => {
    const pool = getPool();
    const { hackathonId } = req.params;
    const { teamId, repoUrl, problemStatement } = req.body || {};

    if (!teamId || !repoUrl) {
      return res.status(400).json({ message: "teamId and repoUrl are required" });
    }

    if (!/^https:\/\/github\.com\/.+\/.+/i.test(String(repoUrl).trim())) {
      return res.status(400).json({ message: "A valid public GitHub URL is required" });
    }

    const hackathon = await pool.query("SELECT id FROM orehack_hackathons WHERE id = $1", [hackathonId]);
    if (hackathon.rowCount === 0) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    await pool.query(
      `
      INSERT INTO orehack_teams (hackathon_id, team_id, password)
      VALUES ($1, $2, 'team123')
      ON CONFLICT (hackathon_id, team_id) DO NOTHING;
      `,
      [hackathonId, String(teamId).trim()],
    );

    const insertResult = await pool.query(
      `
      INSERT INTO orehack_submissions (hackathon_id, team_id, repo_url, problem_statement, status)
      VALUES ($1, $2, $3, $4, 'Queued')
      RETURNING
        id,
        team_id AS team,
        repo_url AS repo,
        status,
        submitted_at;
      `,
      [hackathonId, String(teamId).trim(), String(repoUrl).trim(), problemStatement || null],
    );

    await pool.query(
      `
      UPDATE orehack_hackathons h
      SET participants = c.team_count
      FROM (
        SELECT hackathon_id, COUNT(*)::int AS team_count
        FROM orehack_teams
        WHERE hackathon_id = $1
        GROUP BY hackathon_id
      ) c
      WHERE h.id = c.hackathon_id;
      `,
      [hackathonId],
    );

    await writeLog(`Submission received: ${teamId} (${hackathonId})`);

    res.status(201).json(insertResult.rows[0]);
  }),
);

app.get(
  "/api/hackathons/:hackathonId/leaderboard",
  asyncRoute(async (req, res) => {
    const pool = getPool();
    const { hackathonId } = req.params;

    const result = await pool.query(
      `
      SELECT
        row_number() OVER (ORDER BY score DESC, submitted_at ASC) AS rank,
        team_id AS team,
        score::float AS score,
        COALESCE(time_taken, 'N/A') AS time
      FROM orehack_submissions
      WHERE hackathon_id = $1
        AND status = 'Evaluated'
        AND score IS NOT NULL
      ORDER BY score DESC, submitted_at ASC;
      `,
      [hackathonId],
    );

    res.json(result.rows);
  }),
);

app.get(
  "/api/admin/hackathon-overview/:hackathonId",
  asyncRoute(async (req, res) => {
    const pool = getPool();
    const { hackathonId } = req.params;

    const result = await pool.query(
      `
      SELECT
        COUNT(*)::int AS total_submissions,
        COUNT(*) FILTER (WHERE status = 'Evaluated')::int AS evaluated,
        COUNT(*) FILTER (WHERE status = 'Queued')::int AS queued,
        COALESCE(ROUND(AVG(score)::numeric, 1), 0) AS avg_score
      FROM orehack_submissions
      WHERE hackathon_id = $1;
      `,
      [hackathonId],
    );

    res.json(result.rows[0]);
  }),
);

app.post(
  "/api/admin/login",
  asyncRoute(async (req, res) => {
    const pool = getPool();
    const { email, password, role } = req.body || {};

    if (!email || !password || !role) {
      return res.status(400).json({ message: "email, password, and role are required" });
    }

    const userResult = await pool.query(
      `
      SELECT role
      FROM orehack_admin_users
      WHERE lower(email) = lower($1)
        AND password = $2
        AND role = $3
      LIMIT 1;
      `,
      [String(email).trim(), String(password), String(role)],
    );

    if (userResult.rowCount === 0) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    await writeLog(`Admin login success: ${email} (${role})`);
    return res.json({ ok: true, role: userResult.rows[0].role });
  }),
);

app.get(
  "/api/admin/developer/overview",
  asyncRoute(async (_req, res) => {
    const pool = getPool();

    const [hackathonsResult, submissionResult, avgEvalResult] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM orehack_hackathons"),
      pool.query("SELECT COUNT(*)::int AS count FROM orehack_submissions"),
      pool.query("SELECT COALESCE(ROUND(AVG(evaluation_seconds)::numeric, 1), 0) AS avg_eval_seconds FROM orehack_submissions WHERE evaluation_seconds IS NOT NULL"),
    ]);

    res.json({
      activeHackathons: hackathonsResult.rows[0].count,
      totalSubmissions: submissionResult.rows[0].count,
      engineStatus: "Online",
      avgEvalTime: `${avgEvalResult.rows[0].avg_eval_seconds}s`,
    });
  }),
);

app.get(
  "/api/admin/developer/hackathons",
  asyncRoute(async (_req, res) => {
    const pool = getPool();
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        status,
        participants,
        deadline_text AS deadline
      FROM orehack_hackathons
      ORDER BY created_at DESC;
      `,
    );
    res.json(result.rows);
  }),
);

app.get(
  "/api/admin/developer/logs",
  asyncRoute(async (_req, res) => {
    const pool = getPool();
    const result = await pool.query(
      `
      SELECT
        to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS timestamp,
        level,
        message
      FROM orehack_system_logs
      ORDER BY created_at DESC
      LIMIT 20;
      `,
    );

    res.json(result.rows);
  }),
);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: "Internal server error",
    error: error instanceof Error ? error.message : "Unknown error",
  });
});

async function start() {
  await initDatabase();
  app.listen(port, () => {
    const maskedUrl = databaseConfig.databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, "://$1:****@");
    console.log(`API server listening on http://localhost:${port}`);
    console.log(`Connected database: ${maskedUrl}`);
  });
}

start().catch(async (error) => {
  console.error("Failed to start API server", error);
  await closePool();
  process.exit(1);
});

process.on("SIGINT", async () => {
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await closePool();
  process.exit(0);
});