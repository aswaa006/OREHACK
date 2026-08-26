import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeams, type Team } from "@/lib/admin-api";
import { getLeaderboard, type LeaderboardTeam } from "@/lib/admin-api";
import { BarChart3, ChevronRight, Lock, Unlock, ExternalLink } from "lucide-react";

export default function EvaluationTab({ eventId }: { eventId: string }) {
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(eventId).then((d) => setTeams(d.teams)).finally(() => setLoading(false));
  }, [eventId]);

  const evaluated = teams.filter(t => t.evaluation_status === "EVALUATED");
  const pending = teams.filter(t => t.evaluation_status === "PENDING");
  const pct = teams.length > 0 ? Math.round((evaluated.length / teams.length) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* Progress summary */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-white">Evaluation Progress</p>
          <span className="text-xs text-white/40">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-3">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex gap-6 text-xs text-white/40">
          <span className="text-emerald-400 font-medium">{evaluated.length} Evaluated</span>
          <span className="text-yellow-400 font-medium">{pending.length} Pending</span>
          <span>{teams.length} Total</span>
        </div>
      </div>

      {/* Import score shortcut */}
      <Link
        to={`/admin/v2/evaluation/import?event_id=${eventId}`}
        className="flex items-center gap-3 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl hover:bg-indigo-500/10 transition-colors"
      >
        <BarChart3 className="w-5 h-5 text-indigo-400 shrink-0" />
        <div>
          <p className="text-white text-sm font-medium">Import Scores from Python CLI</p>
          <p className="text-white/40 text-xs">Upload the analyzed CSV to populate scores</p>
        </div>
        <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
      </Link>

      {/* Team evaluation table */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Rank", "Team", "Tech", "Innovation", "Completeness", "Total", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  {[...Array(8)].map((__, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : teams.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-white/30 text-sm">No submissions found for this event.</td></tr>
            ) : (
              teams.map((team) => (
                <tr key={team.team_id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/40 text-sm font-mono">{team.evaluation_status === "EVALUATED" ? team.rank : "—"}</td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{team.team_name}</p>
                    <p className="text-white/30 text-xs">{team.institution}</p>
                  </td>
                  <td className="px-4 py-3 text-white/60 text-sm font-mono">{team.evaluation_status === "EVALUATED" ? Number(team.technical_score).toFixed(1) : "—"}</td>
                  <td className="px-4 py-3 text-white/60 text-sm font-mono">{team.evaluation_status === "EVALUATED" ? Number(team.innovation_score).toFixed(1) : "—"}</td>
                  <td className="px-4 py-3 text-white/60 text-sm font-mono">{team.evaluation_status === "EVALUATED" ? Number(team.completeness_score).toFixed(1) : "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-white font-bold text-sm font-mono">{team.evaluation_status === "EVALUATED" ? Number(team.total_score).toFixed(1) : "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      team.score_locked ? "text-red-400 bg-red-400/10 border-red-400/20"
                      : team.evaluation_status === "EVALUATED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                      : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                    }`}>
                      {team.score_locked ? "Locked" : team.evaluation_status === "EVALUATED" ? "Evaluated" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/v2/teams/${team.team_id}`} className="text-white/30 hover:text-indigo-400 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
