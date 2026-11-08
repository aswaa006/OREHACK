import { pool } from "./src/db/pool";

async function fixDB() {
  // 1. Change problem_statement from VARCHAR(255) to TEXT
  await pool.query("ALTER TABLE submissions ALTER COLUMN problem_statement TYPE TEXT");
  console.log("Altered problem_statement to TEXT");

  // 2. Drop the NOT NULL constraint on submission_id or alter it to have a default
  // Let's just drop the NOT NULL constraint because we use the internal `id` everywhere for logic
  await pool.query("ALTER TABLE submissions ALTER COLUMN submission_id DROP NOT NULL");
  console.log("Dropped NOT NULL on submission_id");

  process.exit(0);
}

fixDB();
