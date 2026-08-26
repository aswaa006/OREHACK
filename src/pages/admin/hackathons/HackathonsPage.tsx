import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus, Search, Filter, ExternalLink, MoreHorizontal,
  Calendar, Users, BarChart3, Archive, Settings,
  ChevronLeft, ChevronRight, Eye,
} from "lucide-react";
import { getEvents, archiveEvent, type Event } from "@/lib/admin-api";

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    REGISTRATION_OPEN: { label: "Open", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    REGISTRATION_CLOSED: { label: "Reg Closed", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    EVALUATION: { label: "Evaluation", cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    COMPLETED: { label: "Completed", cls: "text-white/50 bg-white/5 border-white/10" },
    DRAFT: { label: "Draft", cls: "text-white/30 bg-white/5 border-white/[0.06]" },
    ARCHIVED: { label: "Archived", cls: "text-white/20 bg-white/5 border-white/[0.04]" },
  };
  const { label, cls } = cfg[status] ?? { label: status, cls: "text-white/40 bg-white/5 border-white/10" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

function formatDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function HackathonsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) => {
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.institution ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleArchive = async (id: string) => {
    if (!confirm("Archive this hackathon? It will be hidden from active views.")) return;
    await archiveEvent(id);
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, status: "ARCHIVED" as const } : e)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Hackathons</h1>
          <p className="text-white/40 text-sm mt-1">{events.length} total events on the platform</p>
        </div>
        <Link
          to="/admin/v2/hackathons/create"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" />
          Create Hackathon
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or institution..."
            className="w-full bg-[#0d0d1a] border border-white/[0.07] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40 transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#0d0d1a] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white/60 focus:outline-none focus:border-indigo-500/40 transition-colors appearance-none"
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="REGISTRATION_OPEN">Registration Open</option>
          <option value="REGISTRATION_CLOSED">Registration Closed</option>
          <option value="EVALUATION">Evaluation</option>
          <option value="COMPLETED">Completed</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/30 uppercase tracking-widest">Hackathon</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/30 uppercase tracking-widest hidden md:table-cell">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/30 uppercase tracking-widest hidden lg:table-cell">Dates</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-white/30 uppercase tracking-widest hidden sm:table-cell">Created</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-white/30 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {[1, 2, 3, 4, 5].map((j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-white/[0.04] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-white/30 text-sm">
                    {search || filterStatus ? "No hackathons match your filters." : "No hackathons yet. Create your first one!"}
                  </td>
                </tr>
              ) : (
                filtered.map((event, i) => (
                  <motion.tr
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="text-white font-medium text-sm">{event.name}</p>
                        {event.institution && (
                          <p className="text-white/40 text-xs mt-0.5">{event.institution}</p>
                        )}
                        <div className="md:hidden mt-1">
                          <StatusBadge status={event.status} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <StatusBadge status={event.status} />
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <p className="text-white/50 text-xs">
                        {formatDate(event.start_date)} – {formatDate(event.end_date)}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-white/40 text-xs">{formatDate(event.created_at)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          to={`/admin/v2/hackathons/${event.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Open
                        </Link>
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === event.id ? null : event.id)}
                            className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.06] transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {actionMenuOpen === event.id && (
                            <div className="absolute right-0 top-8 w-40 bg-[#13131f] border border-white/[0.08] rounded-xl shadow-2xl z-10 py-1">
                              <Link
                                to={`/admin/v2/hackathons/${event.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </Link>
                              <Link
                                to={`/admin/v2/teams?event_id=${event.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                              >
                                <Users className="w-3.5 h-3.5" /> Teams
                              </Link>
                              <Link
                                to={`/admin/v2/evaluation/leaderboard?event_id=${event.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                              >
                                <BarChart3 className="w-3.5 h-3.5" /> Leaderboard
                              </Link>
                              <Link
                                to={`/admin/v2/exports?event_id=${event.id}`}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/[0.05] transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Export
                              </Link>
                              {event.status !== "ARCHIVED" && (
                                <button
                                  onClick={() => { handleArchive(event.id); setActionMenuOpen(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                                >
                                  <Archive className="w-3.5 h-3.5" /> Archive
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
