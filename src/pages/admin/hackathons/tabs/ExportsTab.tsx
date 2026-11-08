import React, { useState } from "react";
import { downloadParticipantsCsv, downloadEvaluationCsv, downloadLeaderboardCsv, downloadBackendCsv } from "@/lib/admin-api";
import { Download, FileText, BarChart3, Medal, CheckCircle2, AlertCircle, Database } from "lucide-react";

interface ExportOption {
  id: string;
  title: string;
  desc: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  action: () => Promise<void>;
  note: string;
}

export default function ExportsTab({ eventId }: { eventId: string }) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (id: string, fn: () => Promise<void>) => {
    setDownloading(id);
    setSuccess(null);
    setError(null);
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

  const exports: ExportOption[] = [
    {
      id: "participants",
      title: "Participant Export",
      desc: "Clean CSV for Python CLI analysis. Contains submission_id, teamID, Team_Name, Problem_Statement, Repo_URL, Progress. No scores. No passwords.",
      icon: FileText,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-400/10",
      action: () => downloadParticipantsCsv(eventId),
      note: "Use this as input for the Python analysis workflow.",
    },
    {
      id: "evaluation",
      title: "Evaluation Export",
      desc: "Full data including all scores (Technical, Innovation, Completeness, Total) and AI reasoning. No passwords.",
      icon: BarChart3,
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-400/10",
      action: () => downloadEvaluationCsv(eventId),
      note: "Only available after scores have been imported.",
    },
    {
      id: "leaderboard",
      title: "Leaderboard Export",
      desc: "Ranked team list with final scores. Ranked by Total Score with proper tie handling.",
      icon: Medal,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-400/10",
      action: () => downloadLeaderboardCsv(eventId),
      note: "Only includes evaluated teams.",
    },
    {
      id: "backend",
      title: "Backend Export",
      desc: "Formatted specifically for the Python backend with all scores, reasoning, and leader email as password.",
      icon: Database,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-400/10",
      action: () => downloadBackendCsv(eventId),
      note: "Used for system-level data migration and backup.",
    },
  ];

  return (
    <div className="space-y-4 max-w-2xl">
      <p className="text-white/40 text-sm">Download data exports for this hackathon. The participant export is the starting point for the Python CLI analysis workflow.</p>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {exports.map((exp) => (
          <div key={exp.id} className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl p-5 hover:border-white/10 transition-colors">
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${exp.iconBg} flex items-center justify-center shrink-0`}>
                <exp.icon className={`w-5 h-5 ${exp.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm mb-1">{exp.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed mb-2">{exp.desc}</p>
                <p className="text-white/25 text-xs italic">{exp.note}</p>
              </div>
              <button
                onClick={() => handleDownload(exp.id, exp.action)}
                disabled={!!downloading}
                className="flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/10 disabled:opacity-50 text-white/70 hover:text-white rounded-xl text-sm font-medium transition-colors shrink-0"
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
                {success === exp.id ? "Downloaded!" : "Download"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow hint */}
      <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-4">
        <h4 className="text-indigo-400 text-sm font-semibold mb-2">📋 Python CLI Workflow</h4>
        <ol className="text-white/40 text-xs space-y-1 list-decimal list-inside">
          <li>Download <strong className="text-white/60">Participant Export</strong> (clean CSV)</li>
          <li>Run your Python CLI on the CSV to analyze repositories</li>
          <li>Python adds: Tech_Scores, Innov_Scores, Completeness_Scores, Total_Scores, Reasoning</li>
          <li>Go to <strong className="text-white/60">Import Scores</strong> and upload the completed CSV</li>
          <li>Review preview → Confirm import → Scores appear in Evaluation dashboard</li>
        </ol>
      </div>
    </div>
  );
}
