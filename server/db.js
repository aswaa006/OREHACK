import pg from "pg";

const { Client, Pool } = pg;

const defaultHost = process.env.PGHOST || "localhost";
const defaultPort = process.env.PGPORT || "5432";
const defaultUser = process.env.PGUSER || "postgres";
const defaultPassword = process.env.PGPASSWORD || "postgres";
const defaultDatabase = process.env.PGDATABASE || "hackathon_db";

const localDatabaseCandidates = [
  `postgresql://${defaultUser}:${encodeURIComponent(defaultPassword)}@${defaultHost}:${defaultPort}/${defaultDatabase}`,
  `postgresql://${defaultUser}@${defaultHost}:${defaultPort}/${defaultDatabase}`,
  "postgresql://postgres:sas%402006@localhost:5432/hackathon_db",
];

const databaseUrlCandidates = process.env.DATABASE_URL
  ? [process.env.DATABASE_URL]
  : [...new Set(localDatabaseCandidates)];

let activeDatabaseUrl = databaseUrlCandidates[0];
let pool;
let notificationClient;

const realtimeChannel = "orehack_changes";
const databaseChangeListeners = new Set();

function safeIdentifier(identifier) {
  if (!/^[a-zA-Z0-9_]+$/.test(identifier)) {
    throw new Error("Invalid database name in DATABASE_URL");
  }
  return `"${identifier}"`;
}

function emitDatabaseChange(payload) {
  for (const listener of databaseChangeListeners) {
    try {
      listener(payload);
    } catch (error) {
      console.error("Database change listener failed", error);
    }
  }
}

