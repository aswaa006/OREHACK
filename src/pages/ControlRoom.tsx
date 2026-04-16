import React, { useCallback, useState, useMemo } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEventState } from "@/hooks/useEventState";
import { useControlState } from "@/hooks/useControlState";
import PageTransition from "@/components/PageTransition";
import ProblemCard from "@/components/ProblemCard";
import PhaseBanner from "@/components/PhaseBanner";
import TimerBar from "@/components/TimerBar";
import SelectionResultPanel from "@/components/SelectionResultPanel";
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

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const CardSkeleton: React.FC<{ n: number }> = ({ n }) => (
  <>
    {Array.from({ length: n }).map((_, i) => (
      <div
        key={i}
        style={{
          borderRadius: 18,
          background: "rgba(15,12,28,0.62)",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "1.4rem 1.6rem",
          height: 200,
          animation: "pulseText 1.6s ease-in-out infinite",
        }}
      />
    ))}
  </>
);

// ─── Top bar ──────────────────────────────────────────────────────────────────
const TopBar: React.FC<{
  teamName: string;
  phase: string;
  connectionStatus: "live" | "loading" | "error";
}> = ({ teamName, phase, connectionStatus }) => (
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
    {/* Brand */}
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

    {/* Centre label */}
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.25)",
      }}
    >
      Control Room — Stage 2
    </span>

    {/* Right cluster */}
    <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
      {teamName && (
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.1em" }}>
          Team:{" "}
          <span style={{ color: "rgba(196,181,253,0.65)" }}>{teamName}</span>
        </span>
      )}

      {/* Connection status dot */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background:
              connectionStatus === "live"
                ? "#4ade80"
                : connectionStatus === "error"
                  ? "#fb7185"
                  : "#fbbf24",
            boxShadow:
              connectionStatus === "live"
                ? "0 0 7px rgba(74,222,128,0.8)"
                : connectionStatus === "error"
                  ? "0 0 7px rgba(251,113,133,0.8)"
                  : "0 0 7px rgba(251,191,36,0.7)",
            animation:
              connectionStatus === "live"
                ? "pulseLive 1.8s ease-in-out infinite"
                : "pulseWait 2.2s ease-in-out infinite",
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color:
              connectionStatus === "live"
                ? "rgba(74,222,128,0.7)"
                : connectionStatus === "error"
                  ? "rgba(251,113,133,0.7)"
                  : "rgba(251,191,36,0.7)",
          }}
        >
          {connectionStatus === "live" ? "LIVE" : connectionStatus === "error" ? "ERROR" : "SYNC"}
        </span>
      </div>

      {/* Phase pill */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 10px",
          borderRadius: 999,
          border: "1px solid rgba(168,85,247,0.35)",
          background: "rgba(168,85,247,0.1)",
          fontSize: "0.6rem",
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(196,181,253,0.85)",
        }}
      >
        {phase}
      </span>
    </div>
  </motion.div>
);

