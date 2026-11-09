import { supabase } from "../src/lib/supabase";

async function testSupabase() {
  console.log("Testing Supabase connectivity...");
  try {
    const { data, error } = await supabase.from("orehack_teams").select("*").limit(5);
    console.log("Supabase response:", { count: data?.length, error });
    if (error) {
      console.error("Supabase Error details:", error);
    } else {
      console.log("Data sample:", data);
    }
  } catch (err) {
    console.error("Unexpected exception:", err);
  }
}

testSupabase();

