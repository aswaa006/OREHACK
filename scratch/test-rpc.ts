import { supabase } from "../src/lib/supabase";

async function testRpc() {
  const { data, error } = await supabase.rpc("exec_sql", { sql: "SELECT 1;" });
  console.log("RPC exec_sql result:", { data, error });
}

testRpc();

