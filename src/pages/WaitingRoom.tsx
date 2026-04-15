import React, { useEffect, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEvent } from "@/context/EventContext";
import { useEventState } from "@/hooks/useEventState";
import PageTransition from "@/components/PageTransition";
import CountdownTimer from "@/components/CountdownTimer";
import "@/styles/animations.css";

/* ── Floating CSS particles ── */
const Particles: React.FC = () => (
  <div className="ore-particles">
    {Array.from({ length: 12 }, (_, i) => (
      <div key={i} className={`ore-particle ore-particle--${i + 1}`} />
    ))}
  </div>
);

/* ── Triple-ring CSS loader ── */
const Loader: React.FC = () => (
  <div className="ore-loader">
    <div className="ore-loader__ring ore-loader__ring--1" />
    <div className="ore-loader__ring ore-loader__ring--2" />
    <div className="ore-loader__ring ore-loader__ring--3" />
  </div>
);

/* ── Subtle scan-line overlay ── */
const ScanLines: React.FC = () => (
  <div
    style={{
      pointerEvents: "none",
      position: "fixed",
      inset: 0,
      zIndex: 1,
      backgroundImage:
        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)",
    }}
  />
);

/* ── Top bar ── */
const TopBar: React.FC<{ teamName: string }> = ({ teamName }) => (
  <motion.div
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 20,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1rem 2rem",
      background: "rgba(8,11,20,0.8)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(196,181,253,0.8)" }}>
      ORE<span style={{ color: "rgba(255,255,255,0.3)" }}>HACK</span>
    </span>

    {teamName && (
      <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.1em" }}>
        Team: <span style={{ color: "rgba(196,181,253,0.65)" }}>{teamName}</span>
      </span>
    )}

    <div className="ore-status">
      <div className="ore-status__dot ore-status__dot--waiting" />
      <span style={{ color: "rgba(251,191,36,0.7)", fontSize: "0.68rem", letterSpacing: "0.18em" }}>WAITING</span>
    </div>
  </motion.div>
);

/* ── Central status card ── */
const StatusCard: React.FC<{ currentTime: number; targetTime: number; onComplete: () => void }> = ({ currentTime, targetTime, onComplete }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.93 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
    style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 540, width: "100%", padding: "0 1.5rem" }}
  >
    {/* Loader or Countdown */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.35, duration: 0.55 }}
      style={{ marginBottom: "2.5rem", minHeight: 104, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      {currentTime < targetTime ? (
        <CountdownTimer currentTime={currentTime} targetTime={targetTime} onComplete={onComplete} />
      ) : (
        <Loader />
      )}
    </motion.div>

    {/* Status badge */}
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}
    >
      <span className="ore-badge" style={{ fontSize: "0.65rem", letterSpacing: "0.22em" }}>
        <div className="ore-status__dot ore-status__dot--waiting" style={{ width: 6, height: 6 }} />
        Standby
      </span>
    </motion.div>

    {/* Main message */}
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.6 }}
      style={{
        fontSize: "clamp(1.5rem,4.5vw,2.6rem)",
        fontWeight: 700,
        letterSpacing: "-0.02em",
        lineHeight: 1.2,
        color: "#fff",
        marginBottom: "1.25rem",
      }}
    >
      Please wait for the{" "}
      <span
        style={{
          background: "linear-gradient(135deg,#a855f7,#6366f1)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        problem statements
      </span>{" "}
      to be released
    </motion.h1>

    {/* Pulsing subtitle */}
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      className="ore-pulse-text"
      style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.875rem", lineHeight: 1.65 }}
    >
      The organizers will release the problem statements shortly.
      <br />
      This page will automatically advance when Stage 1 begins.
    </motion.p>

    {/* Divider with animated shimmer */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.85 }}
      style={{ margin: "2.5rem auto 0", width: 160, height: 1, background: "rgba(139,92,246,0.2)", borderRadius: 1, overflow: "hidden", position: "relative" }}
    >
      <motion.div
        style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.8),transparent)" }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>

    {/* Stats strip */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      style={{ display: "flex", justifyContent: "center", gap: "2.5rem", marginTop: "3rem", flexWrap: "wrap" }}
    >
      {[
        { label: "Status",    value: "Waiting" },
        { label: "Stage",     value: "Pre-Release" },
        { label: "Next",      value: "Problem Drop" },
      ].map(({ label, value }) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(196,181,253,0.7)" }}>{value}</div>
        </div>
      ))}
    </motion.div>
  </motion.div>
);

