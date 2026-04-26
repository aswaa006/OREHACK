import React, { useEffect, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEvent } from "@/context/EventContext";
import { useEventState } from "@/hooks/useEventState";
import PageTransition from "@/components/PageTransition";
import CountdownTimer from "@/components/CountdownTimer";
import "@/styles/animations.css";

/* ── Modern Spinner Loader ── */
const Loader: React.FC = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
    style={{
      width: 48, height: 48, borderRadius: "50%",
      border: "3px solid rgba(255,255,255,0.05)",
      borderTopColor: "#a855f7",
    }}
  />
);

/* ── Progress Bar ── */
const TopProgressBar: React.FC<{ currentTime: number; targetTime: number }> = ({ currentTime, targetTime }) => {
  // Calculate total duration from the moment the component mounts until the target time
  const [initialTime] = React.useState(currentTime);
  const totalDuration = Math.max(1000, targetTime - initialTime); // At least 1 second to avoid division by zero
  const remaining = Math.max(0, targetTime - currentTime);
  const progress = Math.min(100, Math.max(0, ((totalDuration - remaining) / totalDuration) * 100));

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '3px', zIndex: 100, background: 'rgba(255,255,255,0.05)' }}>
      <div
        style={{ height: '100%', background: '#a855f7', width: `${progress}%`, transition: 'width 1s linear', boxShadow: '0 0 10px rgba(168,85,247,0.5)' }}
      />
    </div>
  );
};

/* ── Top bar ── */
const TopBar: React.FC<{ teamName: string }> = ({ teamName }) => (
  <motion.div
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8 sm:px-12 backdrop-blur-md"
    style={{
      background: "rgba(5,5,5,0.7)",
      borderBottom: "1px solid rgba(255,255,255,0.03)",
      height: "64px",          /* fixed height keeps both sides on the same baseline */
    }}
  >
    {/* Logo — matches EventLanding style */}
    <span
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "0.875rem",
        fontWeight: 700,
        letterSpacing: "0.2em",
        color: "#ffffff",
        textTransform: "uppercase",
        lineHeight: 1,
      }}
    >
      OREHACK<span style={{ color: "#a855f7" }}>++</span>
    </span>

    {/* Right-hand pills — same baseline as logo via items-center on parent */}
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      {teamName && (
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.38)",
          lineHeight: 1,
        }}>
          TEAM{" "}
          <span style={{ color: "rgba(255,255,255,0.88)", fontWeight: 700 }}>{teamName.toUpperCase()}</span>
        </span>
      )}

      {/* WAITING pill with animated pulse dot */}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "5px 14px", borderRadius: 999,
        border: "1px solid rgba(168,85,247,0.35)",
        background: "rgba(168,85,247,0.08)",
        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
        color: "rgba(216,180,254,0.9)",
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1,
      }}>
        <motion.div
          style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", flexShrink: 0 }}
          animate={{
            boxShadow: [
              "0 0 4px rgba(168,85,247,0.4)",
              "0 0 12px rgba(168,85,247,0.9)",
              "0 0 4px rgba(168,85,247,0.4)",
            ],
            scale: [1, 1.35, 1],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        WAITING
      </span>
    </div>
  </motion.div>
);

/* ── Central status card ── */
const StatusCard: React.FC<{ currentTime: number; targetTime: number; onComplete: () => void }> = ({ currentTime, targetTime, onComplete }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.93 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
    style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 620, width: "100%", padding: "0 1.5rem", fontFamily: "'Outfit', sans-serif" }}
  >
    {/* Countdown with subtle ambient glow pulse */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.35, duration: 0.55 }}
      style={{
        marginBottom: "5rem",          /* ↑ more room between timer and heading */
        minHeight: 104,
        display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Faint glow behind the numbers — pulses to show the page is alive */}
      <motion.div
        style={{
          position: "absolute", inset: "-24px",
          borderRadius: "50%",
          background: "radial-gradient(ellipse at center, rgba(168,85,247,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          filter: "blur(8px)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />
      {currentTime < targetTime ? (
        <CountdownTimer currentTime={currentTime} targetTime={targetTime} onComplete={onComplete} />
      ) : (
        <Loader />
      )}
    </motion.div>

    {/* Main message */}
    <motion.h1
      className="glitch-text"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.6 }}
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "clamp(1.75rem,4.5vw,3rem)",
        fontWeight: 900,
        letterSpacing: "0.07em",
        lineHeight: 1.25,
        color: "#fff",
        marginBottom: "1.25rem",
        textTransform: "uppercase",
      }}
    >
      AWAITING{" "}
      <span style={{ color: "#a855f7" }}>PROBLEM STATEMENT</span>
    </motion.h1>

    {/* Subtitle */}
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7 }}
      style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", lineHeight: 1.7, fontWeight: 400, letterSpacing: "0.02em" }}
    >
      The organizers will unlock the arena shortly.
      <br />
      This page will automatically advance when the event begins.
    </motion.p>

    {/* Divider with animated shimmer */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.85 }}
      style={{ margin: "2.5rem auto 0", width: 80, height: 1, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", position: "relative" }}
    >
      <motion.div
        style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.9),transparent)" }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>

    {/* Stats strip */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      style={{ display: "flex", justifyContent: "center", gap: "3.5rem", marginTop: "2.75rem", flexWrap: "wrap" }}
    >
      {[
        { label: "Status", value: "Waiting" },
        { label: "Stage", value: "Pre-Release" },
        { label: "Next", value: "Problem Drop" },
      ].map(({ label, value }) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>{label}</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>{value}</div>
        </div>
      ))}
    </motion.div>
  </motion.div>
);

