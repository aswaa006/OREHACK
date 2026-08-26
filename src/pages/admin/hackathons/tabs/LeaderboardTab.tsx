import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getLeaderboard, toggleLeaderboardVisibility, type LeaderboardTeam } from "@/lib/admin-api";
import { Medal, Eye, EyeOff, ExternalLink, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const MEDAL_COLORS = ["text-yellow-400", "text-slate-400", "text-amber-600"];
const MEDAL_BG = ["bg-yellow-400/10 border-yellow-400/20", "bg-slate-400/10 border-slate-400/20", "bg-amber-600/10 border-amber-600/20"];

export default function LeaderboardTab({ eventId }: { eventId: string }) {
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard(eventId);
      setTeams(data.teams);
      setVisible(data.leaderboard_visible);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [eventId]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await toggleLeaderboardVisibility(eventId);
      setVisible(res.leaderboard_visible);
    } finally {
      setToggling(false);
    }
  };

  const evaluated = teams.filter(t => t.evaluation_status === "EVALUATED");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-sm">{evaluated.length} teams evaluated</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              visible
                ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                : "bg-white/[0.04] text-white/40 hover:bg-white/[0.08] border border-white/[0.08]"
            }`}
          >
            {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {visible ? "Public" : "Hidden"}
          </button>
        </div>
      </div>

      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Rank", "Team", "Technical", "Innovation", "Completeness", "Total", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  {[...Array(7)].map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : evaluated.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/30 text-sm">No teams have been evaluated yet.</td></tr>
            ) : (
              evaluated.map((team, i) => {
                const isMedal = team.rank <= 3;
                return (
                  <motion.tr
                    key={team.team_id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${team.rank === 1 ? "bg-yellow-400/[0.02]" : ""}`}
                  >
                    <td className="px-4 py-3">
                      {isMedal ? (
                        <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs font-bold ${MEDAL_COLORS[team.rank - 1]} ${MEDAL_BG[team.rank - 1]}`}>
                          {team.rank}
                        </div>
                      ) : (
                        <span className="text-white/40 text-sm font-mono">{team.rank}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white font-medium text-sm">{team.team_name}</p>
                      <p className="text-white/30 text-xs">{team.institution}</p>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm font-mono">{Number(team.technical_score).toFixed(1)}</td>
                    <td className="px-4 py-3 text-white/60 text-sm font-mono">{Number(team.innovation_score).toFixed(1)}</td>
                    <td className="px-4 py-3 text-white/60 text-sm font-mono">{Number(team.completeness_score).toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <span className="text-white font-bold text-sm font-mono">{Number(team.total_score).toFixed(1)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {team.repo_url && (
                        <a href={team.repo_url} target="_blank" rel="noreferrer" className="text-white/30 hover:text-indigo-400 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
