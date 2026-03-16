import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getLeaderboard } from "@/lib/api";

const Leaderboard = () => {
  const { hackathonId } = useParams();
  const [leaderboardData, setLeaderboardData] = useState<{ rank: number; team: string; score: number; time: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hackathonName = hackathonId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Hackathon";

  useEffect(() => {
    if (!hackathonId) {
      return;
    }

    let isMounted = true;

    const loadLeaderboard = async () => {
      try {
        const rows = await getLeaderboard(hackathonId);

        if (!isMounted) {
          return;
        }

        setLeaderboardData(rows);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Unable to load leaderboard data.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLeaderboard();

    return () => {
      isMounted = false;
    };
  }, [hackathonId]);

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

        {error && <p className="text-xs text-destructive mb-4">{error}</p>}

        {loading ? (
          <div className="surface-elevated rounded-xl p-6">
            <p className="text-sm text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="surface-elevated rounded-xl p-6">
            <p className="text-sm text-muted-foreground">No evaluated submissions yet.</p>
          </div>
        ) : (
          <div className="surface-elevated rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Rank</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Team</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-6 py-3">Score</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-6 py-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((row, i) => (
                  <motion.tr
                    key={`${row.rank}-${row.team}`}
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
                      <span className={`text-sm font-semibold ${row.rank === 1 ? "text-gold" : "text-foreground"}`}>
                        {row.team}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-mono text-foreground">{row.score}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-xs text-muted-foreground">{row.time}</span>
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
