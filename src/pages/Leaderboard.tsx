import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

type LeaderboardEntry = {
  rank: number;
  submission_id: number;
  participant_id: number;
  repo_url: string;
  total_score: number;
  completed_at: string | null;
};

const Leaderboard = () => {
  const { hackathonId } = useParams();
  const hackathonName = hackathonId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Hackathon";

  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/leaderboard`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setRows)
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">{hackathonName}</h1>
            <p className="text-sm text-muted-foreground">Leaderboard</p>
          </div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </Link>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {fetchError && <p className="text-sm text-destructive">Failed to load leaderboard: {fetchError}</p>}

        {!loading && !fetchError && (
          <div className="surface-elevated rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Rank</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Repository</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-6 py-3">Score</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-muted-foreground">
                      No evaluated submissions yet.
                    </td>
                  </tr>
                )}
                {rows.map((row, i) => (
                  <motion.tr
                    key={row.submission_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`border-b border-border/50 last:border-0 ${row.rank === 1 ? "bg-gold/5" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${row.rank === 1 ? "text-gold" : "text-muted-foreground"}`}>
                        #{row.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={row.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className={`text-sm font-semibold hover:underline ${row.rank === 1 ? "text-gold" : "text-foreground"}`}
                      >
                        {row.repo_url.replace("https://github.com/", "")}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-mono text-foreground">{row.total_score.toFixed(1)}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
