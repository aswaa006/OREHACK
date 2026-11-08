import { pool } from "./src/db/pool";

async function checkErrors() {
  const result = await pool.query(
    "SELECT error_message, count(*) FROM score_import_rows WHERE status = 'FAILED' GROUP BY error_message ORDER BY count(*) DESC LIMIT 5"
  );
  console.log(result.rows);
  process.exit(0);
}

checkErrors();
