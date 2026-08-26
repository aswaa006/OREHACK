import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.VITE_SUPABASE_URL // wait no, connection string is Postgres URL!
});
// wait, I don't know the Postgres URL. 
