import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Users, FileText, BarChart3, Download, Settings,
  Trophy, Medal, Activity, Clock, CheckCircle2, ExternalLink,
  ChevronRight, Star, TrendingUp,
} from "lucide-react";
import {
  getEvent, getEventStats, type Event, type EventStats,
  downloadParticipantsCsv,
} from "@/lib/admin-api";
import TeamsTab from "./tabs/TeamsTab";
import EvaluationTab from "./tabs/EvaluationTab";
import ParticipantsTab from "./tabs/ParticipantsTab";
import LeaderboardTab from "./tabs/LeaderboardTab";
import ExportsTab from "./tabs/ExportsTab";
import SettingsTab from "./tabs/SettingsTab";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "participants", label: "Participants", icon: Users },
  { id: "teams", label: "Teams", icon: Users },
  { id: "evaluation", label: "Evaluation", icon: Trophy },
  { id: "leaderboard", label: "Leaderboard", icon: Medal },
  { id: "exports", label: "Exports", icon: Download },
  { id: "settings", label: "Settings", icon: Settings },
];

function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; cls: string }> = {
    EVALUATION: { label: "Evaluation Phase", cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
    COMPLETED: { label: "Completed", cls: "text-white/50 bg-white/5 border-white/10" },
    DRAFT: { label: "Draft", cls: "text-white/30 bg-white/5 border-white/[0.06]" },
    ARCHIVED: { label: "Archived", cls: "text-white/20 bg-white/5 border-white/[0.04]" },
  };
  const { label, cls } = cfg[status] ?? { label: status, cls: "text-white/40 bg-white/5 border-white/10" };
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>{label}</span>;
}

function OverviewTab({ event, stats }: { event: Event; stats: EventStats | null }) {
  if (!stats) return <div className="text-white/30 py-12 text-center text-sm">Loading stats...</div>;

  const evaluated = Number(stats.evaluated_count ?? 0);
  const total = Number(stats.submission_count ?? 0);
  const pct = total > 0 ? Math.round((evaluated / total) * 100) : 0;

  const cards = [
    { label: "Teams", value: stats.team_count, icon: Users, color: "text-violet-400", bg: "bg-violet-400/10" },
    { label: "Participants", value: stats.participant_count, icon: Activity, color: "text-pink-400", bg: "bg-pink-400/10" },
    { label: "Submissions", value: stats.submission_count, icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Evaluated", value: stats.evaluated_count, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Avg Score", value: stats.average_score ? Number(stats.average_score).toFixed(1) : "—", icon: BarChart3, color: "text-indigo-400", bg: "bg-indigo-400/10" },
    { label: "Top Score", value: stats.highest_score ? Number(stats.highest_score).toFixed(1) : "—", icon: Star, color: "text-amber-400", bg: "bg-amber-400/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
              <c.icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <p className="text-xl font-bold text-white">{c.value}</p>
            <p className="text-white/40 text-xs mt-0.5">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Eval progress */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Evaluation Progress</h3>
        <div className="flex justify-between text-xs text-white/50 mb-2">
          <span>{evaluated} of {total} evaluated</span>
          <span className="font-semibold text-white/70">{pct}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span className="text-white/40">{evaluated} Evaluated</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-white/10" /><span className="text-white/40">{total - evaluated} Pending</span></div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/admin/v2/evaluation/import?event_id=${event.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <TrendingUp className="w-4 h-4" /> Import Scores
          </Link>
          <Link
            to={`/admin/v2/evaluation/leaderboard?event_id=${event.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/10 text-white/70 rounded-xl text-sm font-medium transition-colors"
          >
            <Medal className="w-4 h-4" /> View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HackathonDetailPage() {
  const { hackathonId } = useParams<{ hackathonId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hackathonId) return;
    Promise.all([
      getEvent(hackathonId).then(setEvent),
      getEventStats(hackathonId).then(setStats),
    ]).finally(() => setLoading(false));
  }, [hackathonId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-white/40">Hackathon not found.</p>
        <Link to="/admin/v2/hackathons" className="text-indigo-400 text-sm mt-2 inline-block hover:text-indigo-300">
          ← Back to Hackathons
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link
          to="/admin/v2/hackathons"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 text-sm transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Hackathons
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{event.name}</h1>
            {event.institution && (
              <p className="text-white/50 text-sm mt-1">{event.institution}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              <StatusBadge status={event.status} />
              {event.leaderboard_visible && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border text-emerald-400 bg-emerald-400/10 border-emerald-400/20">
                  <Star className="w-3 h-3" /> Leaderboard Public
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06]">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                activeTab === tab.id
                  ? "text-indigo-400 border-indigo-500 bg-indigo-500/5"
                  : "text-white/40 border-transparent hover:text-white/60 hover:bg-white/[0.03]"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && <OverviewTab event={event} stats={stats} />}
        {activeTab === "participants" && hackathonId && <ParticipantsTab eventId={hackathonId} />}
        {activeTab === "teams" && hackathonId && <TeamsTab eventId={hackathonId} />}
        {activeTab === "evaluation" && hackathonId && <EvaluationTab eventId={hackathonId} />}
        {activeTab === "leaderboard" && hackathonId && <LeaderboardTab eventId={hackathonId} />}
        {activeTab === "exports" && hackathonId && <ExportsTab eventId={hackathonId} />}
        {activeTab === "settings" && event && <SettingsTab event={event} onUpdate={setEvent} />}
      </div>
    </div>
  );
}
