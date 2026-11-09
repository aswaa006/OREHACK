import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Users,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Shield,
  Scale,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { authenticateOrehackTeam } from "@/lib/orehack-db";

export default function OrehackAuth() {
  const navigate = useNavigate();

  // Form states
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Simulated login success state (dummy frontend mode)
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!teamName.trim()) {
      setErrorMessage("Please enter your registered Team Name.");
      toast.error("Team Name is required.");
      return;
    }
    if (!leaderName.trim()) {
      setErrorMessage("Please enter the Leader's Name.");
      toast.error("Leader Name is required.");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("Please enter your 10-digit phone number as password.");
      toast.error("Phone number / password is required.");
      return;
    }
    const cleanPhonePass = password.replace(/\D/g, "");
    if (cleanPhonePass.length !== 10) {
      setErrorMessage("Password must be the complete 10-digit registered phone number.");
      toast.error("Please enter a 10-digit phone number.");
      return;
    }
    if (!agreeTerms) {
      setErrorMessage("Please agree to the Hackathon Rules & Guidelines.");
      toast.error("You must agree to the guidelines to continue.");
      return;
    }

    setLoading(true);

    try {
      const res = await authenticateOrehackTeam(teamName, leaderName, cleanPhonePass);

      if (!res.success) {
        setLoading(false);
        setErrorMessage(res.error || "Authentication failed.");
        toast.error(res.error || "Authentication failed.");
        return;
      }

      // Validated against Supabase database!
      const team = res.team;
      sessionStorage.setItem(
        "orehack_team_session",
        JSON.stringify({
          teamName: team?.team_name || teamName.trim(),
          leaderName: team?.leader_name || leaderName.trim(),
          teamSpecialId: team?.team_special_id,
          isApproved: team?.is_approved,
          authenticatedAt: new Date().toISOString(),
        })
      );

      setLoading(false);
      toast.success(`Welcome ${team?.leader_name}! Team ${team?.team_name} verified.`);
      navigate("/orehack/workbench");
    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "Error connecting to Supabase database.";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#030206] text-white flex flex-col justify-between relative overflow-x-hidden selection:bg-[#7c3aed] selection:text-white"
      style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
    >
      {/* ── Ambient Radial Glows (Purple & Black Vibe) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[550px] rounded-full blur-[160px] opacity-25"
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
        <div
          className="absolute top-1/2 -right-[15%] w-[500px] h-[450px] rounded-full blur-[150px] opacity-15"
          style={{
            background: "radial-gradient(circle, #6d28d9 0%, rgba(109,40,217,0) 70%)",
          }}
        />
      </div>

      {/* ── Top Header Navigation Bar ── */}
      <header className="relative z-20 w-full px-4 sm:px-8 py-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/30">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="h-9 px-3 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <img
                src="/CH OREHACK Monogram Logo.png"
                alt="OreHack"
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#7c3aed]/20 text-[#a855f7] border border-[#7c3aed]/30">
              Portal
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Systems Online</span>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all duration-200 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>Back to website</span>
          </Link>
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
            {/* ── Left Column: Cobotex Poster Showcase with Overlay (Reference match) ── */}
            <div className="lg:col-span-6 rounded-[22px] sm:rounded-[28px] overflow-hidden relative flex flex-col justify-between min-h-[400px] sm:min-h-[480px] lg:min-h-[620px] p-5 sm:p-7 border border-white/10 group">
              {/* Background Image: Cobot-Ex */}
              <img
                src="/cobotex.webp"
                alt="COBOT-EX Hackathon"
                className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Vignette Overlays for deep atmospheric contrast */}
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

              {/* Inside Left Card Top Bar: Logo & Back Button */}
              <div className="relative z-10 flex items-center justify-between w-full">
                {/* Brand Monogram */}
                <div className="flex items-center px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-white/20">
                  <img
                    src="/CH OREHACK Monogram Logo.png"
                    alt="Orehack"
                    className="h-5 sm:h-6 w-auto object-contain"
                  />
                </div>

                {/* Back to website pill button */}
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-medium text-white transition-all duration-200 hover:shadow-lg group"
                >
                  <span>Back to website</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
              </div>

              {/* Inside Left Card Bottom: Tagline & Carousel Dots */}
              <div className="relative z-10 mt-auto pt-8">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#7c3aed]/30 border border-[#7c3aed]/50 text-[11px] font-bold uppercase tracking-wider text-purple-200 mb-2">
                    <Sparkles className="w-3 h-3 text-[#a855f7]" />
                    Featured Hackathon
                  </span>
                  <h3
                    className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight uppercase"
                    style={{
                      fontFamily:
                        'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                      textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                    }}
                  >
                    CODE CLASH 2026
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm font-normal mt-1 max-w-sm line-clamp-2">
                    Emergency Response & Disaster Management Platform Challenge.
                  </p>
                </div>

                {/* Carousel Slider Indicator Dots (Exact template replication) */}
                <div className="flex items-center gap-2">
                  <span className="w-8 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
                  <span className="w-2.5 h-1.5 rounded-full bg-white/40" />
                  <span className="w-2.5 h-1.5 rounded-full bg-white/40" />
                </div>
              </div>
            </div>

            {/* ── Right Column: Team Login Form ── */}
            <div className="lg:col-span-6 flex flex-col justify-center p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.div
                    key="login-form"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                      <h2
                        className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight"
                        style={{
                          fontFamily:
                            'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                        }}
                      >
                        Team Login
                      </h2>
                      <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-normal">
                        Enter your registered team credentials to access the CODE CLASH 2026 workbench.
                      </p>
                    </div>

                    {/* Error Banner */}
                    {errorMessage && (
                      <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5">
                      {/* Field 1: Team Name */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                          Team Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                            <Users className="w-4 h-4 text-purple-400/80" />
                          </div>
                          <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="e.g. Alpha Innovators"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#191726] border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30 transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Field 2: Leader Name */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                          Leader Name
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                            <User className="w-4 h-4 text-purple-400/80" />
                          </div>
                          <input
                            type="text"
                            value={leaderName}
                            onChange={(e) => setLeaderName(e.target.value)}
                            placeholder="e.g. Aarav Patel"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#191726] border border-white/10 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30 transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Field 3: Password (10 digits) */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                            Leader Phone Number (Password)
                          </label>
                          <span className="text-[11px] text-[#a855f7] font-semibold">
                            10 digits
                          </span>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                            <Lock className="w-4 h-4 text-purple-400/80" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            maxLength={10}
                            value={password}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                              setPassword(val);
                            }}
                            placeholder="9876543210"
                            className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#191726] border border-white/10 text-white text-sm font-mono placeholder-zinc-500 focus:outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30 transition-all duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {/* Password guideline hint */}
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-zinc-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]" />
                          <span>
                            Password is the <strong className="text-zinc-200 font-semibold">10-digit phone number</strong> of the registered team leader.
                          </span>
                        </div>
                      </div>

                      {/* Checkbox: Terms */}
                      <div className="pt-1 flex items-start gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          id="agreeTerms"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-white/20 bg-[#191726] text-[#7c3aed] focus:ring-[#7c3aed]/40 cursor-pointer accent-[#7c3aed]"
                        />
                        <label
                          htmlFor="agreeTerms"
                          className="text-xs text-zinc-400 leading-tight cursor-pointer"
                        >
                          I agree to the{" "}
                          <span className="text-white underline hover:text-[#a855f7]">
                            Hackathon Guidelines
                          </span>{" "}
                          & Code of Conduct.
                        </label>
                      </div>

                      {/* Submit CTA Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide text-white bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] shadow-lg shadow-purple-900/40 hover:shadow-purple-700/60 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Authenticating Team...</span>
                            </>
                          ) : (
                            <>
                              <span>Sign In to Dashboard</span>
                              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* ── Quick Access Portals: Admin, Jury, Leaderboard ── */}
                    <div className="mt-6 pt-5 border-t border-white/5 space-y-3">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest text-center font-bold">
                        Event Portals & Live Desk
                      </p>

                      <div className="grid grid-cols-3 gap-2">
                        {/* Admin Portal Button */}
                        <Link
                          to="/orehack/admin"
                          className="py-2.5 px-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-[11px] font-bold text-center text-purple-200 hover:text-white transition-all flex flex-col items-center justify-center gap-1 group shadow-sm hover:shadow-purple-900/30"
                        >
                          <Shield className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                          <span>Admin Desk</span>
                        </Link>

                        {/* Jury Panel Button */}
                        <Link
                          to="/orehack/jury"
                          className="py-2.5 px-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-[11px] font-bold text-center text-indigo-200 hover:text-white transition-all flex flex-col items-center justify-center gap-1 group shadow-sm hover:shadow-indigo-900/30"
                        >
                          <Scale className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                          <span>Jury Panel</span>
                        </Link>

                        {/* Leaderboard Button */}
                        <Link
                          to="/orehack/leaderboard"
                          className="py-2.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-center text-amber-200 hover:text-white transition-all flex flex-col items-center justify-center gap-1 group shadow-sm hover:shadow-amber-900/30"
                        >
                          <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                          <span>Leaderboard</span>
                        </Link>
                      </div>

                      <a
                        href="https://chat.whatsapp.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-[11px] text-center text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Need Help? Join WhatsApp Helpdesk</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  /* ── Success Screen (Dummy Dashboard Preview) ── */
                  <motion.div
                    key="login-success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-6 px-2"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-1">
                      Authentication Successful
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-6">
                      Welcome back, <strong className="text-white">{leaderName}</strong>. Team{" "}
                      <strong className="text-[#a855f7]">{teamName}</strong> is verified for COBOT-EX.
                    </p>

                    {/* Team Details Summary Card */}
                    <div className="bg-[#191726] border border-white/10 rounded-2xl p-4 text-left space-y-2.5 mb-6">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Team:</span>
                        <span className="font-bold text-white">{teamName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Leader:</span>
                        <span className="font-semibold text-zinc-200">{leaderName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Status:</span>
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active & Ready
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Arena:</span>
                        <span className="text-purple-300 font-medium">COBOT-EX Main Track</span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => navigate("/hackathons")}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#7c3aed] hover:bg-[#6d28d9] transition-colors"
                      >
                        Proceed to Hackathons Overview
                      </button>
                      <button
                        onClick={() => setIsSuccess(false)}
                        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                      >
                        Switch Team / Log Out
                      </button>
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
        <p>© 2026 Oregent OreHack • Intelligent Infrastructure for Hackathon Operations</p>
      </footer>
    </div>
  );
}
