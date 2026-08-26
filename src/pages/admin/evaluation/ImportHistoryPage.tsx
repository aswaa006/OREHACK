import React, { useEffect, useState } from "react";
import { getImportHistory, getEvents, type ScoreImport, type Event } from "@/lib/admin-api";
import { motion } from "framer-motion";
import { History, CheckCircle2, AlertCircle, FileText } from "lucide-react";

function formatDate(d: string) {
  return new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function ImportHistoryPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [imports, setImports] = useState<ScoreImport[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { getEvents().then(setEvents).catch(console.error); }, []);

  const load = async (ev = selectedEvent, p = 1) => {
    if (!ev) return;
    setLoading(true);
    try {
      const res = await getImportHistory(ev, p);
      setImports(res.data);
      setTotalPages(res.pagination?.pages ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [selectedEvent]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Import History</h1>
        <p className="text-white/40 text-sm mt-1">Track all CSV score imports for each hackathon.</p>
      </div>

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
          <History className="w-8 h-8 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Select a hackathon to view import history.</p>
        </div>
      ) : (
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["File", "Date", "Total", "Success", "Failed", "Status", "Uploaded By"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {[...Array(7)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                  </tr>
                ))
              ) : imports.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-white/30 text-sm">No imports found for this hackathon.</td></tr>
              ) : (
                imports.map((imp, i) => (
                  <motion.tr
                    key={imp.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-white/20 shrink-0" />
                        <p className="text-white/70 text-sm truncate max-w-[180px]">{imp.file_name_original ?? imp.file_name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/40 text-xs whitespace-nowrap">{formatDate(imp.created_at)}</td>
                    <td className="px-5 py-4 text-white/60 text-sm font-mono">{imp.total_rows}</td>
                    <td className="px-5 py-4 text-emerald-400 text-sm font-mono font-semibold">{imp.successful_rows}</td>
                    <td className="px-5 py-4 text-sm font-mono">
                      <span className={imp.failed_rows > 0 ? "text-red-400 font-semibold" : "text-white/30"}>{imp.failed_rows}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        imp.status === "COMPLETED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                        : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                      }`}>
                        {imp.status === "COMPLETED" ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {imp.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-white/30 text-xs">{imp.uploaded_by ?? "—"}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => { setPage(p => Math.max(1, p-1)); load(selectedEvent, Math.max(1, page-1)); }} disabled={page===1} className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] text-white/50 hover:bg-white/[0.08] disabled:opacity-30">Prev</button>
          <span className="text-white/30 text-sm">{page} / {totalPages}</span>
          <button onClick={() => { setPage(p => Math.min(totalPages, p+1)); load(selectedEvent, Math.min(totalPages, page+1)); }} disabled={page===totalPages} className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.04] text-white/50 hover:bg-white/[0.08] disabled:opacity-30">Next</button>
        </div>
      )}
    </div>
  );
}
