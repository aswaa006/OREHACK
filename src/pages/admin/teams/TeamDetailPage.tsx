import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ExternalLink, Lock, Unlock, Users, Mail,
  FileText, BarChart3, ChevronRight, Edit3, Check, Presentation, Code2
} from "lucide-react";
import { getTeam, toggleTeamScoreLock, updateTeamSubmission, evaluateTeam, type Team } from "@/lib/admin-api";
import { toast } from "sonner";

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-white/50 mb-1.5">
        <span>{label}</span>
        <span className="font-mono font-bold text-white/80">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function formatReasoning(text: string): JSX.Element {
  const parts = text.split(/\s*\|\s*/).filter(Boolean);
  if (parts.length <= 1) {
    return <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{text}</p>;
  }

  return (
    <div className="space-y-3">
      {parts.map((part, i) => {
        const colonIdx = part.indexOf(":");
        if (colonIdx > 0 && colonIdx < 20) {
          const label = part.slice(0, colonIdx).trim();
          const content = part.slice(colonIdx + 1).trim();
          return (
            <div key={i}>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-1">{label}</p>
              <p className="text-white/60 text-sm leading-relaxed">{content}</p>
            </div>
          );
        }
        return <p key={i} className="text-white/60 text-sm leading-relaxed">{part}</p>;
      })}
    </div>
  );
}

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [locking, setLocking] = useState(false);
  const [activeSection, setActiveSection] = useState<"scores" | "reasoning">("scores");

  // Editing state for submission
  const [editingProblem, setEditingProblem] = useState(false);
  const [problemText, setProblemText] = useState("");
  const [savingProblem, setSavingProblem] = useState(false);

  // Manual Evaluation state
  const [evaluating, setEvaluating] = useState(false);
  const [evalScores, setEvalScores] = useState({ technical: "", innovation: "", completeness: "", reasoning: "" });
  const [savingEval, setSavingEval] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    getTeam(id).then((t) => {
      setTeam(t);
      setProblemText(t.submission?.problem_statement || "");
      if (t.scores) {
        setEvalScores({
          technical: t.scores.technical.toString(),
          innovation: t.scores.innovation.toString(),
          completeness: t.scores.completeness.toString(),
          reasoning: t.submission?.reasoning || ""
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleToggleLock = async () => {
    if (!id) return;
    setLocking(true);
    try {
      const result = await toggleTeamScoreLock(id);
      setTeam((prev) => prev ? {
        ...prev,
        submission: prev.submission ? { ...prev.submission, score_locked: result.score_locked } : prev.submission,
      } : prev);
      toast.success(result.score_locked ? "Score locked" : "Score unlocked");
    } finally {
      setLocking(false);
    }
  };

  const handleSaveProblem = async () => {
    if (!id) return;
    setSavingProblem(true);
    try {
      await updateTeamSubmission(id, { problem_statement: problemText });
      toast.success("Problem statement updated");
      setEditingProblem(false);
      load(); // reload to get full state
    } catch (err: any) {
      toast.error(err.message || "Failed to update problem statement");
    } finally {
      setSavingProblem(false);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!id) return;
    setSavingEval(true);
    try {
      await evaluateTeam(id, {
        technical: parseFloat(evalScores.technical) || 0,
        innovation: parseFloat(evalScores.innovation) || 0,
        completeness: parseFloat(evalScores.completeness) || 0,
        reasoning: evalScores.reasoning
      });
      toast.success("Evaluation saved successfully!");
      setEvaluating(false);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to save evaluation");
    } finally {
      setSavingEval(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-16">
        <p className="text-white/40">Team not found.</p>
        <button onClick={() => navigate(-1)} className="text-indigo-400 text-sm mt-2 hover:text-indigo-300">← Go back</button>
      </div>
    );
  }

  const scores = team.scores;
  const submission = team.submission;
  const isLocked = submission?.score_locked ?? false;
  const isEvaluated = scores?.evaluated ?? false;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Teams
      </button>

      {/* Header */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-500/20 flex items-center justify-center">
                <span className="text-xl font-bold text-white/70">{team.team_name[0]}</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{team.team_name}</h1>
                <p className="text-white/40 text-sm">{team.institution}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {team.team_code && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-white/[0.04] border border-white/[0.08] text-white/50">
                  {team.team_code}
                </span>
              )}
              {submission?.submission_code && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  {submission.submission_code}
                </span>
              )}
              {isLocked && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-400/10 border border-red-400/20 text-red-400">
                  <Lock className="w-3 h-3" /> Score Locked
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {submission?.demo_url && (
              <a
                href={submission.demo_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 rounded-xl text-sm font-medium transition-colors border border-indigo-500/20"
              >
                <Presentation className="w-4 h-4" /> PPT
              </a>
            )}
            {submission?.repo_url && (
              <a
                href={submission.repo_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 rounded-xl text-sm font-medium transition-colors border border-purple-500/20"
              >
                <Code2 className="w-4 h-4" /> Repo
              </a>
            )}
            {scores?.evaluated && (
              <button
                onClick={handleToggleLock}
                disabled={locking}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isLocked
                    ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                    : "bg-white/[0.06] text-white/50 hover:bg-white/10 hover:text-white border border-white/[0.08]"
                }`}
              >
                {isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {isLocked ? "Unlock" : "Lock"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Team Members */}
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-violet-400" /> Team Members
          </h2>
          <div className="space-y-3">
            {(team.members ?? []).map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold shrink-0">
                  {member.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white/80 text-sm font-medium truncate">{member.name}</p>
                    {member.is_leader && (
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full">Leader</span>
                    )}
                  </div>
                  <p className="text-white/30 text-xs truncate">{member.email}</p>
                </div>
                <a href={`mailto:${member.email}`} className="text-white/20 hover:text-indigo-400 transition-colors shrink-0">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Problem Statement */}
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5 relative">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Problem Statement
            </h2>
            {!editingProblem ? (
              <button onClick={() => setEditingProblem(true)} className="text-white/40 hover:text-white/80 transition-colors">
                <Edit3 className="w-4 h-4" />
              </button>
            ) : null}
          </div>
          
          {editingProblem ? (
            <div className="space-y-3">
              <textarea 
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white/90 focus:border-indigo-500 focus:outline-none min-h-[100px]"
                placeholder="Enter problem statement here..."
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => { setEditingProblem(false); setProblemText(submission?.problem_statement || ""); }}
                  className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProblem}
                  disabled={savingProblem}
                  className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg flex items-center gap-1"
                >
                  {savingProblem ? "Saving..." : <><Check className="w-3 h-3" /> Save</>}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white/60 text-sm leading-relaxed">
              {submission?.problem_statement || "No problem statement assigned yet."}
            </p>
          )}
        </div>
      </div>

      {/* Scores + Reasoning */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
        {isEvaluated && !evaluating ? (
          <>
            <div className="flex border-b border-white/[0.06] items-center justify-between pr-4">
              <div className="flex">
                {(["scores", "reasoning"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveSection(tab)}
                    className={`px-6 py-3.5 text-sm font-medium transition-colors ${
                      activeSection === tab
                        ? "text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5"
                        : "text-white/40 hover:text-white/60"
                    }`}
                  >
                    {tab === "scores" ? "Score Breakdown" : "AI Reasoning"}
                  </button>
                ))}
              </div>
              {!isLocked && (
                <button 
                  onClick={() => setEvaluating(true)} 
                  className="text-xs flex items-center gap-1 text-white/40 hover:text-white/80 transition-colors"
                >
                  <Edit3 className="w-3 h-3" /> Edit Scores
                </button>
              )}
            </div>

            <div className="p-6">
              {activeSection === "scores" && (
                <div className="space-y-5">
                  <ScoreBar label="Technical" value={scores.technical} max={50} color="bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <ScoreBar label="Innovation" value={scores.innovation} max={30} color="bg-gradient-to-r from-violet-500 to-purple-500" />
                  <ScoreBar label="Completeness" value={scores.completeness} max={20} color="bg-gradient-to-r from-emerald-500 to-teal-500" />
                  <div className="border-t border-white/[0.06] pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/60 font-semibold">Total Score</span>
                      <span className="text-3xl font-bold text-white font-mono">{scores.total.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              )}
              {activeSection === "reasoning" && (
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-4 font-semibold">AI Analysis Reasoning</p>
                  {submission?.reasoning ? (
                    formatReasoning(submission.reasoning)
                  ) : (
                    <p className="text-white/30 text-sm">No reasoning available.</p>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                {evaluating ? "Manual Evaluation" : "Evaluate Team"}
              </h2>
              {isEvaluated && evaluating && (
                <button onClick={() => setEvaluating(false)} className="text-white/40 hover:text-white text-sm">Cancel</button>
              )}
            </div>

            {!evaluating && !isEvaluated ? (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm mb-4">This team has not been evaluated yet.</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => setEvaluating(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    Grade Manually
                  </button>
                  <Link
                    to="/admin/v2/evaluation/import"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors border border-white/10"
                  >
                    Import CSV
                  </Link>
                </div>
              </div>
            ) : null}

            {evaluating && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1">Technical (/50)</label>
                    <input 
                      type="number" max="50" min="0" step="0.1"
                      value={evalScores.technical}
                      onChange={(e) => setEvalScores(p => ({...p, technical: e.target.value}))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1">Innovation (/30)</label>
                    <input 
                      type="number" max="30" min="0" step="0.1"
                      value={evalScores.innovation}
                      onChange={(e) => setEvalScores(p => ({...p, innovation: e.target.value}))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1">Completeness (/20)</label>
                    <input 
                      type="number" max="20" min="0" step="0.1"
                      value={evalScores.completeness}
                      onChange={(e) => setEvalScores(p => ({...p, completeness: e.target.value}))}
                      className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1">Reasoning / Feedback</label>
                  <textarea 
                    value={evalScores.reasoning}
                    onChange={(e) => setEvalScores(p => ({...p, reasoning: e.target.value}))}
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-indigo-500" 
                    placeholder="Enter manual evaluation reasoning..."
                  />
                </div>
                <div className="pt-2">
                  <button 
                    onClick={handleSaveEvaluation}
                    disabled={savingEval}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-500/20"
                  >
                    {savingEval ? "Saving Evaluation..." : "Save Evaluation"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
