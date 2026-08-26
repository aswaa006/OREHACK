import React, { useEffect, useState } from "react";
import { getParticipants, type Participant } from "@/lib/admin-api";
import { Search, Mail, Phone } from "lucide-react";

export default function ParticipantsTab({ eventId }: { eventId: string }) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const load = async (p = 1, s = search) => {
    setLoading(true);
    try {
      const res = await getParticipants({ event_id: eventId, page: p, limit: 20, search: s });
      setParticipants(res.data);
      setTotalPages(res.pagination?.pages ?? 1);
      setTotal(res.pagination?.total ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [eventId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">{total} participants registered</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); load(1, e.target.value); }}
            placeholder="Search participants..."
            className="bg-[#0d0d1a] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40 w-56"
          />
        </div>
      </div>

      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Participant", "Team", "Role", "Contact", "Submission"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  {[...Array(5)].map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : participants.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-white/30 text-sm">No participants found.</td></tr>
            ) : (
              participants.map((p) => (
                <tr key={p.participant_id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                        {p.participant_name[0]}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{p.participant_name}</p>
                        <p className="text-white/30 text-xs">{p.department}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white/60 text-sm">{p.team_name}</p>
                    <p className="text-white/30 text-xs">{p.team_institution}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${p.is_leader ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-white/30 bg-white/5 border-white/[0.06]"}`}>
                      {p.is_leader ? "Leader" : "Member"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a href={`mailto:${p.email}`} className="text-white/40 hover:text-indigo-400 transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${
                      p.evaluation_status === "EVALUATED" ? "text-emerald-400"
                      : p.evaluation_status === "PENDING" ? "text-yellow-400"
                      : "text-white/30"
                    }`}>
                      {p.evaluation_status === "NO_SUBMISSION" ? "No Submission" : p.evaluation_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => { setPage(p => Math.max(1, p-1)); load(Math.max(1, page-1)); }} disabled={page===1} className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] text-white/50 hover:bg-white/[0.08] disabled:opacity-30 transition-colors">Prev</button>
          <span className="text-white/30 text-sm">{page} / {totalPages}</span>
          <button onClick={() => { setPage(p => Math.min(totalPages, p+1)); load(Math.min(totalPages, page+1)); }} disabled={page===totalPages} className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] text-white/50 hover:bg-white/[0.08] disabled:opacity-30 transition-colors">Next</button>
        </div>
      )}
    </div>
  );
}
