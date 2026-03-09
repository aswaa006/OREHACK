import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

const tabs = ["Overview", "Submissions", "Leaderboard", "Reports"];

type Submission = {
  id: number;
  participant_id: number;
  repo_url: string;
  problem_statement: string;
  status: string;
  total_score: number | null;
  created_at: string;
  completed_at: string | null;
};

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    pending: "Queued",
    assigned: "Processing",
    completed: "Evaluated",
    failed: "Failed",
  };
  return map[s] ?? s;
};

const HackathonAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  useEffect(() => {
    if (activeTab === "Submissions" || activeTab === "Overview") {
      setLoadingSubmissions(true);
      fetch(`${API_BASE}/submissions`)
        .then((r) => r.json())
        .then(setSubmissions)
        .catch(() => setSubmissions([]))
        .finally(() => setLoadingSubmissions(false));
    }
  }, [activeTab]);

  const evaluated = submissions.filter((s) => s.status === "completed").length;
  const queued = submissions.filter((s) => s.status === "pending" || s.status === "assigned").length;
  const scores = submissions.filter((s) => s.total_score != null).map((s) => s.total_score as number);
  const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : "—";

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">Hackathon Admin</h1>
            <p className="text-xs text-muted-foreground">Origin 2K26</p>
          </div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Exit
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-1 mb-8 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "Overview" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Submissions", value: loadingSubmissions ? "…" : String(submissions.length) },
              { label: "Evaluated", value: loadingSubmissions ? "…" : String(evaluated) },
              { label: "Queued", value: loadingSubmissions ? "…" : String(queued) },
              { label: "Avg Score", value: loadingSubmissions ? "…" : avgScore },
            ].map((s) => (
              <div key={s.label} className="surface-elevated rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Submissions" && (
          <div className="surface-elevated rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">ID</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Repository</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-6 py-3">Score</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingSubmissions && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">Loading…</td>
                  </tr>
                )}
                {!loadingSubmissions && submissions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">No submissions yet.</td>
                  </tr>
                )}
                {submissions.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 last:border-0">
                    <td className="px-6 py-4 text-sm font-mono text-muted-foreground">#{s.id}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{s.repo_url.replace("https://github.com/", "")}</td>
                    <td className="px-6 py-4 text-sm text-foreground text-right font-mono">
                      {s.total_score != null ? s.total_score.toFixed(1) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          s.status === "completed" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                        }`}
                      >
                        {statusLabel(s.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Leaderboard" && (
          <p className="text-sm text-muted-foreground">
            <Link to="/hackathon/origin-2k26/leaderboard" className="text-primary hover:underline">
              View public leaderboard →
            </Link>
          </p>
        )}

        {activeTab === "Reports" && (
          <p className="text-sm text-muted-foreground">Evaluation reports will appear here after processing.</p>
        )}
      </div>
    </div>
  );
};

export default HackathonAdminDashboard;
