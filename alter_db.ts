import { pool } from "./server/src/db/pool";

async function run() {
  try {
    await pool.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS leaderboard_visible BOOLEAN DEFAULT true NOT NULL;
    `);
    console.log("Successfully added leaderboard_visible column to events table");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    await pool.end();
  }
}

run();
