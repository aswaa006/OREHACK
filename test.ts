import { pool } from "./server/src/db/pool";

async function run() {
  const result = await pool.query("SELECT id, name, team_code FROM teams LIMIT 10;");
  console.log(result.rows);
  process.exit(0);
}

run();
