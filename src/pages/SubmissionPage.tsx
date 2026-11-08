import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEvent } from "@/context/EventContext";
import { uploadSubmissionArtifact } from "@/lib/storage";
import { createSubmission } from "@/lib/backend-api";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2, Github, User, Phone, FileText,
  Upload, ChevronRight, ChevronLeft, Loader2,
  AlertTriangle, Trophy, Zap, GitBranch
} from "lucide-react";

type Phase = "form" | "processing" | "done" | "duplicate";
type Step = 0 | 1 | 2;

const STEPS = [
  { label: "Team", icon: User },
  { label: "Project", icon: GitBranch },
  { label: "Confirm", icon: CheckCircle2 },
];

const processingSteps = [
  { label: "Registering submission…", icon: "📝" },
  { label: "Parsing repository metadata…", icon: "🔍" },
  { label: "Joining evaluation queue…", icon: "⚙️" },
  { label: "Confirmation prepared…", icon: "✅" },
];

const SubmissionPage = () => {
  const { hackathonId, eventId } = useParams();
  const location = useLocation();
  const { state: eventState } = useEvent();

  const effectiveHackathonId = hackathonId || eventId || "origin-2k25";

  const storedSessionRaw = typeof window !== "undefined" ? localStorage.getItem("orehack_team_session") : null;
  let storedSession: {
    hackathonSlug?: string;
    hackathonDbId?: string;
    teamId?: string;
    teamDbId?: string | null;
    teamName?: string;
  } | null = null;
  if (storedSessionRaw) {
    try {
      storedSession = JSON.parse(storedSessionRaw) as typeof storedSession;
    } catch { storedSession = null; }
  }

  const navigationState = (location.state as { teamId?: string; teamName?: string } | null) || null;
  const effectiveSession = navigationState
    ? { ...navigationState, hackathonSlug: effectiveHackathonId }
    : storedSession?.hackathonSlug === effectiveHackathonId || storedSession?.hackathonDbId
    ? storedSession
    : null;

  const teamId = effectiveSession?.teamId || (eventState.isAuthenticated ? eventState.teamId : "Unknown");
  const resolvedTeamName = effectiveSession?.teamName || (eventState.isAuthenticated ? eventState.teamName : "");
  const hackathonName = effectiveHackathonId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Hackathon";

  // Form state
  const [step, setStep] = useState<Step>(0);
  const [teamName, setTeamName] = useState(resolvedTeamName);
  const [leaderName, setLeaderName] = useState("");
  const [leaderPhone, setLeaderPhone] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [currentProcessStep, setCurrentProcessStep] = useState(0);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<{ repo: string; submittedAt: string } | null>(null);

  // Check for existing submission
  useEffect(() => {
    if (teamId && teamId !== "Unknown") {
      supabase
        .from("submissions")
        .select("repository_url, submitted_at")
        .eq("team_id", teamId)
        .eq("hackathon_slug", effectiveHackathonId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setExistingSubmission({ repo: data.repository_url, submittedAt: data.submitted_at });
        });
    }
  }, [teamId, effectiveHackathonId]);

  // Pre-fill leader info from teams table
  useEffect(() => {
    if (teamId && teamId !== "Unknown") {
      supabase.from("teams").select("leader_name, leader_phone")
        .eq("team_id", teamId).maybeSingle()
        .then(({ data }) => {
          if (data?.leader_name) setLeaderName(data.leader_name);
          if (data?.leader_phone) setLeaderPhone(data.leader_phone);
        });
    }
  }, [teamId]);

  const validateStep = (s: Step): boolean => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!teamName.trim()) errs.teamName = "Team name is required";
      if (!leaderName.trim()) errs.leaderName = "Leader name is required";
      if (!leaderPhone.trim()) errs.leaderPhone = "Phone number is required";
      else if (!/^\+?[\d\s\-]{8,15}$/.test(leaderPhone.trim())) errs.leaderPhone = "Enter a valid phone number";
    }
    if (s === 1) {
      if (!repoUrl.trim()) errs.repoUrl = "Repository URL is required";
      else if (!/^https:\/\/github\.com\/.+\/.+/.test(repoUrl.trim())) errs.repoUrl = "Must be a valid public GitHub URL";
      if (!problemStatement.trim()) errs.problemStatement = "Please describe your problem statement";
      if (artifactFile && artifactFile.size > 25 * 1024 * 1024) errs.artifact = "File must be under 25MB";
    }
    if (teamId === "Unknown" && s === 0) errs.teamId = "Session expired. Please login again.";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep((s) => (s < 2 ? (s + 1) as Step : s));
  };

  const prevStep = () => setStep((s) => (s > 0 ? (s - 1) as Step : s));

  const handleSubmit = async () => {
    if (submitting) return;
    setError("");
    setSubmitting(true);
    setPhase("processing");
    setCurrentProcessStep(0);

    try {
      // Update leader info in teams table
      await supabase.from("teams").update({
        leader_name: leaderName.trim(),
        leader_phone: leaderPhone.trim(),
      }).eq("team_id", teamId);

      setCurrentProcessStep(1);
      await new Promise((r) => setTimeout(r, 700));

      const created = await createSubmission({
        hackathonSlug: effectiveHackathonId,
        teamId,
        repoLink: repoUrl.trim(),
        problemStatement: problemStatement.trim(),
      });

      setCurrentProcessStep(2);
      await new Promise((r) => setTimeout(r, 700));

      if (artifactFile) {
        await uploadSubmissionArtifact({
          hackathonSlug: effectiveHackathonId,
          teamId,
          file: artifactFile,
        });
      }

      setCurrentProcessStep(3);
      await new Promise((r) => setTimeout(r, 700));

      setPhase("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed.";
      if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
        setPhase("duplicate");
      } else {
        setError(msg);
        setPhase("form");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (fieldKey: string) =>
    `w-full rounded-xl border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-200 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] ${
      fieldErrors[fieldKey]
        ? "border-destructive/70 focus:border-destructive"
        : "border-border/60 focus:border-primary/60"
    }`;

  // ── Background orbs ──
  const orbs = [
    { w: 420, h: 420, left: "-8%", top: "-10%", from: "hsl(var(--primary)/0.22)", to: "hsl(var(--card)/0.04)" },
    { w: 300, h: 300, left: "68%", top: "8%", from: "hsl(var(--accent)/0.18)", to: "hsl(var(--primary)/0.06)" },
    { w: 260, h: 260, left: "25%", top: "72%", from: "hsl(var(--secondary)/0.14)", to: "transparent" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Grid bg */}
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-20" />

      {/* Animated orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{ width: orb.w, height: orb.h, left: orb.left, top: orb.top,
            background: `radial-gradient(circle, ${orb.from}, ${orb.to})` }}
          animate={{ x: [0, 24, -16, 0], y: [0, 14, -10, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 14 + i * 3, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">

          {/* Header badge */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
              <Zap className="w-3 h-3" />
              {hackathonName} · Submission Portal
            </span>
          </motion.div>

          {/* Session info bar */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5 overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm px-5 py-3"
          >
            <div className="flex items-center gap-6 text-xs">
              <div>
                <p className="text-muted-foreground uppercase tracking-widest mb-0.5">Team ID</p>
                <p className="font-mono font-semibold text-primary">{teamId}</p>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div>
                <p className="text-muted-foreground uppercase tracking-widest mb-0.5">Team</p>
                <p className="font-semibold">{resolvedTeamName || teamName || "—"}</p>
              </div>
              <div className="h-8 w-px bg-border/50" />
              <div>
                <p className="text-muted-foreground uppercase tracking-widest mb-0.5">Status</p>
                <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </span>
              </div>
            </div>
          </motion.div>

          {/* Duplicate warning */}
          {existingSubmission && phase === "form" && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-amber-300">You've already submitted</p>
                <p className="text-amber-200/80 mt-0.5">Repo: <span className="font-mono">{existingSubmission.repo}</span></p>
                <p className="text-amber-200/60 mt-0.5">Submitting again will update your entry.</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {phase === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-[0_24px_80px_hsl(var(--background)/0.6)] backdrop-blur-2xl"
              >
                {/* Rotating border glow */}
                <motion.div
                  className="pointer-events-none absolute -inset-20 bg-[conic-gradient(from_200deg,hsl(var(--primary)/0.18),transparent,hsl(var(--accent)/0.14),hsl(var(--primary)/0.18))]"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                />
                <div className="pointer-events-none absolute inset-[1px] rounded-[22px] bg-background/82" />

                <div className="relative z-10 p-8">
                  {/* Step indicator */}
                  <div className="mb-8 flex items-center justify-between">
                    {STEPS.map((s, i) => (
                      <div key={s.label} className="flex items-center gap-2 flex-1">
                        <div className={`flex items-center gap-2 transition-all duration-300 ${
                          i === step ? "opacity-100" : i < step ? "opacity-70" : "opacity-30"
                        }`}>
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            i < step ? "bg-primary text-primary-foreground" :
                            i === step ? "bg-primary/20 border-2 border-primary text-primary" :
                            "bg-muted text-muted-foreground"
                          }`}>
                            {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                          </div>
                          <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`}>
                            {s.label}
                          </span>
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`flex-1 h-px mx-2 transition-all duration-500 ${i < step ? "bg-primary" : "bg-border/50"}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Step 0: Team Info */}
                  {step === 0 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div>
                        <h2 className="text-xl font-bold mb-1">Team Details</h2>
                        <p className="text-sm text-muted-foreground">Tell us about your team leader</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                          Team Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            value={teamName}
                            onChange={e => setTeamName(e.target.value)}
                            placeholder="Your team name"
                            className={`${inputClass("teamName")} pl-10`}
                          />
                        </div>
                        {fieldErrors.teamName && <p className="mt-1 text-xs text-destructive">{fieldErrors.teamName}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                          Leader Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            value={leaderName}
                            onChange={e => setLeaderName(e.target.value)}
                            placeholder="Full name of team leader"
                            className={`${inputClass("leaderName")} pl-10`}
                          />
                        </div>
                        {fieldErrors.leaderName && <p className="mt-1 text-xs text-destructive">{fieldErrors.leaderName}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                          Leader Phone *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            value={leaderPhone}
                            onChange={e => setLeaderPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className={`${inputClass("leaderPhone")} pl-10`}
                          />
                        </div>
                        {fieldErrors.leaderPhone && <p className="mt-1 text-xs text-destructive">{fieldErrors.leaderPhone}</p>}
                        {fieldErrors.teamId && <p className="mt-2 text-xs text-destructive flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{fieldErrors.teamId}</p>}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Project Info */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div>
                        <h2 className="text-xl font-bold mb-1">Project Details</h2>
                        <p className="text-sm text-muted-foreground">Tell us about what you built</p>
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                          GitHub Repository URL *
                        </label>
                        <div className="relative">
                          <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input
                            type="url"
                            value={repoUrl}
                            onChange={e => setRepoUrl(e.target.value)}
                            placeholder="https://github.com/team/repo"
                            className={`${inputClass("repoUrl")} pl-10`}
                          />
                        </div>
                        {fieldErrors.repoUrl && <p className="mt-1 text-xs text-destructive">{fieldErrors.repoUrl}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                          Problem Statement *
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                          <textarea
                            value={problemStatement}
                            onChange={e => setProblemStatement(e.target.value)}
                            rows={5}
                            placeholder="Describe the problem you solved, your approach, and key features..."
                            className={`${inputClass("problemStatement")} pl-10 resize-none`}
                          />
                        </div>
                        {fieldErrors.problemStatement && <p className="mt-1 text-xs text-destructive">{fieldErrors.problemStatement}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                          Supporting File <span className="text-muted-foreground/60">(optional · max 25MB)</span>
                        </label>
                        <div
                          className={`rounded-xl border-2 border-dashed px-4 py-5 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-primary/5 ${
                            fieldErrors.artifact ? "border-destructive/50" : "border-border/50"
                          }`}
                          onClick={() => document.getElementById("artifact-upload")?.click()}
                        >
                          <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {artifactFile ? <span className="text-foreground font-medium">{artifactFile.name}</span> : "Click to upload PDF, ZIP, PPT…"}
                          </p>
                          <input
                            id="artifact-upload"
                            type="file"
                            className="hidden"
                            accept=".zip,.rar,.pdf,.ppt,.pptx,.doc,.docx,.txt,.md,image/*"
                            onChange={e => setArtifactFile(e.target.files?.[0] || null)}
                          />
                        </div>
                        {fieldErrors.artifact && <p className="mt-1 text-xs text-destructive">{fieldErrors.artifact}</p>}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Confirm */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      <div>
                        <h2 className="text-xl font-bold mb-1">Confirm & Submit</h2>
                        <p className="text-sm text-muted-foreground">Review your details before submitting</p>
                      </div>

                      <div className="rounded-2xl border border-border/50 bg-background/40 divide-y divide-border/40 overflow-hidden">
                        {[
                          { label: "Team", value: `${teamName} (${teamId})` },
                          { label: "Leader", value: leaderName },
                          { label: "Phone", value: leaderPhone },
                          { label: "Repository", value: repoUrl, mono: true },
                          { label: "Artifact", value: artifactFile?.name || "None" },
                        ].map(({ label, value, mono }) => (
                          <div key={label} className="flex items-start gap-4 px-4 py-3">
                            <span className="text-xs text-muted-foreground w-20 shrink-0 pt-0.5">{label}</span>
                            <span className={`text-sm font-medium break-all ${mono ? "font-mono text-primary" : "text-foreground"}`}>{value}</span>
                          </div>
                        ))}
                        <div className="px-4 py-3">
                          <span className="text-xs text-muted-foreground w-20 block mb-1">Problem</span>
                          <p className="text-sm text-foreground/80 line-clamp-3">{problemStatement}</p>
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
                          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                          <p className="text-sm text-destructive">{error}</p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Navigation */}
                  <div className="mt-8 flex items-center gap-3">
                    {step > 0 && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={prevStep}
                        className="flex items-center gap-1.5 rounded-xl border border-border/70 px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back
                      </motion.button>
                    )}
                    {step < 2 ? (
                      <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={nextStep}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25"
                      >
                        Continue <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 relative overflow-hidden flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/30 disabled:opacity-70"
                      >
                        <motion.span
                          className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.3)_50%,transparent_80%)]"
                          animate={{ x: ["-140%", "140%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <span className="relative z-10 flex items-center gap-2">
                          <Zap className="w-4 h-4" /> Submit for Evaluation
                        </span>
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Processing */}
            {phase === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-10 backdrop-blur-2xl shadow-[0_24px_80px_hsl(var(--background)/0.6)]"
              >
                <div className="pointer-events-none absolute inset-[1px] rounded-[22px] bg-background/80" />
                <div className="relative z-10 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="inline-flex mb-6"
                  >
                    <div className="w-14 h-14 rounded-full border-4 border-primary/20 border-t-primary" />
                  </motion.div>
                  <h2 className="text-xl font-bold mb-2">Registering Your Submission</h2>
                  <p className="text-sm text-muted-foreground mb-8">Please wait while we process your entry…</p>
                  <div className="space-y-4 text-left max-w-xs mx-auto">
                    {processingSteps.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className={`flex items-center gap-3 transition-all duration-500 ${
                          i <= currentProcessStep ? "opacity-100" : "opacity-30"
                        }`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
                          i < currentProcessStep ? "bg-primary text-primary-foreground" :
                          i === currentProcessStep ? "bg-primary/20 border-2 border-primary" :
                          "bg-muted"
                        }`}>
                          {i < currentProcessStep ? "✓" : i === currentProcessStep ? <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" /> : i + 1}
                        </div>
                        <span className={`text-sm ${i <= currentProcessStep ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success */}
            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 18 }}
                className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-card/60 p-10 text-center backdrop-blur-2xl shadow-[0_24px_80px_hsl(var(--background)/0.5)]"
              >
                <div className="pointer-events-none absolute inset-[1px] rounded-[22px] bg-background/80" />
                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2, damping: 12 }}
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 border-2 border-emerald-500/40"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Submission Registered!</h2>
                  <p className="text-muted-foreground mb-1">Your project has been queued for evaluation.</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Team <span className="text-foreground font-semibold">{teamName}</span> · {hackathonName}
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      Status: Queued for Evaluation
                    </span>
                  </div>
                  <div className="rounded-2xl border border-border/40 bg-background/40 p-5 text-left space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      <Trophy className="w-3.5 h-3.5" /> What happens next
                    </div>
                    <p className="text-sm text-foreground/80">Your repository will be cloned and evaluated by our automated pipeline. Results will appear on the leaderboard once processing is complete.</p>
                  </div>
                  <Link
                    to={`/hackathon/${effectiveHackathonId}/leaderboard`}
                    className="mt-5 inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Trophy className="w-4 h-4" /> View Leaderboard
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Duplicate */}
            {phase === "duplicate" && (
              <motion.div
                key="duplicate"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-card/60 p-10 text-center backdrop-blur-2xl"
              >
                <div className="pointer-events-none absolute inset-[1px] rounded-[22px] bg-background/80" />
                <div className="relative z-10">
                  <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
                    <AlertTriangle className="h-8 w-8 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Already Submitted</h2>
                  <p className="text-muted-foreground mb-6">Your team already has a submission for this hackathon.</p>
                  <button
                    onClick={() => { setPhase("form"); setError(""); }}
                    className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-6 py-2.5 text-sm text-amber-400 hover:bg-amber-500/20 transition-colors"
                  >
                    Update Submission
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Before you submit tips */}
          {phase === "form" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-5 rounded-2xl border border-primary/15 bg-primary/5 px-5 py-4"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2.5">Submission Notes</p>
              <div className="space-y-1.5">
                {[
                  "Use your final public GitHub repository link before deadline.",
                  "Ensure README includes setup instructions and team credits.",
                  "Do not force push after submission unless organizers ask.",
                ].map((note, i) => (
                  <p key={i} className="text-xs text-foreground/75">{i + 1}. {note}</p>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionPage;
