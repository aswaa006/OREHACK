import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: './server/.env' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const client = await pool.connect();
  try {
    const dbRes = await client.query('select current_database() as db, current_schema() as schema');
    console.log('CONN_OK', dbRes.rows[0]);

    const tables = await client.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `);
    console.log('TABLES', tables.rows.map((row) => row.table_name));

    const adminCount = await client.query('select count(*)::int as count from public.admins');
    console.log('ADMINS', adminCount.rows[0]);
  } finally {
    client.release();
  }
} catch (error) {
  console.error('DB_ERROR', error.message);
} finally {
  await pool.end();
}
