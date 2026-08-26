import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(currentDir, ".env") });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearRecords() {
  console.log("Starting to clear hackathon records...");

  // Clear events (this cascades to teams, submissions, scores, etc.)
  const { error: eventsError } = await supabase
    .from("events")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

  if (eventsError) {
    console.error("Failed to delete from events:", eventsError.message);
  } else {
    console.log("Successfully cleared events (and cascaded data).");
  }

  // Clear hackathons table (used by V2)
  const { error: hackathonsError } = await supabase
    .from("hackathons")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (hackathonsError) {
    // It might not exist if it's purely a V1 schema, but let's try.
    console.warn("Failed to delete from hackathons (may not exist):", hackathonsError.message);
  } else {
    console.log("Successfully cleared hackathons.");
  }

  console.log("Finished clearing hackathon records.");
}

clearRecords().catch(console.error);
