import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale,
  Award,
  CheckCircle2,
  ExternalLink,
  GitBranch,
  LogOut,
  Sparkles,
  Layers,
  Clock,
  Send,
  AlertCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllTeams,
  getAllEvaluations,
  getEventSettings,
  authenticateJury,
  submitJuryEvaluation,
  DEFAULT_COMMON_PROBLEM_STATEMENT,
  OrehackTeam,
  OrehackJury,
  OrehackEvaluation,
  OrehackEventSettings,
} from "@/lib/orehack-db";

export default function OrehackJuryPortal() {
  const [currentJury, setCurrentJury] = useState<OrehackJury | null>(null);
  const [juryIdInput, setJuryIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [settings, setSettings] = useState<OrehackEventSettings>({
    submissions_open: true,
    jury_evaluation_open: true,
    active_round: "Round 1",
    leaderboard_published: true,
    common_problem_statement: DEFAULT_COMMON_PROBLEM_STATEMENT,
    common_problem_description: "",
  });
  const [teams, setTeams] = useState<OrehackTeam[]>([]);
  const [evaluations, setEvaluations] = useState<OrehackEvaluation[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<OrehackTeam | null>(null);

  // Rubrics state for current round
  const [r1State, setR1State] = useState({
    problem_understanding: 4,
    core_functionality: 12,
    ui_ux: 8,
    innovation: 4,
  });

  const [r2State, setR2State] = useState({
    problem_understanding: 4,
    core_functionality: 16,
    technical_implementation: 8,
    ui_ux: 8,
    innovation: 4,
  });

  const [sqState, setSqState] = useState({
    correct_implementation: 8,
    integration: 4,
    technical_quality: 1.5,
    ui_ux: 4,
    creativity: 2.5,
  });

  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("orehack_active_jury");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setCurrentJury(parsed);
      } catch (e) {}
    }
    loadData();

    // Auto-sync when window gains focus or every 4 seconds so assignments reflect in real time
    const handleFocus = () => loadData();
    window.addEventListener("focus", handleFocus);
    const interval = setInterval(loadData, 4000);
    return () => {
      window.removeEventListener("focus", handleFocus);
      clearInterval(interval);
    };
  }, []);

  const loadData = async () => {
    const [fetchedSettings, fetchedTeams, fetchedEvals] = await Promise.all([
      getEventSettings(),
      getAllTeams(),
      getAllEvaluations(),
    ]);
    setSettings(fetchedSettings);
    setTeams(fetchedTeams);
    setEvaluations(fetchedEvals);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!juryIdInput.trim() || !passwordInput.trim()) {
      setAuthError("Enter your Jury ID / Phone and password.");
      return;
    }

    const res = await authenticateJury(juryIdInput, passwordInput);
    if (!res.success || !res.jury) {
      setAuthError(res.error || "Authentication failed.");
      toast.error(res.error || "Authentication failed.");
      return;
    }

    setCurrentJury(res.jury);
    sessionStorage.setItem("orehack_active_jury", JSON.stringify(res.jury));
    toast.success(`Welcome, ${res.jury.name}!`);
    loadData();
  };

  const handleLogout = () => {
    sessionStorage.removeItem("orehack_active_jury");
    setCurrentJury(null);
    toast.info("Logged out of Jury portal.");
  };

  // Active round rubric score calculation
  const getActiveRoundScore = () => {
    if (settings.active_round === "Round 1") {
      const sum =
        r1State.problem_understanding +
        r1State.core_functionality +
        r1State.ui_ux +
        r1State.innovation;
      return { raw: Number(sum.toFixed(2)), max: 35 };
    } else if (settings.active_round === "Round 2") {
      const sum =
        r2State.problem_understanding +
        r2State.core_functionality +
        r2State.technical_implementation +
        r2State.ui_ux +
        r2State.innovation;
      return { raw: Number(sum.toFixed(2)), max: 50 };
    } else {
      const sum =
        sqState.correct_implementation +
        sqState.integration +
        sqState.technical_quality +
        sqState.ui_ux +
        sqState.creativity;
      return { raw: Number(sum.toFixed(2)), max: 25 };
    }
  };

  const currentScoreInfo = getActiveRoundScore();

  const openEvaluationModal = (team: OrehackTeam) => {
    setSelectedTeam(team);

    // If already evaluated for this round, preload previous rubrics
    const existing = evaluations.find(
      (e) =>
        e.team_name.toLowerCase() === team.team_name.toLowerCase() &&
        e.jury_id === currentJury?.jury_id &&
        e.round === settings.active_round
    );

    if (existing && existing.rubrics) {
      if (settings.active_round === "Round 1") {
        setR1State({
          problem_understanding: existing.rubrics.problem_understanding ?? 4,
          core_functionality: existing.rubrics.core_functionality ?? 12,
          ui_ux: existing.rubrics.ui_ux ?? 8,
          innovation: existing.rubrics.innovation ?? 4,
        });
      } else if (settings.active_round === "Round 2") {
        setR2State({
          problem_understanding: existing.rubrics.problem_understanding ?? 4,
          core_functionality: existing.rubrics.core_functionality ?? 16,
          technical_implementation: existing.rubrics.technical_implementation ?? 8,
          ui_ux: existing.rubrics.ui_ux ?? 8,
          innovation: existing.rubrics.innovation ?? 4,
        });
      } else {
        setSqState({
          correct_implementation: existing.rubrics.correct_implementation ?? 8,
          integration: existing.rubrics.integration ?? 4,
          technical_quality: existing.rubrics.technical_quality ?? 1.5,
          ui_ux: existing.rubrics.ui_ux ?? 4,
          creativity: existing.rubrics.creativity ?? 2.5,
        });
      }
      setFeedback(existing.feedback || "");
    } else {
      // Default reset
      setFeedback("");
    }
  };

  const handleSubmitEvaluation = async () => {
    if (!selectedTeam || !currentJury) return;

    if (!settings.jury_evaluation_open) {
      toast.error("Evaluation is currently paused by the administrator.");
      return;
    }

    setSubmitting(true);
    try {
      const activeRubrics =
        settings.active_round === "Round 1"
          ? (r1State as any)
          : settings.active_round === "Round 2"
          ? (r2State as any)
          : (sqState as any);

      await submitJuryEvaluation({
        teamName: selectedTeam.team_name,
        juryId: currentJury.jury_id,
        juryName: currentJury.name,
        round: settings.active_round,
        rubrics: activeRubrics,
        rawScore: currentScoreInfo.raw,
        feedback,
      });

      toast.success(
        `Evaluation recorded for ${selectedTeam.team_name}: ${currentScoreInfo.raw}/${currentScoreInfo.max} marks!`
      );
      setSelectedTeam(null);
      loadData();
    } catch (err) {
      toast.error("Failed to submit score. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter strictly assigned teams for this jury member based on active round
  const assignedTeams = teams.filter((t) => {
    if (!currentJury) return false;
    if (settings.active_round === "Round 1") {
      const r1Jury = t.assigned_jury_r1_id !== undefined ? t.assigned_jury_r1_id : t.assigned_jury_id;
      return r1Jury === currentJury.jury_id;
    }
    if (settings.active_round === "Round 2") {
      return t.assigned_jury_r2_id === currentJury.jury_id;
    }
    if (settings.active_round === "Side Quest") {
      return t.assigned_jury_sidequest_id === currentJury.jury_id;
    }
    return t.assigned_jury_id === currentJury.jury_id;
  });

  // ── JURY LOGIN SCREEN ──
  if (!currentJury) {
    return (
      <div className="min-h-screen bg-[#030206] text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-[#7c3aed]">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-3xl bg-[#0f0e1a] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(124,58,237,0.15)] text-center"
        >
          <div className="h-8 px-3 rounded-xl bg-white inline-flex items-center justify-center mb-6 shadow-sm">
            <img src="/CH OREHACK Monogram Logo.png" alt="OreHack" className="h-5 w-auto object-contain" />
          </div>

          <h2 className="text-2xl font-black text-white font-serif uppercase tracking-tight mb-1">
            CODE CLASH 2026
          </h2>
          <p className="text-xs text-purple-300 font-bold tracking-wider uppercase mb-2">
            Jury Evaluation Portal
          </p>
          <p className="text-xs text-zinc-400 mb-6">
            Sign in with your registered Jury ID or 10-digit Phone Number.
          </p>

          {authError && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Jury ID / Registered Phone
              </label>
              <input
                type="text"
                value={juryIdInput}
                onChange={(e) => setJuryIdInput(e.target.value)}
                placeholder="e.g. JURY-01 or 9876543210"
                className="w-full px-4 py-3 rounded-xl bg-[#191726] border border-white/10 text-white text-sm focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                Password (10-Digit Phone Number)
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#191726] border border-white/10 text-white text-sm font-mono focus:outline-none focus:border-[#7c3aed]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] shadow-lg shadow-purple-900/40 transition-all"
            >
              Enter Jury Portal →
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
            <Link to="/orehack" className="text-zinc-500 hover:text-white">
              ← Participant Portal
            </Link>
            <Link to="/orehack/leaderboard" className="text-amber-400 hover:text-amber-300">
              Live Leaderboard ↗
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── AUTHENTICATED JURY WORKBENCH ──
  return (
    <div className="min-h-screen bg-[#030206] text-white flex flex-col font-sans selection:bg-[#7c3aed] pb-20">
      {/* ── Top Header Navigation ── */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/10 bg-[#0d0b16]/90 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-3">
          <Link to="/orehack" className="flex items-center gap-2.5">
            <div className="h-8 px-2.5 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <img src="/CH OREHACK Monogram Logo.png" alt="OreHack" className="h-5 w-auto object-contain" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-white">CODE CLASH 2026</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Jury Panel
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">Judge: {currentJury.name}</p>
            <p className="text-[11px] text-zinc-400">{currentJury.panel_name}</p>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Active Stage & Common PS Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#171329] to-[#0e0c19] border border-purple-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-purple-300">
                Current Active Round:
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/30 text-purple-200 border border-purple-400/50">
                {settings.active_round}
              </span>
              <span className="text-xs text-zinc-400">
                (Max {currentScoreInfo.max} Marks)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>Official Challenge:</span>
              <span className="text-purple-300">{settings.common_problem_statement}</span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-3xl">
              Score candidate teams strictly against the {settings.active_round} criteria. Marks are automatically combined into the final 110-mark tournament score.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                settings.jury_evaluation_open
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/30"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  settings.jury_evaluation_open ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              {settings.jury_evaluation_open ? "Evaluation Open" : "Evaluation Paused"}
            </span>
          </div>
        </div>

        {/* Assigned Teams Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Assigned Teams ({assignedTeams.length})</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Click on any team card to evaluate their solution for {settings.active_round}.
              </p>
            </div>
          </div>

          {assignedTeams.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[#12101b] border border-white/10 text-zinc-400">
              <UserCheck className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No teams assigned to your panel yet</p>
              <p className="text-xs text-zinc-500 mt-1">
                The administrator will allocate teams to {currentJury.panel_name} shortly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedTeams.map((team) => {
                const evalRecord = evaluations.find(
                  (e) =>
                    e.team_name.toLowerCase() === team.team_name.toLowerCase() &&
                    e.jury_id === currentJury.jury_id &&
                    e.round === settings.active_round
                );
                const isEvaluated = Boolean(evalRecord);

                return (
                  <motion.div
                    key={team.team_special_id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => openEvaluationModal(team)}
                    className={`p-5 rounded-2xl bg-[#12101b] border cursor-pointer transition-all space-y-3 group ${
                      isEvaluated
                        ? "border-emerald-500/40 hover:border-emerald-500"
                        : "border-white/10 hover:border-purple-500/50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[11px] font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                        {team.team_special_id}
                      </span>
                      {isEvaluated ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Scored: {evalRecord?.raw_score}</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          Pending Score
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        {team.team_name}
                      </h4>
                      <p className="text-xs text-zinc-400">Leader: {team.leader_name}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500">Repository:</span>
                        {team.repo_link ? (
                          <a
                            href={team.repo_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                          >
                            <GitBranch className="w-3 h-3" />
                            <span>View Code</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-zinc-500 italic">Not submitted</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs text-purple-300 font-bold">
                      <span>Click to Evaluate {settings.active_round}</span>
                      <span>→</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* ── MODAL: EVALUATION RUBRIC FORM ── */}
      <AnimatePresence>
        {selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 rounded-3xl bg-[#141222] border border-purple-500/30 shadow-2xl space-y-5 my-8"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-xs text-purple-400 font-bold">
                    {selectedTeam.team_special_id}
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    {selectedTeam.team_name}
                  </h3>
                  <p className="text-xs text-zinc-400">Leader: {selectedTeam.leader_name}</p>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-zinc-500 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Problem Statement & Repo Link preview */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Challenge:</span>
                  <p className="text-white font-medium">{settings.common_problem_statement}</p>
                </div>
                {selectedTeam.repo_link && (
                  <div className="pt-1 flex items-center gap-1.5">
                    <span className="text-zinc-500">Repository Link:</span>
                    <a
                      href={selectedTeam.repo_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-white underline font-mono flex items-center gap-1"
                    >
                      <span>{selectedTeam.repo_link}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Active Round Title Banner */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-black uppercase text-purple-300">
                  {settings.active_round} Official Rubric
                </span>
                <span className="font-mono text-base font-black text-white">
                  Score: {currentScoreInfo.raw} / {currentScoreInfo.max}
                </span>
              </div>

              {/* ── RUBRICS FORM: DYNAMIC BY ROUND ── */}
              {settings.active_round === "Round 1" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Problem Understanding (Max 5)</span>
                      <span className="font-mono font-bold text-purple-300">{r1State.problem_understanding}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={r1State.problem_understanding}
                      onChange={(e) =>
                        setR1State({ ...r1State, problem_understanding: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Core Functionality (Max 15)</span>
                      <span className="font-mono font-bold text-purple-300">{r1State.core_functionality}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={15}
                      step={0.5}
                      value={r1State.core_functionality}
                      onChange={(e) =>
                        setR1State({ ...r1State, core_functionality: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">UI/UX Design & User Experience (Max 10)</span>
                      <span className="font-mono font-bold text-purple-300">{r1State.ui_ux}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={r1State.ui_ux}
                      onChange={(e) =>
                        setR1State({ ...r1State, ui_ux: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Innovation (Max 5)</span>
                      <span className="font-mono font-bold text-purple-300">{r1State.innovation}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={r1State.innovation}
                      onChange={(e) =>
                        setR1State({ ...r1State, innovation: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>
                </div>
              )}

              {settings.active_round === "Round 2" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Problem Understanding (Max 5)</span>
                      <span className="font-mono font-bold text-purple-300">{r2State.problem_understanding}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={r2State.problem_understanding}
                      onChange={(e) =>
                        setR2State({ ...r2State, problem_understanding: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Core Functionality (Max 20)</span>
                      <span className="font-mono font-bold text-purple-300">{r2State.core_functionality}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={0.5}
                      value={r2State.core_functionality}
                      onChange={(e) =>
                        setR2State({ ...r2State, core_functionality: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Technical Implementation (Max 10)</span>
                      <span className="font-mono font-bold text-purple-300">{r2State.technical_implementation}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={r2State.technical_implementation}
                      onChange={(e) =>
                        setR2State({ ...r2State, technical_implementation: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">UI/UX Design & User Experience (Max 10)</span>
                      <span className="font-mono font-bold text-purple-300">{r2State.ui_ux}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={r2State.ui_ux}
                      onChange={(e) =>
                        setR2State({ ...r2State, ui_ux: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Innovation (Max 5)</span>
                      <span className="font-mono font-bold text-purple-300">{r2State.innovation}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={r2State.innovation}
                      onChange={(e) =>
                        setR2State({ ...r2State, innovation: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>
                </div>
              )}

              {settings.active_round === "Side Quest" && (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Correct Implementation (Max 10)</span>
                      <span className="font-mono font-bold text-purple-300">{sqState.correct_implementation}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={sqState.correct_implementation}
                      onChange={(e) =>
                        setSqState({ ...sqState, correct_implementation: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Integration with Existing App (Max 5)</span>
                      <span className="font-mono font-bold text-purple-300">{sqState.integration}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={sqState.integration}
                      onChange={(e) =>
                        setSqState({ ...sqState, integration: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Technical Quality (Max 2)</span>
                      <span className="font-mono font-bold text-purple-300">{sqState.technical_quality}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={2}
                      step={0.25}
                      value={sqState.technical_quality}
                      onChange={(e) =>
                        setSqState({ ...sqState, technical_quality: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">UI/UX (Max 5)</span>
                      <span className="font-mono font-bold text-purple-300">{sqState.ui_ux}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={5}
                      step={0.5}
                      value={sqState.ui_ux}
                      onChange={(e) =>
                        setSqState({ ...sqState, ui_ux: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-300">Creativity (Max 3)</span>
                      <span className="font-mono font-bold text-purple-300">{sqState.creativity}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={3}
                      step={0.25}
                      value={sqState.creativity}
                      onChange={(e) =>
                        setSqState({ ...sqState, creativity: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#7c3aed]"
                    />
                  </div>
                </div>
              )}

              {/* Feedback Field */}
              <div>
                <label className="text-xs font-bold text-zinc-400 block mb-1">
                  Jury Observations / Defense Notes
                </label>
                <textarea
                  rows={2}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Note strengths, technical shortcomings, or prototype functionality..."
                  className="w-full p-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#7c3aed]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTeam(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitEvaluation}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-lg transition-all flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Score ({currentScoreInfo.raw}/{currentScoreInfo.max})</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