async function ensureDatabaseExists(connectionString) {
  const url = new URL(connectionString);
  const dbName = decodeURIComponent(url.pathname.replace(/^\//, ""));

  if (!dbName) {
    throw new Error("DATABASE_URL must contain a database name");
  }

  const adminUrl = new URL(connectionString);
  adminUrl.pathname = "/postgres";

  const adminClient = new Client({ connectionString: adminUrl.toString() });

  await adminClient.connect();
  try {
    const existsResult = await adminClient.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);

    if (existsResult.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE ${safeIdentifier(dbName)}`);
    }
  } finally {
    await adminClient.end();
  }
}

async function createSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orehack_hackathons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Live', 'Upcoming', 'Completed')),
      participants INTEGER NOT NULL DEFAULT 0,
      deadline_text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orehack_teams (
      id BIGSERIAL PRIMARY KEY,
      hackathon_id TEXT NOT NULL REFERENCES orehack_hackathons(id) ON DELETE CASCADE,
      team_id TEXT NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (hackathon_id, team_id)
    );

    CREATE TABLE IF NOT EXISTS orehack_submissions (
      id BIGSERIAL PRIMARY KEY,
      hackathon_id TEXT NOT NULL REFERENCES orehack_hackathons(id) ON DELETE CASCADE,
      team_id TEXT NOT NULL,
      repo_url TEXT NOT NULL,
      problem_statement TEXT,
      status TEXT NOT NULL DEFAULT 'Queued' CHECK (status IN ('Queued', 'Evaluated', 'Rejected')),
      score NUMERIC(5,2),
      time_taken TEXT,
      evaluation_seconds NUMERIC(8,2),
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orehack_admin_users (
      id BIGSERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('hackathon', 'developer')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orehack_system_logs (
      id BIGSERIAL PRIMARY KEY,
      level TEXT NOT NULL DEFAULT 'info',
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_orehack_submissions_hackathon ON orehack_submissions(hackathon_id);
    CREATE INDEX IF NOT EXISTS idx_orehack_submissions_hackathon_status ON orehack_submissions(hackathon_id, status);
    CREATE INDEX IF NOT EXISTS idx_orehack_submissions_hackathon_score ON orehack_submissions(hackathon_id, score DESC);

    CREATE OR REPLACE FUNCTION orehack_notify_change()
    RETURNS TRIGGER AS $$
    DECLARE
      row_data JSONB;
    BEGIN
      row_data := CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;

      PERFORM pg_notify(
        'orehack_changes',
        json_build_object(
          'table', TG_TABLE_NAME,
          'operation', TG_OP,
          'hackathonId', row_data ->> 'hackathon_id',
          'id', row_data ->> 'id',
          'teamId', row_data ->> 'team_id',
          'at', NOW()
        )::text
      );

      IF TG_OP = 'DELETE' THEN
        RETURN OLD;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION orehack_sync_participants()
    RETURNS TRIGGER AS $$
    BEGIN
      IF TG_OP = 'DELETE' THEN
        UPDATE orehack_hackathons
        SET participants = (
          SELECT COUNT(*)::int
          FROM orehack_teams
          WHERE hackathon_id = OLD.hackathon_id
        )
        WHERE id = OLD.hackathon_id;

        RETURN OLD;
      END IF;

      UPDATE orehack_hackathons
      SET participants = (
        SELECT COUNT(*)::int
        FROM orehack_teams
        WHERE hackathon_id = NEW.hackathon_id
      )
      WHERE id = NEW.hackathon_id;

      IF TG_OP = 'UPDATE' AND OLD.hackathon_id <> NEW.hackathon_id THEN
        UPDATE orehack_hackathons
        SET participants = (
          SELECT COUNT(*)::int
          FROM orehack_teams
          WHERE hackathon_id = OLD.hackathon_id
        )
        WHERE id = OLD.hackathon_id;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS orehack_hackathons_change_trigger ON orehack_hackathons;
    CREATE TRIGGER orehack_hackathons_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orehack_hackathons
    FOR EACH ROW EXECUTE FUNCTION orehack_notify_change();

    DROP TRIGGER IF EXISTS orehack_teams_change_trigger ON orehack_teams;
    CREATE TRIGGER orehack_teams_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orehack_teams
    FOR EACH ROW EXECUTE FUNCTION orehack_notify_change();

    DROP TRIGGER IF EXISTS orehack_teams_participant_sync_trigger ON orehack_teams;
    CREATE TRIGGER orehack_teams_participant_sync_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orehack_teams
    FOR EACH ROW EXECUTE FUNCTION orehack_sync_participants();

    DROP TRIGGER IF EXISTS orehack_submissions_change_trigger ON orehack_submissions;
    CREATE TRIGGER orehack_submissions_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orehack_submissions
    FOR EACH ROW EXECUTE FUNCTION orehack_notify_change();

    DROP TRIGGER IF EXISTS orehack_system_logs_change_trigger ON orehack_system_logs;
    CREATE TRIGGER orehack_system_logs_change_trigger
    AFTER INSERT OR UPDATE OR DELETE ON orehack_system_logs
    FOR EACH ROW EXECUTE FUNCTION orehack_notify_change();
  `);
}

async function seedDefaults() {
  const hackathonCount = await pool.query("SELECT COUNT(*)::int AS count FROM orehack_hackathons");

  if (hackathonCount.rows[0].count === 0) {
    await pool.query(`
      INSERT INTO orehack_hackathons (id, name, status, participants, deadline_text)
      VALUES
        ('origin-2k26', 'Origin 2K26', 'Live', 128, 'March 15, 2026'),
        ('buildcore-v3', 'BuildCore v3', 'Upcoming', 0, 'April 5, 2026'),
        ('devstrike-24', 'DevStrike ''24', 'Completed', 256, 'Ended');
    `);
  }

  const teamCount = await pool.query("SELECT COUNT(*)::int AS count FROM orehack_teams");
  if (teamCount.rows[0].count === 0) {
    await pool.query(`
      INSERT INTO orehack_teams (hackathon_id, team_id, password)
      VALUES
        ('origin-2k26', 'NeuralForge', 'team123'),
        ('origin-2k26', 'ByteStorm', 'team123'),
        ('origin-2k26', 'CodeVault', 'team123'),
        ('origin-2k26', 'QuantumLeap', 'team123'),
        ('origin-2k26', 'SyntaxError', 'team123'),
        ('origin-2k26', 'DevOpsZero', 'team123'),
        ('origin-2k26', 'StackTrace', 'team123'),
        ('origin-2k26', 'BinaryBlitz', 'team123');
    `);
  }

  const submissionCount = await pool.query("SELECT COUNT(*)::int AS count FROM orehack_submissions");
  if (submissionCount.rows[0].count === 0) {
    await pool.query(`
      INSERT INTO orehack_submissions (hackathon_id, team_id, repo_url, problem_statement, status, score, time_taken, evaluation_seconds, submitted_at)
      VALUES
        ('origin-2k26', 'NeuralForge', 'https://github.com/neuralforge/proj', 'Autonomous AI reviewer', 'Evaluated', 94.2, '2h 14m', 3.8, NOW() - INTERVAL '4 hours'),
        ('origin-2k26', 'ByteStorm', 'https://github.com/bytestorm/hack', 'Realtime telemetry engine', 'Evaluated', 91.8, '2h 45m', 4.1, NOW() - INTERVAL '3 hours 45 minutes'),
        ('origin-2k26', 'CodeVault', 'https://github.com/codevault/app', 'Secure dev platform', 'Evaluated', 88.5, '3h 02m', 4.4, NOW() - INTERVAL '3 hours 20 minutes'),
        ('origin-2k26', 'QuantumLeap', 'https://github.com/qleap/sub', 'Edge model runner', 'Queued', NULL, NULL, NULL, NOW() - INTERVAL '3 hours'),
        ('origin-2k26', 'SyntaxError', 'https://github.com/syntaxerror/lintbot', 'Linting automation', 'Evaluated', 82.7, '3h 30m', 4.7, NOW() - INTERVAL '2 hours 40 minutes'),
        ('origin-2k26', 'DevOpsZero', 'https://github.com/devopszero/pipeline', 'CI workflow agent', 'Evaluated', 79.3, '3h 15m', 4.2, NOW() - INTERVAL '2 hours 20 minutes'),
        ('origin-2k26', 'StackTrace', 'https://github.com/stacktrace/observability', 'Runtime observability', 'Evaluated', 76.0, '3h 50m', 4.9, NOW() - INTERVAL '2 hours'),
        ('origin-2k26', 'BinaryBlitz', 'https://github.com/binaryblitz/compiler', 'Tiny compiler', 'Evaluated', 72.4, '4h 10m', 5.1, NOW() - INTERVAL '1 hour 40 minutes');
    `);
  }

  const adminCount = await pool.query("SELECT COUNT(*)::int AS count FROM orehack_admin_users");
  if (adminCount.rows[0].count === 0) {
    await pool.query(`
      INSERT INTO orehack_admin_users (email, password, role)
      VALUES
        ('admin@oregent.com', 'admin123', 'hackathon'),
        ('devadmin@oregent.com', 'admin123', 'developer');
    `);
  }

  const logCount = await pool.query("SELECT COUNT(*)::int AS count FROM orehack_system_logs");
  if (logCount.rows[0].count === 0) {
    await pool.query(`
      INSERT INTO orehack_system_logs (level, message, created_at)
      VALUES
        ('info', 'Engine health check: OK', NOW() - INTERVAL '10 minutes'),
        ('info', 'Hackathon "Origin 2K26" status: LIVE', NOW() - INTERVAL '8 minutes'),
        ('info', 'Submission received: NeuralForge', NOW() - INTERVAL '6 minutes'),
        ('info', 'Repository parsed: https://github.com/neuralforge/proj', NOW() - INTERVAL '5 minutes'),
        ('info', 'Evaluation completed: NeuralForge -> 94.2', NOW() - INTERVAL '4 minutes');
    `);
  }

  await pool.query(`
    UPDATE orehack_hackathons h
    SET participants = t.team_count
    FROM (
      SELECT hackathon_id, COUNT(*)::int AS team_count
      FROM orehack_teams
      GROUP BY hackathon_id
    ) t
    WHERE h.id = t.hackathon_id;
  `);
}

export async function initDatabase() {
  let lastError;

  for (const connectionString of databaseUrlCandidates) {
    try {
      await ensureDatabaseExists(connectionString);

      pool = new Pool({ connectionString });
      await pool.query("SELECT 1");

      activeDatabaseUrl = connectionString;
      databaseConfig.databaseUrl = activeDatabaseUrl;

      await createSchema();
      await seedDefaults();

      return pool;
    } catch (error) {
      lastError = error;
      if (pool) {
        await pool.end().catch(() => {
          // Ignore pool shutdown failures while trying next candidate.
        });
        pool = undefined;
      }
    }
  }

  throw new Error(
    `Unable to connect to PostgreSQL. Set DATABASE_URL to a valid connection string. Last error: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}

export function getPool() {
  if (!pool) {
    throw new Error("Database has not been initialized yet");
  }
  return pool;
}

export function addDatabaseChangeListener(listener) {
  databaseChangeListeners.add(listener);
  return () => {
    databaseChangeListeners.delete(listener);
  };
}

export async function startDatabaseNotifications() {
  if (notificationClient) {
    return;
  }

  notificationClient = new Client({ connectionString: activeDatabaseUrl });
  notificationClient.on("notification", (message) => {
    if (message.channel !== realtimeChannel || !message.payload) {
      return;
    }

    try {
      emitDatabaseChange(JSON.parse(message.payload));
    } catch {
      emitDatabaseChange({
        table: "unknown",
        operation: "UNKNOWN",
        at: new Date().toISOString(),
      });
    }
  });

  notificationClient.on("error", (error) => {
    console.error("PostgreSQL notification listener error", error);
  });

  await notificationClient.connect();
  await notificationClient.query(`LISTEN ${safeIdentifier(realtimeChannel)}`);
}

export async function closePool() {
  if (notificationClient) {
    await notificationClient.end().catch(() => {
      // Ignore shutdown failures for the notification client.
    });
    notificationClient = undefined;
  }

  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

export const databaseConfig = {
  databaseUrl: activeDatabaseUrl,
  databaseUrlCandidates,
};