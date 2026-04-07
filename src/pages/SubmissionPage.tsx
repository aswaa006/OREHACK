import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "../components/Stepper.css";
import { supabase } from "@/lib/supabase";

type Phase = "form" | "processing" | "done";

const processingSteps = [
  "Initializing Analysis…",
  "Parsing repository…",
  "Inspecting structure…",
  "Generating evaluation metrics…",
];

const submissionNotes = [
  "Use your final public repository link before deadline.",
  "Ensure README includes setup instructions and team credits.",
  "Do not force push after submission unless organizers ask.",
];

const SubmissionPage = () => {
  const { hackathonId } = useParams();
  const location = useLocation();
  const storedSessionRaw = typeof window !== "undefined" ? localStorage.getItem("orehack_team_session") : null;
  let storedSession: { hackathonId?: string; teamId?: string; teamName?: string } | null = null;
  if (storedSessionRaw) {
    try {
      storedSession = JSON.parse(storedSessionRaw) as { hackathonId?: string; teamId?: string; teamName?: string };
    } catch {
      storedSession = null;
    }
  }
  const navigationState = (location.state as { teamId?: string; teamName?: string } | null) || null;
  const effectiveSession = navigationState || (storedSession?.hackathonId === hackathonId ? storedSession : null);
  const teamId = effectiveSession?.teamId || "Unknown";
  const [teamName, setTeamName] = useState(effectiveSession?.teamName || "");
  const [repoUrl, setRepoUrl] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hackathonName = hackathonId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Hackathon";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!repoUrl.trim()) {
      setError("Repository URL is required.");
      return;
    }
    if (!/^https:\/\/github\.com\/.+\/.+/.test(repoUrl.trim())) {
      setError("Please enter a valid public GitHub URL.");
      return;
    }
    if (!teamName.trim()) {
      setError("Team name is required.");
      return;
    }
    if (teamId === "Unknown") {
      setError("Team ID is missing. Please login again.");
      return;
    }
    setError("");
    setSubmitting(true);
    setPhase("processing");

    const submissionPayload = {
      teamID: teamId,
      Team_Name: teamName.trim(),
      Repo_URL: repoUrl.trim(),
      Problem_Statement: problemStatement.trim() || "",
      Progress: "queued",
    };

    let { error: submissionError } = await supabase
      .from("submissions")
      .upsert(submissionPayload, { onConflict: "teamID" });

    if (submissionError) {
      setError(submissionError.message || "Submission failed. Please try again.");
      setPhase("form");
      setSubmitting(false);
      return;
    }

    for (let i = 0; i < processingSteps.length; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 900));
    }

    setPhase("done");
    setSubmitting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_18%_16%,hsl(var(--primary)/0.18),transparent_34%),radial-gradient(circle_at_85%_20%,hsl(var(--accent)/0.16),transparent_38%),radial-gradient(circle_at_35%_84%,hsl(var(--secondary-foreground)/0.08),transparent_36%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--card))_100%)]" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-25" />

      {[0, 1, 2].map((idx) => (
        <motion.div
          key={idx}
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{
            width: idx === 0 ? 420 : idx === 1 ? 300 : 260,
            height: idx === 0 ? 420 : idx === 1 ? 300 : 260,
            left: idx === 0 ? "-10%" : idx === 1 ? "66%" : "28%",
            top: idx === 0 ? "-11%" : idx === 1 ? "14%" : "70%",
            background:
              idx === 0
                ? "linear-gradient(130deg, hsl(var(--primary) / 0.22), hsl(var(--card-foreground) / 0.05))"
                : idx === 1
                  ? "linear-gradient(150deg, hsl(var(--accent) / 0.2), hsl(var(--primary) / 0.08))"
                  : "linear-gradient(130deg, hsl(var(--secondary-foreground) / 0.14), hsl(var(--primary) / 0.06))",
          }}
          animate={{
            x: idx === 0 ? [0, 35, -18, 0] : idx === 1 ? [0, -30, 18, 0] : [0, 20, -28, 0],
            y: idx === 0 ? [0, 22, -18, 0] : idx === 1 ? [0, -20, 22, 0] : [0, -26, 16, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{ duration: 15 + idx * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="relative z-10 mx-6 flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative mb-4 overflow-hidden rounded-2xl border border-border/70 bg-card/55 px-5 py-4 shadow-[0_10px_40px_hsl(var(--background)/0.45)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-[1px] rounded-[15px] bg-background/80" />
          <div className="relative z-10 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Team ID</p>
              <p className="mt-1 font-semibold text-foreground">{teamId}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Team Name</p>
              <p className="mt-1 font-semibold text-foreground">{teamName || "Not set"}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Hackathon</p>
              <p className="mt-1 font-semibold text-foreground">{hackathonName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Session</p>
              <p className="mt-1 font-semibold text-primary">Live Submission Window</p>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 p-8 shadow-[0_20px_85px_hsl(var(--background)/0.6)] backdrop-blur-2xl"
            >
              <motion.div
                className="pointer-events-none absolute -inset-20 bg-[conic-gradient(from_220deg,hsl(var(--primary)/0.22),transparent,hsl(var(--accent)/0.16),hsl(var(--primary)/0.22))]"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              />
              <div className="pointer-events-none absolute inset-[1px] rounded-[22px] bg-background/80" />

              <div className="relative z-10">
              <div className="mb-6">
                <p className="mb-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">Submission Desk</p>
                <h1 className="mb-1 text-2xl font-bold text-foreground">{hackathonName}</h1>
                <p className="text-sm text-muted-foreground">
                  Team: <span className="font-semibold text-foreground">{teamName || teamId}</span> ({teamId})
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Team Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-300 focus:border-primary/60 focus:bg-background focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
                    placeholder="Enter your team name"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    GitHub Repository URL <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-300 focus:border-primary/60 focus:bg-background focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
                    placeholder="https://github.com/team/repo"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Problem Statement <span className="text-muted-foreground/60">(Optional)</span>
                  </label>
                  <textarea
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-all duration-300 focus:border-primary/60 focus:bg-background focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
                    placeholder="Describe your problem statement..."
                  />
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}

                <motion.button
                  type="submit"
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="relative w-full overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-r from-primary to-accent py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:brightness-110"
                >
                  <span className="relative z-10">Submit for Evaluation</span>
                  <motion.span
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.38)_50%,transparent_80%)]"
                    animate={{ x: ["-140%", "140%"] }}
                    transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.button>
              </form>

              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">Before You Submit</p>
                <div className="space-y-1.5">
                  {submissionNotes.map((note, idx) => (
                    <motion.p
                      key={note}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * idx, duration: 0.35 }}
                      className="text-xs text-foreground/90"
                    >
                      {idx + 1}. {note}
                    </motion.p>
                  ))}
                </div>
              </div>
              </div>
            </motion.div>
          )}

          {phase === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 p-8 shadow-[0_20px_85px_hsl(var(--background)/0.6)] backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute inset-[1px] rounded-[22px] bg-background/82" />
              <div className="relative z-10">
              <h2 className="mb-2 text-center text-xl font-bold text-foreground">Processing Submission</h2>
              <p className="mb-6 text-center text-sm text-muted-foreground">Running repository checks and preparing evaluation pipeline.</p>
              <p className="mb-6 text-center text-xs uppercase tracking-[0.16em] text-muted-foreground">Team {teamName || teamId} is in queue</p>
              
              <div className="space-y-4">
                {processingSteps.map((step, index) => {
                  const isComplete = index < currentStep;
                  const isActive = index === currentStep;
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className="relative flex items-center justify-center">
                        <motion.div
                          animate={{
                            scale: isActive ? 1 : 1,
                            backgroundColor: isComplete ? "hsl(var(--primary))" : isActive ? "hsl(var(--accent))" : "hsl(var(--secondary))",
                          }}
                          transition={{ duration: 0.3 }}
                          className="w-10 h-10 rounded-full flex items-center justify-center z-10"
                        >
                          {isComplete ? (
                            <motion.svg
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              className="w-5 h-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </motion.svg>
                          ) : isActive ? (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="w-3 h-3 rounded-full bg-white"
                            />
                          ) : (
                            <span className="text-sm text-muted-foreground font-medium">{index + 1}</span>
                          )}
                        </motion.div>
                        
                        {index < processingSteps.length - 1 && (
                          <motion.div
                            className="absolute top-full left-1/2 h-8 w-0.5 -translate-x-1/2 bg-primary/20"
                            animate={{
                              backgroundColor: isComplete ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <motion.p
                          animate={{
                            color: isComplete || isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                            fontWeight: isActive ? 600 : 400,
                          }}
                          transition={{ duration: 0.3 }}
                          className="text-sm"
                        >
                          {step}
                        </motion.p>
                        {isActive && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            className="mt-1.5 h-0.5 rounded-full bg-primary"
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              </div>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 p-8 text-center shadow-[0_20px_85px_hsl(var(--background)/0.6)] backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute inset-[1px] rounded-[22px] bg-background/82" />
              <div className="relative z-10">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
                <svg className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-bold text-foreground">Submission Registered</h2>
              <p className="mb-4 text-sm text-muted-foreground">Your repository has been queued for evaluation.</p>
              <p className="mb-5 text-xs uppercase tracking-[0.16em] text-muted-foreground">Team {teamName || teamId} • {hackathonName}</p>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Status: Queued
              </span>

              <div className="mx-auto mt-5 max-w-sm rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-left">
                <p className="text-xs text-foreground/90">What happens next:</p>
                <p className="mt-1 text-xs text-muted-foreground">Your repository will be cloned, validated, and scored by the evaluation engine. Results appear on leaderboard after processing.</p>
              </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SubmissionPage;
