import { supabase } from "@/lib/supabase";

export type HealthTableName =
  | "hackathons"
  | "hackathon_runtime"
  | "control_state"
  | "users"
  | "user_roles"
  | "teams"
  | "submissions"
  | "submission_scores";

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
  { table: "hackathon_runtime", critical: true },
  { table: "control_state", critical: true },
  { table: "users", critical: false },
  { table: "user_roles", critical: false },
  { table: "teams", critical: false },
  { table: "submissions", critical: false },
  { table: "submission_scores", critical: false },
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

export async function runStartupHealthCheck(logToConsole = true): Promise<StartupHealthReport> {
  const results = await Promise.all(TABLES.map((item) => checkTable(item.table, item.critical)));

  const hasWarnings = results.some((result) => result.warning);
  const hasErrors = results.some((result) => !result.ok);

  const report: StartupHealthReport = {
    checkedAt: new Date().toISOString(),
    hasWarnings,
    hasErrors,
    results,
  };

  if (logToConsole && typeof console !== "undefined") {
    const level = hasErrors ? "error" : hasWarnings ? "warn" : "log";
    const title = hasErrors
      ? "[Startup Health] Database connectivity issues detected"
      : hasWarnings
        ? "[Startup Health] Connected with warnings"
        : "[Startup Health] All checks passed";

    console[level](title);
    console.table(
      results.map((result) => ({
        table: result.table,
        count: result.count,
        status: result.ok ? (result.warning ? "warning" : "ok") : "error",
        message: result.message,
      })),
    );
  }

  return report;
}
