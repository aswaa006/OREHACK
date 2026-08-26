import { pool } from "./server/src/db/pool";
import fs from "fs";

async function run() {
  try {
    const sql = fs.readFileSync("./server/src/db/migrations/002_add_submission_toggles.sql", "utf8");
    await pool.query(sql);
    console.log("Successfully applied migration 002_add_submission_toggles.sql");
  } catch (err) {
    console.error("Error applying migration:", err);
  } finally {
    await pool.end();
  }
}

run();
