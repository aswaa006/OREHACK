import { supabase } from "../src/lib/supabase";

async function probeTables() {
  const tableNames = [
    "orehack_teams",
    "orehack_jury",
    "orehack_settings",
    "orehack_evaluations",
    "teams",
    "submissions",
    "users",
    "evaluations"
  ];

  for (const t of tableNames) {
    const { data, error } = await supabase.from(t).select("*").limit(1);
    if (error) {
      console.log(`Table '${t}': ERROR -> ${error.message} (${error.code})`);
    } else {
      console.log(`Table '${t}': OK! Rows:`, data);
    }
  }
}

probeTables();

