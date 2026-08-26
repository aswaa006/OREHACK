import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ChevronRight, ChevronLeft, Lock, Download, Eye, Edit2, Trash2, Inbox } from "lucide-react";
import { getTeams, getEvents, type Team, type Event } from "@/lib/admin-api";

export default function TeamsPage() {
  const [searchParams] = useSearchParams();
  const [teams, setTeams] = useState<Team[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState(searchParams.get("event_id") ?? "");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set());

  useEffect(() => { getEvents().then(setEvents).catch(console.error); }, []);

  const load = async (p = 1, s = search, ev = eventFilter) => {
    setLoading(true);
    try {
      const res = await getTeams({ event_id: ev || undefined, page: p, limit: 10, search: s });
      setTeams(res.data);
      setTotalPages(res.pagination?.pages ?? 1);
      setTotal(res.pagination?.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, search, eventFilter); }, [eventFilter]);

  const toggleSelectAll = () => {
    if (selectedTeams.size === teams.length) {
      setSelectedTeams(new Set());
    } else {
      setSelectedTeams(new Set(teams.map(t => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedTeams);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedTeams(next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Teams</h1>
          <p className="text-white/40 text-sm mt-1">Manage and evaluate hackathon teams ({total} total)</p>
        </div>
      </div>

      {/* Controls Container */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#0d0d1a] p-4 rounded-xl border border-white/[0.06]">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); load(1, e.target.value); }}
              placeholder="Search teams by name or code..."
              className="w-full bg-white/[0.02] border border-white/[0.07] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.04] transition-all"
            />
          </div>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="bg-white/[0.02] border border-white/[0.07] rounded-lg px-4 py-2 text-sm text-white/70 focus:outline-none focus:border-indigo-500/40 appearance-none min-w-[180px] cursor-pointer"
          >
            <option value="">All Hackathons</option>
            {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {selectedTeams.size > 0 && (
            <span className="text-sm text-indigo-400 font-medium bg-indigo-500/10 px-3 py-1.5 rounded-lg">
              {selectedTeams.size} selected
            </span>
          )}
          <button className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 border border-white/[0.06] px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                <th className="px-5 py-4 w-12">
                  <input 
                    type="checkbox" 
                    className="rounded bg-black border-white/20 text-indigo-500 focus:ring-indigo-500/30 cursor-pointer"
                    checked={teams.length > 0 && selectedTeams.size === teams.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                {["Team", "Institution", "Leader", "Members", "Hackathon", "Submissions", "Score", "Status", "Actions"].map(h => (
                  <th key={h} className="px-5 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-white/60 transition-colors">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {[...Array(10)].map((__, j) => <td key={j} className="px-5 py-5"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : teams.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-16">
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mb-4 border border-white/[0.05]">
                        <Inbox className="w-8 h-8 text-white/20" />
                      </div>
                      <h3 className="text-white font-medium text-lg mb-1">No teams found</h3>
                      <p className="text-white/40 text-sm max-w-sm">
                        There are no teams matching your current search or filter criteria. Try adjusting your filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                teams.map((team, i) => (
                  <motion.tr
                    key={team.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.2 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded bg-black border-white/20 text-indigo-500 focus:ring-indigo-500/30 cursor-pointer"
                        checked={selectedTeams.has(team.id)}
                        onChange={() => toggleSelect(team.id)}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">{team.team_name}</p>
                        <p className="text-white/30 text-xs font-mono mt-0.5">{team.team_code ?? "—"}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/60 text-sm">{team.institution ?? "—"}</td>
                    <td className="px-5 py-4">
                      <p className="text-white/80 text-sm">{team.leader_name ?? "—"}</p>
                      <p className="text-white/40 text-xs mt-0.5">{team.leader_email ?? ""}</p>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-sm">
                      <div className="flex items-center gap-1.5 bg-white/[0.03] w-fit px-2 py-1 rounded-md border border-white/[0.04]">
                        <span className="font-semibold text-white/70">{team.member_count}</span>
                        <span className="text-xs">users</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/50 text-sm whitespace-nowrap">{team.event_name ?? "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          team.demo_url ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" : "bg-white/[0.02] text-white/20 border-white/[0.05]"
                        }`} title="Stage 1: Presentation">PPT</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          team.repo_url ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-white/[0.02] text-white/20 border-white/[0.05]"
                        }`} title="Stage 2: Repository">Repo</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm">
                      {team.evaluation_status === "EVALUATED" ? (
                        <span className="text-white/90 font-bold bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">{Number(team.total_score).toFixed(1)}</span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        team.score_locked ? "text-red-400 bg-red-400/10 border-red-400/20"
                        : team.evaluation_status === "EVALUATED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                        : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                      }`}>
                        {team.score_locked ? <Lock className="w-3 h-3" /> : <div className={`w-1.5 h-1.5 rounded-full ${team.evaluation_status === "EVALUATED" ? "bg-emerald-400" : "bg-amber-400"}`} />}
                        {team.score_locked ? "Disqualified" : team.evaluation_status === "EVALUATED" ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/admin/v2/teams/${team.id}`} className="p-1.5 text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-md transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button className="p-1.5 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md transition-colors" title="Edit Team">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" title="Delete Team">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06] bg-white/[0.01]">
          <p className="text-sm text-white/40">
            Showing {teams.length > 0 ? (page - 1) * 10 + 1 : 0} to {Math.min(page * 10, total)} of {total} teams
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setPage(p => Math.max(1, p-1)); load(Math.max(1, page-1)); }} 
                disabled={page === 1} 
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-white/[0.05]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(totalPages)].map((_, i) => {
                  const p = i + 1;
                  // Show current, first, last, and neighbors
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <button 
                        key={p}
                        onClick={() => { setPage(p); load(p); }}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors border ${
                          page === p 
                            ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/30" 
                            : "bg-transparent text-white/50 hover:bg-white/[0.04] border-transparent hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  } else if (p === page - 2 || p === page + 2) {
                    return <span key={p} className="text-white/30 px-1">...</span>;
                  }
                  return null;
                })}
              </div>
              <button 
                onClick={() => { setPage(p => Math.min(totalPages, p+1)); load(Math.min(totalPages, page+1)); }} 
                disabled={page === totalPages} 
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors border border-white/[0.05]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
