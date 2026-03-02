import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";

const leaderboardData = [
  { rank: 1, team: "NeuralForge", score: 94.2, time: "2h 14m" },
  { rank: 2, team: "ByteStorm", score: 91.8, time: "2h 45m" },
  { rank: 3, team: "CodeVault", score: 88.5, time: "3h 02m" },
  { rank: 4, team: "QuantumLeap", score: 85.1, time: "2h 58m" },
  { rank: 5, team: "SyntaxError", score: 82.7, time: "3h 30m" },
  { rank: 6, team: "DevOpsZero", score: 79.3, time: "3h 15m" },
  { rank: 7, team: "StackTrace", score: 76.0, time: "3h 50m" },
  { rank: 8, team: "BinaryBlitz", score: 72.4, time: "4h 10m" },
];

const Leaderboard = () => {
  const { hackathonId } = useParams();
  const hackathonName = hackathonId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Hackathon";

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
                  key={row.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`border-b border-border/50 last:border-0 ${
                    row.rank === 1 ? "bg-gold/5" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-bold ${
                        row.rank === 1 ? "text-gold" : "text-muted-foreground"
                      }`}
                    >
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
      </div>
    </div>
  );
};

export default Leaderboard;
