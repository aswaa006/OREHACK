import { supabase } from "@/lib/supabase";

export type HealthTableName =
  | "hackathons"
  | "admins"
  | "stage_events"
  | "teams"
  | "submissions"
  | "problems"
  | "problem_selections"
  | "evaluation_reports"
  | "jury_scores"
  | "final_results";

export type HealthTableResult = {
  table: HealthTableName;
  count: number;
  ok: boolean;
  warning: boolean;
  message: string;
};

export type StartupHealthReport = {
  checkedAt: string;
  hasWarnings: boolean;
  hasErrors: boolean;
  results: HealthTableResult[];
};

const TABLES: Array<{ table: HealthTableName; critical: boolean }> = [
  { table: "hackathons", critical: true },
  { table: "admins", critical: true },
  { table: "stage_events", critical: false },
  { table: "teams", critical: false },
  { table: "submissions", critical: false },
  { table: "problems", critical: false },
  { table: "problem_selections", critical: false },
  { table: "evaluation_reports", critical: false },
  { table: "jury_scores", critical: false },
  { table: "final_results", critical: false },
];

async function checkTable(table: HealthTableName, critical: boolean): Promise<HealthTableResult> {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    return {
      table,
      count: 0,
      ok: false,
      warning: !critical,
      message: error.message || "Unable to query table.",
    };
  }

  const value = Number(count || 0);
  const emptyMessage = critical
    ? "No rows found in critical table."
    : "No visible rows found in this table for current session.";

  return {
    table,
    count: value,
    ok: true,
    warning: value === 0,
    message: value === 0 ? emptyMessage : "OK",
  };
}

export async function runStartupHealthCheck(logToConsole = false): Promise<StartupHealthReport> {
  // Check the first table first to test connectivity before firing 10 parallel requests
  const firstCheck = await checkTable(TABLES[0].table, TABLES[0].critical);
  
  let results: HealthTableResult[];
  if (!firstCheck.ok && (firstCheck.message.includes("Failed to fetch") || firstCheck.message.includes("NetworkError") || firstCheck.message.includes("not resolved") || firstCheck.message.includes("Unable to query"))) {
    // Supabase host is offline/unreachable - avoid blasting 9 more failing network requests
    results = TABLES.map((item, idx) => idx === 0 ? firstCheck : ({
      table: item.table,
      count: 0,
      ok: false,
      warning: !item.critical,
      message: "Supabase host unreachable.",
    }));
  } else {
    const remainingChecks = await Promise.all(TABLES.slice(1).map((item) => checkTable(item.table, item.critical)));
    results = [firstCheck, ...remainingChecks];
  }

  const hasWarnings = results.some((result) => result.warning);
  const hasErrors = results.some((result) => !result.ok);

  const report: StartupHealthReport = {
    checkedAt: new Date().toISOString(),
    hasWarnings,
    hasErrors,
    results,
  };

  if (logToConsole && typeof console !== "undefined") {
    if (hasErrors) {
      console.warn("[Startup Health] Database host is currently unreachable (offline/paused)");
    } else if (hasWarnings) {
      console.warn("[Startup Health] Connected with warnings");
    } else {
      console.log("[Startup Health] All checks passed");
    }
  }

  return report;
}
