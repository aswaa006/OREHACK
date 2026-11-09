import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy,
  Medal,
  Sparkles,
  ArrowRight,
  Search,
  RefreshCw,
  ExternalLink,
  GitBranch,
  Layers,
  Award,
  ChevronRight,
  Flame,
  Clock,
  Lock,
  Cpu,
} from "lucide-react";
import {
  getEventSettings,
  getAllTeams,
  getAllEvaluations,
  DEFAULT_COMMON_PROBLEM_STATEMENT,
  OrehackTeam,
  OrehackEvaluation,
  OrehackEventSettings,
} from "@/lib/orehack-db";

export default function OrehackLeaderboard() {
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRound, setSelectedRound] = useState<"Overall" | "Round 1" | "Round 2" | "Side Quest">("Overall");
  const [showOverridePreview, setShowOverridePreview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [fetchedSettings, fetchedTeams, fetchedEvals] = await Promise.all([
        getEventSettings(),
        getAllTeams(),
        getAllEvaluations(),
      ]);
      setSettings(fetchedSettings);
      setTeams(fetchedTeams);
      setEvaluations(fetchedEvals);
    } catch (err) {
      console.error("Failed to load leaderboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate filtered and ranked list
  const approvedTeams = teams.filter((t) => t.is_approved);

  // Score mapping based on selected round
  const processedTeams = approvedTeams.map((team) => {
    let effectiveScore = team.total_score || 0;
    let maxPossible = 110;

    if (selectedRound === "Round 1") {
      effectiveScore = team.r1_score || 0;
      maxPossible = 35;
    } else if (selectedRound === "Round 2") {
      effectiveScore = team.r2_score || 0;
      maxPossible = 50;
    } else if (selectedRound === "Side Quest") {
      effectiveScore = team.sidequest_score || 0;
      maxPossible = 25;
    }

    return {
      ...team,
      effectiveScore,
      maxPossible,
    };
  });

  // Sort descending by effective score
  const sortedTeams = [...processedTeams].sort(
    (a, b) => (b.effectiveScore || 0) - (a.effectiveScore || 0)
  );

  // Search filter
  const filteredTeams = sortedTeams.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.team_name.toLowerCase().includes(q) ||
      t.team_special_id.toLowerCase().includes(q) ||
      t.leader_name.toLowerCase().includes(q)
    );
  });

  const top3 = filteredTeams.slice(0, 3);
  const isLocked = !settings.leaderboard_published && !showOverridePreview;

  return (
    <div className="min-h-screen bg-[#030206] text-white selection:bg-[#7c3aed] selection:text-white relative overflow-x-hidden font-sans pb-24">
      {/* ── Background Glow Elements ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-[#7c3aed]/15 via-[#6d28d9]/5 to-transparent blur-[120px]" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-purple-900/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      {/* ── Top Navigation Bar ── */}
      <header className="relative z-20 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/orehack"
              className="flex items-center px-3 py-1.5 rounded-xl bg-white shadow-md hover:bg-zinc-100 transition-colors"
            >
              <img
                src="/CH OREHACK Monogram Logo.png"
                alt="Orehack"
                className="h-6 w-auto object-contain"
              />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black tracking-wider uppercase text-white font-serif">
                  CODE CLASH 2026
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#7c3aed]/20 text-purple-300 border border-[#7c3aed]/40">
                  LEADERBOARD
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Emergency Response & Disaster Management Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={loadData}
              title="Refresh standings"
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-400" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/orehack/jury"
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Jury Portal
            </Link>

            <Link
              to="/orehack/admin"
              className="px-3 py-1.5 rounded-xl bg-[#7c3aed]/20 hover:bg-[#7c3aed]/30 border border-[#7c3aed]/50 text-xs font-bold text-purple-200 transition-colors"
            >
              Admin Deck
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold mb-3">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Tournament Standings</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400 font-mono">Live Sync</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase"
            style={{
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              textShadow: "0 4px 30px rgba(124,58,237,0.35)",
            }}
          >
            Tournament Leaderboard
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl mx-auto leading-relaxed">
            Evaluation out of <strong className="text-purple-300">110 Marks</strong> •{" "}
            Round 1 (35) + Round 2 with Tool (50) + Side Quest (25).
          </p>

          {/* Current Active Round Indicator */}
          <div className="flex items-center justify-center gap-3 mt-4 text-xs">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>Current Hackathon Stage:</span>
              <strong className="text-white font-bold">{settings.active_round}</strong>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900/80 border border-white/10 text-zinc-300">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Registered Teams:</span>
              <strong className="text-white font-bold">{approvedTeams.length}</strong>
            </div>
          </div>
        </div>

        {/* ── Standby Lock View if Leaderboard is Not Published ── */}
        {isLocked ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto rounded-3xl bg-[#0f0d18] border border-purple-500/30 p-8 sm:p-12 text-center shadow-[0_20px_70px_rgba(0,0,0,0.8),0_0_40px_rgba(124,58,237,0.15)] my-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
              <Lock className="w-8 h-8" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
              Leaderboard in Deliberation
            </h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6 leading-relaxed">
              Jury panels are actively scoring solutions for{" "}
              <strong className="text-purple-300">{settings.active_round}</strong>. Standings will be revealed once scores are verified.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setShowOverridePreview(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition-all flex items-center justify-center gap-2"
              >
                <span>Preview Deliberation Standings</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <Link
                to="/orehack/admin"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Open Admin Deck</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <>
            {/* ── Round Filters & Search Bar ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[#0d0b14]/80 p-3 sm:p-4 rounded-2xl border border-white/10 backdrop-blur-md">
              {/* Round Tabs */}
              <div className="flex items-center gap-1 sm:gap-2 p-1 bg-black/60 rounded-xl border border-white/5 w-full sm:w-auto overflow-x-auto">
                {(["Overall", "Round 1", "Round 2", "Side Quest"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRound(r)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      selectedRound === r
                        ? "bg-[#7c3aed] text-white shadow-md shadow-purple-900/40"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search team, leader or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#7c3aed] transition-colors"
                />
              </div>
            </div>

            {/* ── Top 3 Showcase Podium ── */}
            {top3.length > 0 && !searchQuery && top3[0].effectiveScore > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4 px-1">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Podium Leaders ({selectedRound})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end">
                  {/* Rank 2 (Silver) */}
                  {top3[1] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="order-2 md:order-1 rounded-2xl bg-[#0f0e1a] border border-zinc-700/50 p-5 relative overflow-hidden group hover:border-zinc-500 transition-all shadow-lg"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-400 to-zinc-600" />
                      <div className="flex justify-between items-start mb-3">
                        <span className="w-8 h-8 rounded-xl bg-zinc-700/40 border border-zinc-500/50 text-zinc-200 font-black text-sm flex items-center justify-center font-mono">
                          2
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                          Runner-Up
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {top3[1].team_name}
                      </h4>
                      <p className="text-xs font-mono text-zinc-400 mb-3">{top3[1].team_special_id}</p>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs mb-3">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">R1 Score:</span>
                          <span className="font-mono text-zinc-200">{top3[1].r1_score?.toFixed(1) ?? "0.0"}/35</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">R2 Score:</span>
                          <span className="font-mono text-purple-300">{top3[1].r2_score?.toFixed(1) ?? "0.0"}/50</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Side Quest:</span>
                          <span className="font-mono text-zinc-200">{top3[1].sidequest_score?.toFixed(1) ?? "0.0"}/25</span>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                        <span className="text-xs text-zinc-400 font-medium">Standings Score:</span>
                        <span className="text-2xl font-black text-zinc-100 font-mono">
                          {top3[1].effectiveScore?.toFixed(2)}
                          <span className="text-xs text-zinc-500 font-normal"> / {top3[1].maxPossible}</span>
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Rank 1 (Gold - Champion) */}
                  {top3[0] && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="order-1 md:order-2 rounded-2xl bg-gradient-to-b from-[#1b152d] via-[#120f20] to-[#0c0a17] border-2 border-amber-500/50 p-6 relative overflow-hidden group shadow-[0_15px_50px_rgba(245,158,11,0.2),0_0_40px_rgba(124,58,237,0.2)] md:-translate-y-3"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />
                      <div className="flex justify-between items-start mb-4">
                        <span className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black text-lg flex items-center justify-center font-mono shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                          1
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>Champion</span>
                        </div>
                      </div>

                      <h4 className="text-xl sm:text-2xl font-black text-white truncate group-hover:text-amber-300 transition-colors">
                        {top3[0].team_name}
                      </h4>
                      <p className="text-xs font-mono text-amber-300/80 mb-4">{top3[0].team_special_id}</p>

                      <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/20 space-y-1 text-xs mb-4">
                        <div className="flex justify-between">
                          <span className="text-zinc-300">R1 Score (/35):</span>
                          <span className="font-mono text-zinc-100">{top3[0].r1_score?.toFixed(1) ?? "0.0"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-300">R2 Score (/50):</span>
                          <span className="font-mono text-purple-300 font-bold">{top3[0].r2_score?.toFixed(1) ?? "0.0"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-300">Side Quest (/25):</span>
                          <span className="font-mono text-zinc-100">{top3[0].sidequest_score?.toFixed(1) ?? "0.0"}</span>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between border-t border-amber-500/20 pt-3">
                        <span className="text-xs text-amber-200 font-semibold uppercase tracking-wider">
                          Winning Aggregate:
                        </span>
                        <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                          {top3[0].effectiveScore?.toFixed(2)}
                          <span className="text-xs text-amber-400/60 font-normal"> / {top3[0].maxPossible}</span>
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Rank 3 (Bronze) */}
                  {top3[2] && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="order-3 md:order-3 rounded-2xl bg-[#0f0e1a] border border-amber-800/40 p-5 relative overflow-hidden group hover:border-amber-700 transition-all shadow-lg"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 to-amber-900" />
                      <div className="flex justify-between items-start mb-3">
                        <span className="w-8 h-8 rounded-xl bg-amber-900/30 border border-amber-700/50 text-amber-300 font-black text-sm flex items-center justify-center font-mono">
                          3
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60">
                          2nd Runner-Up
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                        {top3[2].team_name}
                      </h4>
                      <p className="text-xs font-mono text-zinc-400 mb-3">{top3[2].team_special_id}</p>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs mb-3">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">R1 Score:</span>
                          <span className="font-mono text-zinc-200">{top3[2].r1_score?.toFixed(1) ?? "0.0"}/35</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">R2 Score:</span>
                          <span className="font-mono text-purple-300">{top3[2].r2_score?.toFixed(1) ?? "0.0"}/50</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Side Quest:</span>
                          <span className="font-mono text-zinc-200">{top3[2].sidequest_score?.toFixed(1) ?? "0.0"}/25</span>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                        <span className="text-xs text-zinc-400 font-medium">Standings Score:</span>
                        <span className="text-2xl font-black text-zinc-100 font-mono">
                          {top3[2].effectiveScore?.toFixed(2)}
                          <span className="text-xs text-zinc-500 font-normal"> / {top3[2].maxPossible}</span>
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* ── Complete Standings Table ── */}
            <div className="rounded-2xl border border-white/10 bg-[#0e0c18]/90 overflow-hidden shadow-2xl backdrop-blur-md">
              <div className="p-4 sm:p-5 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/[0.02]">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>Tournament Performance Roster ({selectedRound})</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Official round-by-round breakdown out of 110 marks
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-[11px] font-mono text-purple-300">
                  Showing {filteredTeams.length} of {approvedTeams.length} Teams
                </span>
              </div>

              {filteredTeams.length === 0 ? (
                <div className="p-16 text-center text-zinc-400">
                  <Award className="w-10 h-10 text-purple-400/50 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">No teams evaluated yet</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? "No registered teams match your search query."
                      : "Official standings will update in real time as registered teams undergo jury deliberation."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/40 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        <th className="py-3 px-4 text-center w-16">Rank</th>
                        <th className="py-3 px-4">Team & Special ID</th>
                        <th className="py-3 px-4">Leader</th>
                        <th className="py-3 px-4 text-center">Round 1 (/35)</th>
                        <th className="py-3 px-4 text-center">Round 2 (/50)</th>
                        <th className="py-3 px-4 text-center">Side Quest (/25)</th>
                        <th className="py-3 px-4 text-right">Grand Total (/110)</th>
                        <th className="py-3 px-4 text-center">Repository</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs">
                      {filteredTeams.map((team, index) => {
                        const rankNumber = index + 1;
                        return (
                          <tr
                            key={team.team_special_id || index}
                            className={`hover:bg-white/[0.03] transition-colors ${
                              rankNumber === 1 && team.effectiveScore > 0
                                ? "bg-amber-500/[0.04]"
                                : rankNumber === 2 && team.effectiveScore > 0
                                ? "bg-zinc-400/[0.03]"
                                : rankNumber === 3 && team.effectiveScore > 0
                                ? "bg-amber-700/[0.03]"
                                : ""
                            }`}
                          >
                            {/* Rank */}
                            <td className="py-4 px-4 text-center font-mono">
                              {rankNumber === 1 && team.effectiveScore > 0 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-400/40">
                                  1
                                </span>
                              ) : rankNumber === 2 && team.effectiveScore > 0 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-700/40 text-zinc-200 font-bold border border-zinc-500/40">
                                  2
                                </span>
                              ) : rankNumber === 3 && team.effectiveScore > 0 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-900/30 text-amber-300 font-bold border border-amber-700/40">
                                  3
                                </span>
                              ) : (
                                <span className="text-zinc-500 font-bold">#{rankNumber}</span>
                              )}
                            </td>

                            {/* Team & ID */}
                            <td className="py-4 px-4">
                              <span className="font-bold text-white text-sm block">{team.team_name}</span>
                              <span className="font-mono text-[11px] text-purple-400">{team.team_special_id}</span>
                            </td>

                            {/* Leader */}
                            <td className="py-4 px-4 text-zinc-300 font-medium">
                              {team.leader_name}
                            </td>

                            {/* R1 (/35) */}
                            <td className="py-4 px-4 text-center font-mono font-bold text-zinc-300">
                              {team.r1_score?.toFixed(1) ?? "0.0"}
                            </td>

                            {/* R2 (/50) */}
                            <td className="py-4 px-4 text-center font-mono">
                              <span className="font-bold text-purple-300">
                                {team.r2_score?.toFixed(1) ?? "0.0"}
                              </span>
                              {team.r2_tool_score ? (
                                <span className="text-[10px] text-indigo-300 block">
                                  (Tool: {team.r2_tool_score.toFixed(1)}/30)
                                </span>
                              ) : null}
                            </td>

                            {/* Side Quest (/25) */}
                            <td className="py-4 px-4 text-center font-mono font-bold text-zinc-300">
                              {team.sidequest_score?.toFixed(1) ?? "0.0"}
                            </td>

                            {/* Grand Total (/110) */}
                            <td className="py-4 px-4 text-right">
                              <div className="font-mono font-black text-sm text-white">
                                {team.total_score?.toFixed(2) ?? "0.00"}
                              </div>
                              <div className="w-20 ml-auto h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full"
                                  style={{
                                    width: `${Math.min(100, Math.max(0, ((team.total_score || 0) / 110) * 100))}%`,
                                  }}
                                />
                              </div>
                            </td>

                            {/* Repository */}
                            <td className="py-4 px-4 text-center">
                              {team.repo_link ? (
                                <a
                                  href={team.repo_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-zinc-300 hover:text-white transition-colors"
                                >
                                  <GitBranch className="w-3 h-3 text-purple-400" />
                                  <span>Repo</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                </a>
                              ) : (
                                <span className="text-[11px] text-zinc-600 font-mono">Pending</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
