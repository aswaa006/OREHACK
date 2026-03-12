import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getHackathonOverview, getHackathonSubmissions } from "@/lib/api";

const tabs = ["Overview", "Submissions", "Leaderboard", "Reports"];
const HACKATHON_ID = "origin-2k26";

const fallbackSubmissions = [
  { team: "NeuralForge", repo: "github.com/neuralforge/proj", time: "14:23", score: 94.2, status: "Evaluated" },
  { team: "ByteStorm", repo: "github.com/bytestorm/hack", time: "14:45", score: 91.8, status: "Evaluated" },
  { team: "CodeVault", repo: "github.com/codevault/app", time: "15:02", score: 88.5, status: "Evaluated" },
  { team: "QuantumLeap", repo: "github.com/qleap/sub", time: "15:30", score: null, status: "Queued" },
];

const HackathonAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [submissions, setSubmissions] = useState(fallbackSubmissions);
  const [overview, setOverview] = useState({
    totalSubmissions: 128,
    evaluated: 96,
    queued: 32,
    avgScore: 78.4,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [overviewData, submissionData] = await Promise.all([
          getHackathonOverview(HACKATHON_ID),
          getHackathonSubmissions(HACKATHON_ID),
        ]);

        if (!isMounted) {
          return;
        }

        setOverview({
          totalSubmissions: Number(overviewData.total_submissions || 0),
          evaluated: Number(overviewData.evaluated || 0),
          queued: Number(overviewData.queued || 0),
          avgScore: Number(overviewData.avg_score || 0),
        });

        if (submissionData.length > 0) {
          setSubmissions(submissionData);
        }
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard data.");
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

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
        {error && (
          <p className="mb-4 text-xs text-destructive">
            {error}
          </p>
        )}

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
              { label: "Total Submissions", value: String(overview.totalSubmissions) },
              { label: "Evaluated", value: String(overview.evaluated) },
              { label: "Queued", value: String(overview.queued) },
              { label: "Avg Score", value: overview.avgScore.toFixed(1) },
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
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Team</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Repository</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-6 py-3">Score</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.team} className="border-b border-border/50 last:border-0">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{s.team}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{s.repo.replace(/^https:\/\//, "")}</td>
                    <td className="px-6 py-4 text-sm text-foreground text-right font-mono">
                      {s.score ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          s.status === "Evaluated" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                        }`}
                      >
                        {s.status}
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
