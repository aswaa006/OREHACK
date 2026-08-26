import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, Filter } from "lucide-react";
import { getAuditLogs, type AuditLog } from "@/lib/admin-api";

const ACTION_COLORS: Record<string, string> = {
  SCORE_IMPORT: "text-blue-400",
  HACKATHON_CREATED: "text-emerald-400",
  TEAM_REGISTERED: "text-violet-400",
  USER_LOGIN: "text-white/60",
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [action, setAction] = useState("");

  const load = async (p = 1, a = action) => {
    setLoading(true);
    try {
      const res = await getAuditLogs({ page: p, action: a || undefined });
      setLogs(res.data);
      setTotalPages(res.pagination?.pages ?? 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, [action]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
        <p className="text-white/40 text-sm mt-1">Full history of admin actions on the platform.</p>
      </div>

      <select
        value={action}
        onChange={(e) => setAction(e.target.value)}
        className="bg-[#0d0d1a] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white/60 focus:outline-none focus:border-indigo-500/40 appearance-none"
      >
        <option value="">All Actions</option>
        <option value="SCORE_IMPORT">Score Import</option>
        <option value="USER_LOGIN">User Login</option>
        <option value="HACKATHON_CREATED">Hackathon Created</option>
      </select>

      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Action", "Entity", "User", "Details", "Time"].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  {[...Array(5)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-white/30 text-sm">No audit logs yet.</td></tr>
            ) : (
              logs.map((log, i) => (
                <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <span className={`text-sm font-mono font-medium ${ACTION_COLORS[log.action] ?? "text-white/60"}`}>{log.action}</span>
                  </td>
                  <td className="px-5 py-4 text-white/40 text-xs">
                    {log.entity_type && <p>{log.entity_type}</p>}
                    {log.entity_id && <p className="font-mono text-white/20 truncate max-w-[100px]">{log.entity_id}</p>}
                  </td>
                  <td className="px-5 py-4 text-white/40 text-xs">{log.user_email ?? "—"}</td>
                  <td className="px-5 py-4 text-white/30 text-xs">
                    {log.details && <span className="font-mono">{typeof log.details === "string" ? log.details.slice(0, 60) : JSON.stringify(log.details).slice(0, 60)}…</span>}
                  </td>
                  <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
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
