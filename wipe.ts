import { Pool } from 'pg';
const pool = new Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres' });
pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;").then(() => { 
  console.log('Local database completely wiped.'); 
  pool.end(); 
}).catch(console.error);
