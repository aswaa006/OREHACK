import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  Users,
  Calendar,
  Activity,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileText,
  BarChart3,
  AlertCircle,
  Star,
  LineChart,
  TrendingUp,
} from "lucide-react";
import {
  getDashboardStats,
  getActiveHackathons,
  getRecentSubmissions,
  getRecentActivity,
  type DashboardStats,
  type Event,
  type RecentActivity,
} from "@/lib/admin-api";

// ── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bg: string;
  suffix?: string;
  loading?: boolean;
}

function StatCard({ title, value, icon: Icon, color, bg, suffix, loading }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl p-5 hover:border-white/10 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">{title}</p>
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-white/5 rounded-lg animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-white">{value ?? "—"}</span>
          {suffix && <span className="text-sm text-white/30">{suffix}</span>}
        </div>
      )}
    </motion.div>
  );
}

// ── Evaluation Progress Bar ───────────────────────────────────────────────────

function EvalProgressBar({ evaluated, pending }: { evaluated: number; pending: number }) {
  const total = evaluated + pending;
  if (total === 0) return <p className="text-sm text-white/30">No submissions yet.</p>;
  const pct = Math.round((evaluated / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-white/50 mb-2">
        <span>{evaluated} Evaluated</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/30 mt-2">
        <span>{pending} Pending</span>
        <span>{total} Total</span>
      </div>
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    REGISTRATION_OPEN: { label: "Open", cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
    REGISTRATION_CLOSED: { label: "Closed", cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
    EVALUATION: { label: "Evaluation", cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    COMPLETED: { label: "Completed", cls: "text-white/60 bg-white/5 border-white/10" },
    DRAFT: { label: "Draft", cls: "text-white/40 bg-white/5 border-white/10" },
    ARCHIVED: { label: "Archived", cls: "text-white/20 bg-white/5 border-white/5" },
  };
  const { label, cls } = cfg[status] ?? { label: status, cls: "text-white/40 bg-white/5 border-white/10" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}>
      {label}
    </span>
  );
}

// ── Activity icon ─────────────────────────────────────────────────────────────

function ActivityIcon({ action }: { action: string }) {
  const map: Record<string, { icon: React.ElementType; color: string }> = {
    SCORE_IMPORT: { icon: TrendingUp, color: "text-blue-400" },
    HACKATHON_CREATED: { icon: Calendar, color: "text-emerald-400" },
    TEAM_REGISTERED: { icon: Users, color: "text-purple-400" },
  };
  const { icon: Icon, color } = map[action] ?? { icon: Activity, color: "text-white/40" };
  return <Icon className={`w-4 h-4 ${color}`} />;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [hackathons, setHackathons] = useState<Event[]>([]);
  const [recentSubs, setRecentSubs] = useState<any[]>([]);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [s, h, rs, a] = await Promise.all([
          getDashboardStats(),
          getActiveHackathons(),
          getRecentSubmissions(),
          getRecentActivity(),
        ]);
        setStats(s);
        setHackathons(h);
        setRecentSubs(rs);
        setActivity(a);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statCards: StatCardProps[] = [
    {
      title: "Total Hackathons",
      value: stats?.total_hackathons ?? "—",
      icon: Calendar,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      title: "Active Hackathons",
      value: stats?.active_hackathons ?? "—",
      icon: Activity,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      title: "Total Teams",
      value: stats?.total_teams ?? "—",
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      title: "Total Participants",
      value: stats?.total_participants ?? "—",
      icon: Users,
      color: "text-pink-400",
      bg: "bg-pink-400/10",
    },
    {
      title: "Pending Evaluation",
      value: stats?.pending_evaluation ?? "—",
      icon: Clock,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      title: "Evaluated Teams",
      value: stats?.evaluated_teams ?? "—",
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
    },
    {
      title: "Average Score",
      value: stats?.average_score ? parseFloat(stats.average_score).toFixed(1) : "—",
      icon: BarChart3,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
    },
    {
      title: "Highest Score",
      value: stats?.highest_score ? parseFloat(stats.highest_score).toFixed(1) : "—",
      icon: Star,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/60 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-white/40 text-sm mt-1">Real-time data from all hackathon events.</p>
        </div>
        <Link
          to="/admin/v2/hackathons/create"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Calendar className="w-4 h-4" />
          New Hackathon
        </Link>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Registration Trend Chart Placeholder */}
      <section className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">Registration Trend</h2>
            <p className="text-white/40 text-xs mt-1">Participant and team registrations over the last 30 days</p>
          </div>
          <select className="bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-1.5 text-xs text-white/70 focus:outline-none focus:border-indigo-500/40">
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Year</option>
          </select>
        </div>
        <div className="h-64 w-full bg-white/[0.02] border border-white/[0.04] rounded-lg flex flex-col items-center justify-center border-dashed">
          <LineChart className="w-8 h-8 text-white/20 mb-3" />
          <p className="text-white/30 text-sm font-medium">Chart visualization will appear here</p>
          <p className="text-white/20 text-xs mt-1">Connect your charting library (e.g., Recharts or Chart.js)</p>
        </div>
      </section>

      {/* Active Hackathons */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white">Active Hackathons</h2>
          <Link
            to="/admin/v2/hackathons"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 bg-white/[0.03] rounded-xl animate-pulse border border-white/[0.04]" />
            ))}
          </div>
        ) : hackathons.length === 0 ? (
          <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl p-8 text-center">
            <Calendar className="w-8 h-8 text-white/20 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No active hackathons. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hackathons.map((event) => {
              const total = Number(event.team_count ?? 0);
              const evaluated = Number(event.evaluated_count ?? 0);
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl p-5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white font-semibold text-sm">{event.name}</p>
                      {event.institution && (
                        <p className="text-white/40 text-xs mt-0.5">{event.institution}</p>
                      )}
                    </div>
                    <StatusBadge status={event.status} />
                  </div>
                  <div className="mt-3">
                    <EvalProgressBar evaluated={evaluated} pending={Math.max(0, total - evaluated)} />
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-white/30 text-xs">{total} teams</p>
                    <Link
                      to={`/admin/v2/hackathons/${event.id}`}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      Open <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Recent Submissions + Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <section className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Recent Submissions</h2>
            <Link to="/admin/v2/participants" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 bg-white/[0.02] animate-pulse mx-5 my-2 rounded-lg" />
              ))
            ) : recentSubs.length === 0 ? (
              <div className="px-5 py-8 text-center text-white/30 text-sm">No submissions yet.</div>
            ) : (
              recentSubs.map((sub, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 text-sm font-medium truncate">{sub.team_name}</p>
                    <p className="text-white/30 text-xs truncate">{sub.event_name} · {sub.submission_id}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    sub.evaluation_status === "EVALUATED"
                      ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                      : "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                  }`}>
                    {sub.evaluation_status === "EVALUATED" ? "Evaluated" : "Pending"}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/[0.02] animate-pulse mx-5 my-2 rounded-lg" />
              ))
            ) : activity.length === 0 ? (
              <div className="px-5 py-8 text-center text-white/30 text-sm">No recent activity.</div>
            ) : (
              activity.slice(0, 8).map((log) => (
                <div key={log.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                    <ActivityIcon action={log.action} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/60 text-xs font-medium">{log.action.replace(/_/g, " ")}</p>
                    {log.user_email && (
                      <p className="text-white/25 text-xs truncate">{log.user_email}</p>
                    )}
                  </div>
                  <span className="text-white/25 text-xs shrink-0">{timeAgo(log.created_at)}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