// ─── Error banner ─────────────────────────────────────────────────────────────
const ErrorBanner: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      padding: "0.85rem 1.2rem",
      borderRadius: 12,
      background: "rgba(251,113,133,0.08)",
      border: "1px solid rgba(251,113,133,0.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      marginBottom: "1.5rem",
    }}
  >
    <span style={{ fontSize: "0.82rem", color: "rgba(251,113,133,0.85)" }}>
      ⚠ {message}
    </span>
    <button
      onClick={onRetry}
      style={{
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(251,113,133,0.8)",
        background: "rgba(251,113,133,0.1)",
        border: "1px solid rgba(251,113,133,0.25)",
        borderRadius: 8,
        padding: "0.3rem 0.75rem",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      Retry
    </button>
  </motion.div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const ControlRoom: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { isAuthenticated, hasAcceptedRules, teamId, teamName, stage1Active, waitingRoomEnabled } = useEventState();
  const baseEvent = eventId ?? "origin-2k25";
  const navigate = useNavigate();

  // Redirect back to waiting room if event is stopped
  React.useEffect(() => {
    if (!stage1Active && waitingRoomEnabled) {
      navigate(`/event/${baseEvent}/waiting-room`, { replace: true });
    }
  }, [stage1Active, waitingRoomEnabled, navigate, baseEvent]);

  // ⚠️ All hooks must be called BEFORE any early return (Rules of Hooks).
  const {
    phase,
    currentProblemId,
    phaseEndTime,
    problems,
    selections,
    loading,
    error,
    selectProblem,
    hasSelected,
    refresh,
  } = useControlState(teamId ?? "", stage1Active);

  const activeProblem = useMemo(() => problems.find(p => p.id === currentProblemId), [problems, currentProblemId]);

  const handleSelect = useCallback(
    async (problemId: string) => {
      await selectProblem(teamId, problemId);
    },
    [selectProblem, teamId]
  );

  const connectionStatus = error ? "error" : loading ? "loading" : "live";

  /* ── Route Guards (after all hooks) ── */
  if (!isAuthenticated) return <Navigate to={`/event/${baseEvent}/login`} replace />;
  if (!hasAcceptedRules) return <Navigate to={`/event/${baseEvent}/rules`} replace />;

  return (
    <PageTransition>
      <div
        className="ore-page ore-waiting-bg"
        style={{ minHeight: "100vh", overflowX: "hidden" }}
      >
        {/* ── Fixed bg layers ── */}
        <div className="ore-grid-bg" />
        <div className="ore-radial-1" />
        <div className="ore-radial-2" />
        <ScanLines />
        <Particles />

        {/* ── Top nav ── */}
        <TopBar teamName={teamName} phase={phase} connectionStatus={connectionStatus} />

        {/* ── Main content ── */}
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
                  Stage 2
                </p>
                <h1
                  style={{
                    fontSize: "clamp(1.6rem,3.5vw,2.4rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    background:
                      "linear-gradient(135deg,#fff 40%,rgba(196,181,253,0.8) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1.2,
                  }}
                >
                  Problem Statement Allocation
                </h1>
              </div>

              {/* Problem count */}
              {!loading && problems.length > 0 && (
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

          {/* Phase banner & Timer bar — only shown when event is actively running */}
          {stage1Active && (
            <>
              <PhaseBanner phase={phase} />
              <TimerBar phaseEndTime={phaseEndTime} phase={phase} />
            </>
          )}

          {/* Error banner */}
          {error && <ErrorBanner message={error} onRetry={refresh} />}

          {/* Result panel — shown during RESULT phase */}
          {phase === "RESULT" && (
            <SelectionResultPanel
              selections={selections}
              problems={problems}
              visible={true}
            />
          )}

          {/* Problem presentation */}
          {!stage1Active ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "6rem 2rem", background: "rgba(15,12,28,0.5)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>📡</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", marginBottom: "0.75rem" }}>Event Standby</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
                The problem statement release cycle is currently paused. 
                Please wait for the organizers to signal the start of the next phase.
              </p>
            </motion.div>
          ) : loading ? (
            <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.25rem" }}>
              <CardSkeleton n={4} />
            </motion.div>
          ) : problems.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "4rem 1.5rem", color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>
              No problem statements found. The organizers will publish them shortly.
            </motion.div>
          ) : phase === "VIEW" || phase === "RESULT" ? (
            <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.25rem" }}>
              {problems.map((problem, idx) => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  phase={phase}
                  isActive={phase === "SELECT" ? problem.id === currentProblemId : false}
                  hasSelected={hasSelected}
                  isMySelection={selections.some(s => s.team_id === teamId && s.problem_id === problem.id)}
                  onSelect={handleSelect}
                  index={idx}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div layout style={{ maxWidth: 640, margin: "0 auto" }}>
              {activeProblem ? (
                <ProblemCard
                  key={activeProblem.id}
                  problem={activeProblem}
                  phase={phase}
                  isActive={true}
                  hasSelected={hasSelected}
                  isMySelection={selections.some(s => s.team_id === teamId && s.problem_id === activeProblem.id)}
                  onSelect={handleSelect}
                  onReject={() => {}}
                  index={0}
                />
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "4rem 1.5rem", background: "rgba(15,12,28,0.6)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <h3 style={{ color: "white", marginBottom: "0.5rem" }}>Waiting...</h3>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>No current problem is active. The organizers will begin the next phase shortly.</p>
                </motion.div>
              )}
            </motion.div>
          )}
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
          OreHack by Oregent © 2025 — Control Room — Realtime via Supabase
        </motion.footer>
      </div>
    </PageTransition>
  );
};

export default ControlRoom;
