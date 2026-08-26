import { pool } from "./server/src/db/pool.ts";

async function run() {
  const res = await pool.query("UPDATE events SET status = 'REGISTRATION_OPEN' WHERE status = 'DRAFT' RETURNING id, name, status");
  console.log(res.rows);
  await pool.end();
}

run().catch(console.error);
