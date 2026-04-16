import React from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEventState } from "@/hooks/useEventState";
import PageTransition from "@/components/PageTransition";
import "@/styles/animations.css";

// ─── Scan-line overlay ────────────────────────────────────────────────────────
const ScanLines: React.FC = () => (
  <div
    style={{
      pointerEvents: "none",
      position: "fixed",
      inset: 0,
      zIndex: 1,
      backgroundImage:
        "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.009) 2px,rgba(255,255,255,0.009) 4px)",
    }}
  />
);

// ─── Floating particles ───────────────────────────────────────────────────────
const Particles: React.FC = () => (
  <div className="ore-particles">
    {Array.from({ length: 10 }, (_, i) => (
      <div key={i} className={`ore-particle ore-particle--${i + 1}`} />
    ))}
  </div>
);

// ─── Problem card (read-only) ─────────────────────────────────────────────────
interface ProblemData {
  id: string;
  title: string;
  description: string;
  slots: number;
  slots_taken: number;
}

const ReadOnlyProblemCard: React.FC<{ problem: ProblemData; index: number }> = ({ problem, index }) => {
  const isFull = problem.slots_taken >= problem.slots;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 18,
        background: "rgba(15,12,28,0.62)",
        border: `1px solid ${isFull ? "rgba(251,191,36,0.2)" : "rgba(139,92,246,0.18)"}`,
        padding: "1.6rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s ease, transform 0.3s ease",
      }}
    >
      {/* ID badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(196,181,253,0.5)",
          }}
        >
          {problem.id}
        </span>

        {/* Slot indicator */}
        <span
          style={{
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            padding: "0.2rem 0.6rem",
            borderRadius: 999,
            background: isFull ? "rgba(251,191,36,0.12)" : "rgba(74,222,128,0.1)",
            color: isFull ? "rgba(251,191,36,0.8)" : "rgba(74,222,128,0.8)",
            border: `1px solid ${isFull ? "rgba(251,191,36,0.25)" : "rgba(74,222,128,0.2)"}`,
          }}
        >
          {isFull ? "FULL" : `${problem.slots - problem.slots_taken}/${problem.slots} OPEN`}
        </span>
      </div>

      {/* Title */}
      <h3
        style={{
          fontSize: "1.05rem",
          fontWeight: 700,
          color: "#f1f5f9",
          margin: 0,
          lineHeight: 1.3,
          letterSpacing: "-0.01em",
        }}
      >
        {problem.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: "0.82rem",
          color: "rgba(255,255,255,0.42)",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {problem.description}
      </p>

      {/* Slot bar */}
      <div style={{ marginTop: "auto" }}>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (problem.slots_taken / problem.slots) * 100)}%` }}
            transition={{ duration: 0.8, delay: index * 0.06 + 0.3, ease: "easeOut" }}
            style={{
              height: "100%",
              borderRadius: 2,
              background: isFull
                ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
                : "linear-gradient(90deg, rgba(139,92,246,0.6), rgba(168,85,247,0.8))",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

// ─── Top bar ──────────────────────────────────────────────────────────────────
const TopBar: React.FC<{ teamName: string }> = ({ teamName }) => (
  <motion.div
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.9rem 2rem",
      background: "rgba(8,11,20,0.85)",
      backdropFilter: "blur(24px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      gap: "1rem",
      flexWrap: "wrap",
    }}
  >
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(196,181,253,0.8)",
      }}
    >
      ORE<span style={{ color: "rgba(255,255,255,0.28)" }}>HACK</span>
    </span>

    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.25)",
      }}
    >
      Problem Statements — Overview
    </span>

    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
      {teamName && (
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.1em" }}>
          Team: <span style={{ color: "rgba(196,181,253,0.65)" }}>{teamName}</span>
        </span>
      )}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 10px",
          borderRadius: 999,
          border: "1px solid rgba(74,222,128,0.35)",
          background: "rgba(74,222,128,0.1)",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(74,222,128,0.85)",
        }}
      >
        ALLOCATION COMPLETE
      </span>
    </div>
  </motion.div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const ProblemStatementsOverview: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, hasAcceptedRules, teamName, submissionEnabled } = useEventState();
  const baseEvent = eventId ?? "origin-2k25";

  // Load problems from sessionStorage (saved by ControlRoom before navigating here)
  const [problems, setProblems] = React.useState<ProblemData[]>([]);
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem("orehack_problems_snapshot");
      if (raw) setProblems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  /* Route guards */
  if (!isAuthenticated) return <Navigate to={`/event/${baseEvent}/login`} replace />;
  if (!hasAcceptedRules) return <Navigate to={`/event/${baseEvent}/rules`} replace />;

  return (
    <PageTransition>
      <div className="ore-page ore-waiting-bg" style={{ minHeight: "100vh", overflowX: "hidden" }}>
        {/* Fixed bg layers */}
        <div className="ore-grid-bg" />
        <div className="ore-radial-1" />
        <div className="ore-radial-2" />
        <ScanLines />
        <Particles />

        <TopBar teamName={teamName} />

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "6rem 1.5rem 5rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Page heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ marginBottom: "2rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                    color: "rgba(196,181,253,0.55)",
                    marginBottom: "0.5rem",
                  }}
                >
                  All Problem Statements
                </p>
                <h1
                  style={{
                    fontSize: "clamp(1.6rem,3.5vw,2.4rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    background: "linear-gradient(135deg,#fff 40%,rgba(196,181,253,0.8) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1.2,
                  }}
                >
                  Problem Statement Overview
                </h1>
              </div>

              {problems.length > 0 && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.28)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {problems.length} problem{problems.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </motion.div>

          {/* Completion banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              padding: "1.2rem 1.6rem",
              borderRadius: 16,
              background: "linear-gradient(135deg, rgba(74,222,128,0.06), rgba(16,185,129,0.04))",
              border: "1px solid rgba(74,222,128,0.2)",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>✅</span>
            <div>
              <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "rgba(74,222,128,0.9)", margin: "0 0 0.2rem" }}>
                Allocation Complete
              </p>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.5 }}>
                All problem statements have been presented and selections are finalized. Below is the full list for your reference.
              </p>
            </div>
          </motion.div>

          {/* Problem grid */}
          {problems.length > 0 ? (
            <motion.div
              layout
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {problems.map((problem, idx) => (
                <ReadOnlyProblemCard key={problem.id} problem={problem} index={idx} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: "center",
                padding: "4rem 1.5rem",
                color: "rgba(255,255,255,0.3)",
                fontSize: "0.9rem",
              }}
            >
              No problem statements data found. Please navigate back to the control room.
            </motion.div>
          )}

          {/* Submission button — only visible when admin enables it */}
          <AnimatePresence>
            {submissionEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                style={{
                  marginTop: "3rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <motion.button
                  onClick={() => navigate(`/event/${baseEvent}/submit`)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    padding: "1.1rem 3rem",
                    borderRadius: 16,
                    border: "none",
                    background: "linear-gradient(135deg, #8b5cf6, #6366f1, #a855f7)",
                    color: "#fff",
                    fontSize: "1rem",
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    cursor: "pointer",
                    boxShadow: "0 8px 32px rgba(139,92,246,0.35), 0 0 0 1px rgba(139,92,246,0.3)",
                    position: "relative",
                    overflow: "hidden",
                    transition: "box-shadow 0.3s ease",
                  }}
                >
                  {/* Shimmer */}
                  <motion.span
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.2) 50%, transparent 80%)",
                      pointerEvents: "none",
                    }}
                    animate={{ x: ["-140%", "140%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative", zIndex: 1 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                  <span style={{ position: "relative", zIndex: 1 }}>Go to Submission Desk →</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.12)",
            fontSize: "0.62rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          OreHack by Oregent © 2025 — Problem Statements Overview
        </motion.footer>
      </div>
    </PageTransition>
  );
};

export default ProblemStatementsOverview;
