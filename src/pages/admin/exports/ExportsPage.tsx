import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText, BarChart3, Medal, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { getEvents, downloadParticipantsCsv, downloadEvaluationCsv, downloadLeaderboardCsv, type Event } from "@/lib/admin-api";

export default function ExportsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { getEvents().then(setEvents).catch(console.error); }, []);

  const handle = async (id: string, fn: () => Promise<void>) => {
    if (!selectedEvent) { setError("Select a hackathon first."); return; }
    setDownloading(id);
    setError("");
    setSuccess(null);
    try {
      await fn();
      setSuccess(id);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || "Download failed.");
    } finally {
      setDownloading(null);
    }
  };

  const exports = [
    {
      id: "participants",
      title: "Participant Export",
      subtitle: "Python CLI input",
      desc: "Clean CSV: submission_id, teamID, Team_Name, Problem_Statement, Repo_URL, Progress. No scores. No passwords.",
      icon: FileText,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-400/10",
      action: () => downloadParticipantsCsv(selectedEvent),
    },
    {
      id: "evaluation",
      title: "Evaluation Export",
      subtitle: "Full data",
      desc: "All scores (Technical, Innovation, Completeness, Total) + AI reasoning. No passwords.",
      icon: BarChart3,
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-400/10",
      action: () => downloadEvaluationCsv(selectedEvent),
    },
    {
      id: "leaderboard",
      title: "Leaderboard Export",
      subtitle: "Ranked results",
      desc: "Ranked team list with final scores. Only includes evaluated teams.",
      icon: Medal,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-400/10",
      action: () => downloadLeaderboardCsv(selectedEvent),
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Export Center</h1>
        <p className="text-white/40 text-sm mt-1">Download data exports for any hackathon event.</p>
      </div>

      <div>
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Hackathon</label>
        <select
          value={selectedEvent}
          onChange={(e) => { setSelectedEvent(e.target.value); setError(""); }}
          className="w-full bg-[#0d0d1a] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/40 appearance-none"
        >
          <option value="">Select a hackathon...</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {exports.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl p-5 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${exp.iconBg} flex items-center justify-center shrink-0`}>
                <exp.icon className={`w-5 h-5 ${exp.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-white font-semibold text-sm">{exp.title}</h3>
                  <span className="text-[10px] font-semibold text-white/30 bg-white/[0.04] border border-white/[0.08] px-1.5 py-0.5 rounded-full">{exp.subtitle}</span>
                </div>
                <p className="text-white/40 text-xs">{exp.desc}</p>
              </div>
              <button
                onClick={() => handle(exp.id, exp.action)}
                disabled={!!downloading || !selectedEvent}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/10 disabled:opacity-40 text-white/70 hover:text-white rounded-xl text-sm font-medium transition-colors shrink-0"
              >
                {downloading === exp.id ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : success === exp.id ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {success === exp.id ? "Done!" : "Download"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
