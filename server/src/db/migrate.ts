import { pool } from "./pool";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrations = [
  "001_initial_schema.sql",
  "002_admin_platform.sql",
];

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log("Starting migrations...");

    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, "migrations", migrationFile);
      if (!fs.existsSync(migrationPath)) {
        console.warn(`Migration file not found, skipping: ${migrationFile}`);
        continue;
      }
      const sql = fs.readFileSync(migrationPath, "utf-8");

      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");

      console.log(`Migration ${migrationFile} executed successfully.`);
    }

    console.log("All migrations completed.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch(console.error);