/* ── Ambient concentric rings ── */
const AmbientRings: React.FC = () => (
  <>
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        style={{
          position: "absolute",
          borderRadius: "50%",
          border: `1px solid rgba(139,92,246,${0.07 - i * 0.015})`,
          width:  `${20 + i * 18}vmax`,
          height: `${20 + i * 18}vmax`,
          left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }}
        animate={{ scale: [1, 1.03, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 5 + i * 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </>
);

/* ── Dev toggle panel (remove in prod) ── */
const DevPanel: React.FC<{ onActivate: () => void }> = ({ onActivate }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 2 }}
    style={{
      position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 30,
      background: "rgba(15,12,28,0.85)", border: "1px solid rgba(168,85,247,0.25)",
      borderRadius: 12, padding: "0.75rem 1rem",
      backdropFilter: "blur(12px)",
    }}
  >
    <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.28)", letterSpacing: "0.12em", marginBottom: 8, textTransform: "uppercase" }}>
      Dev Controls
    </p>
    <button
      onClick={onActivate}
      style={{
        fontSize: "0.72rem", fontWeight: 600, color: "#a855f7",
        background: "rgba(168,85,247,0.1)", border: "1px solid rgba(168,85,247,0.3)",
        borderRadius: 8, padding: "0.4rem 0.85rem", cursor: "pointer",
        transition: "all 200ms",
      }}
    >
      Simulate Stage 1 Active →
    </button>
  </motion.div>
);

/* ─────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────── */
const WaitingRoom: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { state, setStage1Active } = useEvent();
  const { isAuthenticated, hasAcceptedRules, stage1Active, teamName } = useEventState();

  const baseEvent = eventId ?? "origin-2k25";

  /* Route guards */
  if (!isAuthenticated)   return <Navigate to={`/event/${baseEvent}/login`} replace />;
  if (!hasAcceptedRules)  return <Navigate to={`/event/${baseEvent}/rules`} replace />;

  /* Auto-transition when stage1Active flips true */
  useEffect(() => {
    if (stage1Active) {
      const t = setTimeout(() => {
        navigate(`/event/${baseEvent}/stage-2`);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [stage1Active, navigate, baseEvent]);

  /* Time-based auto-start to prevent component unmount race conditions */
  useEffect(() => {
    if (state.currentTime >= state.eventStartTime && !stage1Active) {
      setStage1Active(true);
    }
  }, [state.currentTime, state.eventStartTime, stage1Active, setStage1Active]);

  const simulateStage1 = useCallback(() => {
    setStage1Active(true);
  }, [setStage1Active]);

  return (
    <PageTransition>
      <div
        className="ore-page ore-waiting-bg"
        style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        {/* Layers */}
        <div className="ore-grid-bg" />
        <div className="ore-radial-1" />
        <div className="ore-radial-2" />
        <ScanLines />
        <Particles />

        <TopBar teamName={teamName} />

        {/* Center stage */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", paddingTop: "4.5rem" }}>
          <AmbientRings />
          <StatusCard currentTime={state.currentTime} targetTime={state.eventStartTime} onComplete={simulateStage1} />
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            position: "relative", zIndex: 2,
            textAlign: "center", padding: "1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.14)",
            fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase",
          }}
        >
          OreHack by Oregent © 2025 — Waiting for organizer signal…
        </motion.footer>

        {/* Dev panel — remove before production */}
        <DevPanel onActivate={simulateStage1} />
      </div>
    </PageTransition>
  );
};

export default WaitingRoom;
