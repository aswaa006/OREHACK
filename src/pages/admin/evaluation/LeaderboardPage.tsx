import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Medal, Eye, EyeOff, RefreshCw, Download } from "lucide-react";
import { getLeaderboard, toggleLeaderboardVisibility, getEvents, downloadLeaderboardCsv, type LeaderboardTeam, type Event } from "@/lib/admin-api";

const MEDAL_STYLES = [
  "border-yellow-400/30 bg-yellow-400/5 text-yellow-400",
  "border-slate-400/30 bg-slate-400/5 text-slate-400",
  "border-amber-600/30 bg-amber-600/5 text-amber-600",
];

export default function LeaderboardPage() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get("event_id") ?? "");
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => { getEvents().then(setEvents).catch(console.error); }, []);

  const load = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    try {
      const data = await getLeaderboard(selectedEvent);
      setTeams(data.teams);
      setVisible(data.leaderboard_visible);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedEvent]);

  const handleToggle = async () => {
    if (!selectedEvent) return;
    setToggling(true);
    try {
      const res = await toggleLeaderboardVisibility(selectedEvent);
      setVisible(res.leaderboard_visible);
    } finally {
      setToggling(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedEvent) return;
    setDownloading(true);
    try { await downloadLeaderboardCsv(selectedEvent); }
    finally { setDownloading(false); }
  };

  const evaluated = teams.filter(t => t.evaluation_status === "EVALUATED");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
          <p className="text-white/40 text-sm mt-1">Ranked results for evaluated teams.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleToggle}
            disabled={!selectedEvent || toggling}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
              visible ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-white/[0.04] text-white/40 border-white/[0.08] hover:bg-white/[0.08]"
            } disabled:opacity-30`}
          >
            {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {visible ? "Public" : "Hidden"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!selectedEvent || downloading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white transition-colors border border-white/[0.08] disabled:opacity-30"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Event selector */}
      <select
        value={selectedEvent}
        onChange={(e) => setSelectedEvent(e.target.value)}
        className="w-full max-w-sm bg-[#0d0d1a] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/40 appearance-none"
      >
        <option value="">Select a hackathon...</option>
        {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
      </select>

      {!selectedEvent ? (
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Medal className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Select a hackathon to view its leaderboard.</p>
        </div>
      ) : (
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Rank", "Team", "Institution", "Technical", "Innovation", "Completeness", "Total"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {[...Array(7)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : evaluated.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-white/30 text-sm">No evaluated teams yet. Import scores to populate the leaderboard.</td></tr>
              ) : (
                evaluated.map((team, i) => (
                  <motion.tr
                    key={team.team_id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors ${team.rank === 1 ? "bg-yellow-400/[0.02]" : ""}`}
                  >
                    <td className="px-5 py-4">
                      {team.rank <= 3 ? (
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm font-bold ${MEDAL_STYLES[team.rank - 1]}`}>
                          {team.rank}
                        </div>
                      ) : (
                        <span className="text-white/30 font-mono text-sm">{team.rank}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/admin/v2/teams/${team.team_id}`} className="hover:text-indigo-400 transition-colors">
                        <p className="text-white font-medium text-sm">{team.team_name}</p>
                        {team.team_code && <p className="text-white/30 text-xs font-mono">{team.team_code}</p>}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-sm">{team.institution ?? "—"}</td>
                    <td className="px-5 py-4 text-white/60 font-mono text-sm">{Number(team.technical_score).toFixed(1)}</td>
                    <td className="px-5 py-4 text-white/60 font-mono text-sm">{Number(team.innovation_score).toFixed(1)}</td>
                    <td className="px-5 py-4 text-white/60 font-mono text-sm">{Number(team.completeness_score).toFixed(1)}</td>
                    <td className="px-5 py-4">
                      <span className={`font-bold font-mono text-base ${team.rank === 1 ? "text-yellow-400" : team.rank === 2 ? "text-slate-400" : team.rank === 3 ? "text-amber-600" : "text-white"}`}>
                        {Number(team.total_score).toFixed(1)}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
