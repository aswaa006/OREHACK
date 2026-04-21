import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { runStartupHealthCheck, type StartupHealthReport } from "@/lib/health-check";
import { supabase } from "@/lib/supabase";

const AdminHealth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<StartupHealthReport | null>(null);
  const [error, setError] = useState("");

  const checkAuthAndLoad = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        navigate("/admin/auth", { replace: true });
        return;
      }

      const healthReport = await runStartupHealthCheck(false);
      setReport(healthReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run health checks.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void checkAuthAndLoad();
  }, [checkAuthAndLoad]);

  return (
    <div className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-4xl space-y-6">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="rounded-2xl border border-border/70 bg-card/50 p-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">System Checks</p>
          <h1 className="mt-2 text-3xl font-black">Admin Health Check</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Verifies current database visibility for admin authentication, team login, and submissions flow.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => void checkAuthAndLoad()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Run Check Again
            </button>
            <button
              onClick={() => navigate("/admin/developer")}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.header>

        {loading && (
          <div className="rounded-2xl border border-border/70 bg-card/40 p-6 text-sm text-muted-foreground">
            Running checks...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && report && (
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card/40">
            <table className="w-full text-sm">
              <thead className="bg-card/70 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Table</th>
                  <th className="px-4 py-3">Visible Rows</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Message</th>
                </tr>
              </thead>
              <tbody>
                {report.results.map((result) => {
                  const status = !result.ok ? "error" : result.warning ? "warning" : "ok";
                  const statusClass =
                    status === "error"
                      ? "text-destructive"
                      : status === "warning"
                        ? "text-amber-400"
                        : "text-emerald-400";

                  return (
                    <tr key={result.table} className="border-t border-border/60">
                      <td className="px-4 py-3 font-medium">{result.table}</td>
                      <td className="px-4 py-3">{result.count}</td>
                      <td className={`px-4 py-3 font-semibold uppercase ${statusClass}`}>{status}</td>
                      <td className="px-4 py-3 text-muted-foreground">{result.message}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHealth;