/* ── Ambient concentric rings ── */
const AmbientRings: React.FC = () => (
  <>
    {[0, 1].map((i) => (
      <motion.div
        key={i}
        style={{
          position: "absolute",
          borderRadius: "50%",
          border: `1px solid rgba(168,85,247,${0.08 - i * 0.04})`,
          width: `${35 + i * 15}vmax`,
          height: `${35 + i * 15}vmax`,
          left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }}
        animate={{ scale: [1, 1.03, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </>
);

/* ─────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────── */
const WaitingRoom: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { state, setStage1Active } = useEvent();
  const { isAuthenticated, hasAcceptedRules, stage1Active, teamName, waitingRoomEnabled } = useEventState();

  const baseEvent = eventId ?? "origin-2k26";

  /* Auto-transition when stage1Active flips true */
  useEffect(() => {
    if (stage1Active) {
      const t = setTimeout(() => {
        navigate(`/event/${baseEvent}/stage-2`);
      }, 600);
      return () => clearTimeout(t);
    }
  }, [stage1Active, navigate, baseEvent]);

  const simulateStage1 = useCallback(() => {
    setStage1Active(true);
  }, [setStage1Active]);

  /* Route guards */
  if (!isAuthenticated) return <Navigate to={`/event/${baseEvent}/login`} replace />;
  if (!hasAcceptedRules) return <Navigate to={`/event/${baseEvent}/rules`} replace />;
  // Admin skipped the waiting room — go straight to stage-2
  if (!waitingRoomEnabled) return <Navigate to={`/event/${baseEvent}/stage-2`} replace />;

  return (
    <PageTransition>
      <div
        className="relative min-h-screen overflow-hidden text-white flex flex-col"
        style={{ fontFamily: "'Outfit', sans-serif", background: "linear-gradient(160deg, #0a0a0a 0%, #141414 40%, #1a1a1a 70%, #0d0d0d 100%)" }}
      >


        {/* Professional Ambient Purple Glows */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <motion.div
            animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[150px]"
          />
          <motion.div
            animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[40%] -right-[10%] h-[500px] w-[500px] rounded-full bg-purple-900/20 blur-[150px]"
          />
        </div>

        <TopProgressBar currentTime={state.currentTime} targetTime={state.eventStartTime} />
        <TopBar teamName={teamName} />

        {/* Center stage — padded from the fixed topbar (64px) and balanced with footer */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          paddingTop: "96px",     /* topbar (64px) + 32px breathing room */
          paddingBottom: "48px",  /* pushes content slightly above true-center, balancing the footer */
          zIndex: 10,
        }}>
          <AmbientRings />
          <StatusCard currentTime={state.currentTime} targetTime={state.eventStartTime} onComplete={simulateStage1} />
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            position: "relative", zIndex: 10,
            textAlign: "center", padding: "1.25rem",
            color: "rgba(255,255,255,0.15)",
            fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700
          }}
        >
          OreHack by Oregent © 2025 — Waiting for organizer signal…
        </motion.footer>
      </div>
    </PageTransition>
  );
};

export default WaitingRoom;
