import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Github,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Code2,
  Sparkles,
  HelpCircle,
  Layers,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  submitOrehackProject,
  getOrehackSubmission,
  getEventSettings,
  DEFAULT_COMMON_PROBLEM_STATEMENT,
  DEFAULT_COMMON_PROBLEM_DESCRIPTION,
} from "@/lib/orehack-db";

interface TeamSession {
  teamName: string;
  leaderName: string;
  teamSpecialId?: string;
  isApproved?: boolean;
  authenticatedAt?: string;
}

export default function OrehackWorkbench() {
  const navigate = useNavigate();

  // Retrieve team info from sessionStorage
  const [teamInfo, setTeamInfo] = useState<TeamSession>({
    teamName: "Participant Team",
    leaderName: "Team Leader",
  });

  const [commonPS, setCommonPS] = useState(DEFAULT_COMMON_PROBLEM_STATEMENT);
  const [commonDesc, setCommonDesc] = useState(DEFAULT_COMMON_PROBLEM_DESCRIPTION);

  useEffect(() => {
    // Load event settings for common PS
    getEventSettings().then((s) => {
      if (s.common_problem_statement) setCommonPS(s.common_problem_statement);
      if (s.common_problem_description) setCommonDesc(s.common_problem_description);
    });

    try {
      const stored = sessionStorage.getItem("orehack_team_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.teamName) {
          setTeamInfo(parsed);
          // Check if there is already a submission in DB
          getOrehackSubmission(parsed.teamSpecialId, parsed.teamName).then((sub) => {
            if (sub) {
              setSubmittedData({
                statement: sub.problem_statement || commonPS,
                repoUrl: sub.repo_link,
                branch: sub.branch,
                teamSpecialId: sub.team_special_id,
                submittedAt: new Date(sub.submitted_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              });
              setIsSubmitted(true);
            }
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Form states
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submittedData, setSubmittedData] = useState<{
    statement: string;
    repoUrl: string;
    branch: string;
    teamSpecialId?: string;
    submittedAt: string;
  } | null>(null);

  const handleLogout = () => {
    sessionStorage.removeItem("orehack_team_session");
    toast.info("Logged out of hackathon workbench.");
    navigate("/orehack");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanRepo = repoUrl.trim();
    if (!cleanRepo) {
      setErrorMessage("Please enter your team's GitHub Repository URL.");
      toast.error("GitHub Repository URL is required.");
      return;
    }

    if (!cleanRepo.toLowerCase().includes("github.com")) {
      setErrorMessage("Please enter a valid GitHub repository link (e.g. https://github.com/org/repo).");
      toast.error("Must be a valid GitHub URL.");
      return;
    }

    setLoading(true);

    try {
      const result = await submitOrehackProject({
        teamName: teamInfo.teamName,
        teamSpecialId: teamInfo.teamSpecialId,
        problemStatement: commonPS,
        repoLink: cleanRepo,
        branch: branch.trim() || "main",
      });

      if (result.success) {
        setSubmittedData({
          statement: commonPS,
          repoUrl: cleanRepo,
          branch: branch.trim() || "main",
          teamSpecialId: result.teamSpecialId,
          submittedAt: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
        setIsSubmitted(true);
        toast.success("GitHub Repository connected & registered successfully!");
      } else {
        setErrorMessage(result.error || "Submission failed. Please try again.");
        toast.error(result.error || "Submission failed.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Network error occurred. Please try again.");
      toast.error("Failed to submit repository.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030206] text-white flex flex-col font-sans selection:bg-[#7c3aed] selection:text-white relative overflow-x-hidden">
      {/* ── Background Glow Effects ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] sm:w-[1100px] h-[550px] rounded-full blur-[160px] opacity-25"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, rgba(124,58,237,0) 70%)",
          }}
        />
        <div
          className="absolute bottom-[-10%] -left-[10%] w-[600px] h-[450px] rounded-full blur-[140px] opacity-15"
          style={{
            background: "radial-gradient(circle, #9333ea 0%, rgba(147,51,234,0) 70%)",
          }}
        />
      </div>

      {/* ── Top Header Navigation Bar ── */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/40">
        <div className="flex items-center gap-3">
          <Link
            to="/orehack"
            className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="h-8 px-2.5 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <img
                src="/CH OREHACK Monogram Logo.png"
                alt="OreHack"
                className="h-5 sm:h-6 w-auto object-contain"
              />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/30">
              CODE CLASH Workbench
            </span>
          </Link>
        </div>

        {/* Team Badges & Sign Out */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-zinc-300">
            <span className="text-zinc-400">Team:</span>
            <span className="font-bold text-white">{teamInfo.teamName}</span>
            {teamInfo.teamSpecialId && (
              <>
                <span className="text-zinc-600">|</span>
                <span className="font-mono text-[11px] text-[#a855f7] bg-[#7c3aed]/15 px-2 py-0.5 rounded border border-[#7c3aed]/30">
                  {teamInfo.teamSpecialId}
                </span>
              </>
            )}
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">Lead:</span>
            <span className="text-purple-300 font-medium">{teamInfo.leaderName}</span>
          </div>

          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-xs font-semibold text-zinc-300 hover:text-red-300 transition-all duration-200 group"
          >
            <LogOut className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Main Section: Centered Card ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-4 sm:my-8">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl rounded-[28px] sm:rounded-[36px] p-2.5 sm:p-4 md:p-5 border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_50px_rgba(124,58,237,0.15)]"
          style={{
            background:
              "linear-gradient(135deg, rgba(19, 17, 28, 0.95) 0%, rgba(13, 11, 20, 0.98) 100%)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
            {/* ── Left Column: Hackathon Showcase Poster ── */}
            <div className="lg:col-span-5 rounded-[22px] sm:rounded-[28px] overflow-hidden relative flex flex-col justify-between min-h-[380px] sm:min-h-[440px] lg:min-h-[580px] p-5 sm:p-7 border border-white/10 group">
              <img
                src="/cobotex.webp"
                alt="CODE CLASH 2026 Hackathon"
                className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              />

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(5,4,12,0.65) 0%, rgba(5,4,12,0.2) 35%, rgba(5,4,12,0.75) 75%, rgba(5,4,12,0.95) 100%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, #7c3aed 0%, transparent 60%)",
                }}
              />

              {/* Top Bar inside Left Card */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <div className="flex items-center px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-white/20">
                  <img
                    src="/CH OREHACK Monogram Logo.png"
                    alt="Orehack"
                    className="h-5 sm:h-6 w-auto object-contain"
                  />
                </div>

                <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-semibold text-emerald-300 backdrop-blur-md flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Workbench Active</span>
                </div>
              </div>

              {/* Bottom Section inside Left Card */}
              <div className="relative z-10 mt-auto pt-8">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#7c3aed]/30 border border-[#7c3aed]/50 text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-2">
                    <Sparkles className="w-3 h-3 text-[#a855f7]" />
                    CODE CLASH 2026
                  </span>
                  <h3
                    className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight uppercase font-serif"
                    style={{
                      textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                    }}
                  >
                    CODE CLASH
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm font-normal mt-1 max-w-sm">
                    Connect your GitHub repository for live automated code inspection and jury evaluation.
                  </p>
                </div>

                {/* Team Status Checklist */}
                <div className="p-3 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 space-y-1.5 mb-4 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Credentials Authenticated</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSubmitted
                          ? "border-emerald-500 text-emerald-400"
                          : "border-purple-400 text-purple-400"
                      }`}
                    >
                      {isSubmitted ? "✓" : "●"}
                    </span>
                    <span>
                      {isSubmitted ? "GitHub Repository Connected" : "Awaiting GitHub Repository"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-8 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                  <span className="w-2.5 h-1.5 rounded-full bg-white/40" />
                  <span className="w-2.5 h-1.5 rounded-full bg-white/40" />
                </div>
              </div>
            </div>

            {/* ── Right Column: Project Submission Form ── */}
            <div className="lg:col-span-7 flex flex-col justify-center p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div
                    key="submission-form"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Header */}
                    <div className="mb-6">
                      <h2
                        className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight font-serif"
                      >
                        Repository Submission
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-normal">
                        Submit your team's GitHub repository for the official CODE CLASH 2026 challenge.
                      </p>
                    </div>

                    {/* Error Banner */}
                    {errorMessage && (
                      <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* ── OPTION 1: Common Problem Statement (Locked for all teams) ── */}
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-purple-500/25 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-[11px] font-black">
                              1
                            </span>
                            <span>Official Hackathon Challenge</span>
                          </label>
                          <span className="text-[10px] uppercase font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Common for All Teams</span>
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#13111f] border border-white/5 space-y-1">
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>{commonPS}</span>
                          </h4>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            {commonDesc}
                          </p>
                        </div>
                      </div>

                      {/* ── OPTION 2: GitHub Repository URL ── */}
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center text-[11px] font-black">
                              2
                            </span>
                            <span>GitHub Repository Link</span>
                          </label>
                          <span className="text-[10px] uppercase font-bold text-[#a855f7] bg-[#7c3aed]/15 px-2 py-0.5 rounded-full border border-[#7c3aed]/30">
                            Required
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                              <Github className="w-4 h-4 text-purple-400/80" />
                            </div>
                            <input
                              type="url"
                              value={repoUrl}
                              onChange={(e) => setRepoUrl(e.target.value)}
                              placeholder="https://github.com/organization/project-name"
                              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#191726] border border-white/10 text-white text-xs sm:text-sm placeholder-zinc-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30 transition-all duration-200 font-mono"
                            />
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
                            <span className="flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5 text-purple-400" />
                              <span>Default branch:</span>
                            </span>
                            <input
                              type="text"
                              value={branch}
                              onChange={(e) => setBranch(e.target.value)}
                              placeholder="main"
                              className="w-24 px-2 py-1 rounded bg-[#191726] border border-white/10 text-white text-xs font-mono text-center focus:outline-none focus:border-[#7c3aed]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-6 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] shadow-lg shadow-purple-900/40 hover:shadow-purple-700/60 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Linking Repository...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Repository</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  /* ── Success Submission State ── */
                  <motion.div
                    key="submission-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="py-4"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>

                    <h3 className="text-2xl font-black text-white font-serif mb-1">
                      Repository Linked Successfully
                    </h3>
                    <p className="text-xs text-zinc-400 mb-6">
                      Your solution is registered for CODE CLASH 2026. The jury panel and automated technical engine can inspect your commits.
                    </p>

                    <div className="bg-[#191726] border border-white/10 rounded-2xl p-4 text-left space-y-3 mb-6">
                      <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                        <span className="text-zinc-400">Team Name:</span>
                        <span className="font-bold text-white">{teamInfo.teamName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                        <span className="text-zinc-400">Challenge:</span>
                        <span className="font-semibold text-purple-300 text-right max-w-xs truncate">
                          {submittedData?.statement || commonPS}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                        <span className="text-zinc-400">GitHub Repository:</span>
                        <a
                          href={submittedData?.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-purple-300 underline flex items-center gap-1 hover:text-white"
                        >
                          <span className="max-w-[200px] truncate">{submittedData?.repoUrl}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Submission Timestamp:</span>
                        <span className="text-zinc-300 font-mono">{submittedData?.submittedAt}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2 text-xs text-emerald-300">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Repository locked for evaluation</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-zinc-500 border-t border-white/5">
        <p>© 2026 CODE CLASH • Powered by OreHack Evaluation Engine</p>
      </footer>
    </div>
  );
}
