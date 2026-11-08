import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Mail, Filter, ChevronRight } from "lucide-react";
import { getParticipants, getEvents, type Participant, type Event } from "@/lib/admin-api";

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [evalFilter, setEvalFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => { getEvents().then(setEvents).catch(console.error); }, []);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getParticipants({
        event_id: eventFilter || undefined,
        page: p,
        limit: 25,
        search,
        evaluation_status: evalFilter || undefined,
      });
      setParticipants(res.data);
      setTotalPages(res.pagination?.pages ?? 1);
      setTotal(res.pagination?.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [eventFilter, evalFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Participants</h1>
        <p className="text-white/40 text-sm mt-1">{total} total participants across all events</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(1)}
            placeholder="Name, email, or team..."
            className="w-full bg-[#0d0d1a] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40"
          />
        </div>
        <select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)} className="bg-[#0d0d1a] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white/60 focus:outline-none focus:border-indigo-500/40 appearance-none">
          <option value="">All Hackathons</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <select value={evalFilter} onChange={(e) => setEvalFilter(e.target.value)} className="bg-[#0d0d1a] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white/60 focus:outline-none focus:border-indigo-500/40 appearance-none">
          <option value="">All Statuses</option>
          <option value="EVALUATED">Evaluated</option>
          <option value="PENDING">Pending</option>
        </select>
      </div>

      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Participant", "Team", "Event", "Role", "Contact", "Status"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {[...Array(6)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : participants.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-white/30 text-sm">No participants found.</td></tr>
              ) : (
                participants.map((p, i) => (
                  <motion.tr
                    key={p.participant_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                          {p.participant_name[0]}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{p.participant_name}</p>
                          <p className="text-white/30 text-xs">{p.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-white/60 text-sm">{p.team_name}</p>
                      <p className="text-white/30 text-xs">{p.team_institution}</p>
                    </td>
                    <td className="px-5 py-4 text-white/40 text-xs">{p.event_name ?? "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${p.is_leader ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-white/30 bg-white/5 border-white/[0.06]"}`}>
                        {p.is_leader ? "Leader" : "Member"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <a href={`mailto:${p.email}`} className="text-white/30 hover:text-indigo-400 transition-colors">
                        <Mail className="w-4 h-4" />
                      </a>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold ${p.evaluation_status === "EVALUATED" ? "text-emerald-400" : p.evaluation_status === "PENDING" ? "text-yellow-400" : "text-white/20"}`}>
                        {p.evaluation_status === "NO_SUBMISSION" ? "No Sub." : p.evaluation_status}
                      </span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => { setPage(p => Math.max(1, p-1)); load(Math.max(1, page-1)); }} disabled={page===1} className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] text-white/50 hover:bg-white/[0.08] disabled:opacity-30">Prev</button>
          <span className="text-white/30 text-sm">{page} / {totalPages}</span>
          <button onClick={() => { setPage(p => Math.min(totalPages, p+1)); load(Math.min(totalPages, page+1)); }} disabled={page===totalPages} className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] text-white/50 hover:bg-white/[0.08] disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}
