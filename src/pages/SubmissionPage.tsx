import { useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSubmissionStatus, submitSubmission, type SubmissionStatus } from "@/lib/api";
import "../components/Stepper.css";

type Phase = "form" | "processing" | "done";

const processingSteps = [
  "Validating submission payload...",
  "Persisting submission in database...",
  "Running automated evaluation...",
  "Preparing final score output...",
];

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 40;

const SubmissionPage = () => {
  const { hackathonId } = useParams();
  const location = useLocation();
  const teamId = (location.state as { teamId?: string })?.teamId || "Unknown";
  const [repoUrl, setRepoUrl] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [submissionResult, setSubmissionResult] = useState<SubmissionStatus | null>(null);

  const hackathonName = hackathonId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Hackathon";

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const pollSubmissionResult = async (submissionId: number) => {
    let latestStatus: SubmissionStatus | null = null;

    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
      latestStatus = await getSubmissionStatus(hackathonId!, submissionId);

      if (latestStatus.status === "Evaluated" || latestStatus.status === "Rejected") {
        return latestStatus;
      }

      setCurrentStep(Math.min(processingSteps.length - 1, 2 + Math.floor(attempt / 2)));
      await wait(POLL_INTERVAL_MS);
    }

    return latestStatus;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackathonId) {
      setError("Hackathon context is missing.");
      return;
    }
    if (teamId === "Unknown") {
      setError("Please login with your team ID before submitting.");
      return;
    }
    if (!repoUrl.trim()) {
      setError("Repository URL is required.");
      return;
    }
    if (!/^https:\/\/github\.com\/.+\/.+/.test(repoUrl.trim())) {
      setError("Please enter a valid public GitHub URL.");
      return;
    }

    setError("");
    setSubmissionResult(null);
    setCurrentStep(0);
    setPhase("processing");
    setCurrentStep(1);

    try {
      const createdSubmission = await submitSubmission({
        hackathonId,
        teamId,
        repoUrl: repoUrl.trim(),
        problemStatement: problemStatement.trim() || undefined,
      });

      setCurrentStep(2);
      const latestSubmission = await pollSubmissionResult(createdSubmission.id);
      setSubmissionResult(latestSubmission || createdSubmission);
      setCurrentStep(processingSteps.length - 1);
      setPhase("done");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit your repository.");
      setPhase("form");
    }
  };

  const resolvedStatus = submissionResult?.status || "Queued";
  const hasScore = typeof submissionResult?.score === "number";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative z-10 w-full max-w-lg mx-6">
        <AnimatePresence mode="wait">
          {phase === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="surface-elevated rounded-xl p-8"
            >
              <div className="mb-6">
                <h1 className="text-xl font-bold text-foreground mb-1">{hackathonName}</h1>
                <p className="text-sm text-muted-foreground">
                  Team: <span className="text-foreground font-medium">{teamId}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    GitHub Repository URL <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="url"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                    placeholder="https://github.com/team/repo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                    Problem Statement <span className="text-muted-foreground/50">(Optional)</span>
                  </label>
                  <textarea
                    value={problemStatement}
                    onChange={(e) => setProblemStatement(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 resize-none"
                    placeholder="Describe your problem statement..."
                  />
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-accent transition-all duration-300 glow-primary hover:glow-primary-hover"
                >
                  Submit for Evaluation
                </button>
              </form>
            </motion.div>
          )}

          {phase === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="surface-elevated rounded-xl p-8"
            >
              <h2 className="text-lg font-bold text-foreground mb-6 text-center">Processing Submission</h2>
              
              <div className="space-y-4">
                {processingSteps.map((step, index) => {
                  const isComplete = index < currentStep;
                  const isActive = index === currentStep;
                  const isUpcoming = index > currentStep;
                  
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
                            backgroundColor: isComplete ? "#ff27f8" : isActive ? "#ff27f8" : "#222",
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
                            className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-8 bg-border"
                            animate={{
                              backgroundColor: isComplete ? "#5227FF" : "#222",
                            }}
                            transition={{ duration: 0.3 }}
                          />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <motion.p
                          animate={{
                            color: isComplete || isActive ? "#ffffff" : "#737373",
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
                            className="h-0.5 bg-primary mt-1.5 rounded-full"
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="surface-elevated rounded-xl p-8 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-lg font-bold text-foreground mb-2">
                {resolvedStatus === "Evaluated" ? "Evaluation Completed" : "Submission Registered"}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {resolvedStatus === "Evaluated"
                  ? "Your repository has been evaluated and the output is now stored in the database."
                  : "Your repository is queued. Final score output will appear shortly after evaluation."}
              </p>

              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Status: {resolvedStatus}
              </span>

              {hasScore && (
                <p className="mt-3 text-sm text-foreground font-medium">
                  Score: {submissionResult?.score?.toFixed(1)}
                  <span className="text-muted-foreground"> | Eval time: {submissionResult?.time || "N/A"}</span>
                </p>
              )}

              {hackathonId && (
                <Link
                  to={`/hackathon/${hackathonId}/leaderboard`}
                  className="inline-flex mt-5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-accent transition-all duration-300"
                >
                  View Leaderboard
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubmissionPage;
