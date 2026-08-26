import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeams, type Team } from "@/lib/admin-api";
import { ensureAbsoluteUrl } from "@/lib/utils";
import { ExternalLink, Search, ChevronRight } from "lucide-react";

export default function TeamsTab({ eventId }: { eventId: string }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p = 1, s = search) => {
    setLoading(true);
    try {
      const res = await getTeams({ event_id: eventId, page: p, limit: 15, search: s });
      setTeams(res.data);
      setTotalPages(res.pagination?.pages ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [eventId]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); load(1, e.target.value); }}
          placeholder="Search teams..."
          className="w-full bg-[#0d0d1a] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40"
        />
      </div>

      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Team", "Leader", "Members", "Repo", "Score", "Status", ""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  {[...Array(7)].map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : teams.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-white/30 text-sm">No teams found.</td></tr>
            ) : (
              teams.map((team) => (
                <tr key={team.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{team.team_name}</p>
                    <p className="text-white/30 text-xs">{team.team_code ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-sm">{team.leader_name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/50 text-sm">{team.member_count}</td>
                  <td className="px-4 py-3">
                    {team.repo_url ? (
                      <a href={ensureAbsoluteUrl(team.repo_url)} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : <span className="text-white/20 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 text-white/70 text-sm font-mono">
                    {team.evaluation_status === "EVALUATED" ? Number(team.total_score).toFixed(1) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      team.evaluation_status === "EVALUATED"
                        ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                        : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                    }`}>
                      {team.evaluation_status === "EVALUATED" ? "Evaluated" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/v2/teams/${team.id}`} className="text-white/30 hover:text-white/60 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => { setPage(p => Math.max(1, p - 1)); load(Math.max(1, page - 1)); }} disabled={page === 1} className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] text-white/50 hover:bg-white/[0.08] disabled:opacity-30 transition-colors">Prev</button>
          <span className="text-white/30 text-sm">{page} / {totalPages}</span>
          <button onClick={() => { setPage(p => Math.min(totalPages, p + 1)); load(Math.min(totalPages, page + 1)); }} disabled={page === totalPages} className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] text-white/50 hover:bg-white/[0.08] disabled:opacity-30 transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}
