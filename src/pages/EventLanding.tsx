import React, { useCallback, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEvent } from "@/context/EventContext";
import { useEventState } from "@/hooks/useEventState";
import CountdownTimer from "@/components/CountdownTimer";
import PageTransition from "@/components/PageTransition";

/* ── Spinning Loader (same as WaitingRoom) ── */
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
  const [initialTime] = React.useState(currentTime);
  const totalDuration = Math.max(1000, targetTime - initialTime);
  const remaining = Math.max(0, targetTime - currentTime);
  const progress = Math.min(100, Math.max(0, ((totalDuration - remaining) / totalDuration) * 100));

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "3px", zIndex: 100, background: "rgba(255,255,255,0.05)" }}>
      <div
        style={{ height: "100%", background: "#a855f7", width: `${progress}%`, transition: "width 1s linear", boxShadow: "0 0 10px rgba(168,85,247,0.5)" }}
      />
    </div>
  );
};

/* ── Top bar ── */
const TopBar: React.FC<{ showLive: boolean }> = ({ showLive }) => (
  <motion.div
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8 sm:px-12 backdrop-blur-md"
    style={{
      background: "rgba(5,5,5,0.7)",
      borderBottom: "1px solid rgba(255,255,255,0.03)",
      height: "64px",
    }}
  >
    {/* Logo */}
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

    {/* Status pill — always purple */}
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
        animate={{ scale: [1, 1.35, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
      />
      {showLive ? "LIVE" : "WAITING"}
    </span>
  </motion.div>
);

/* ── Ambient concentric rings (same as WaitingRoom) ── */
const AmbientRings: React.FC = () => (
  <>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        style={{
          position: "absolute",
          borderRadius: "50%",
          border: `1px solid rgba(168,85,247,${0.1 - i * 0.03})`,
          width: `${30 + i * 14}vmax`,
          height: `${30 + i * 14}vmax`,
          left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
          pointerEvents: "none",
        }}
        animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </>
);

/* ── Shimmer divider ── */
const ShimmerDivider: React.FC = () => (
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
);

/* ── Stats strip ── */
const StatsStrip: React.FC<{ showLive: boolean }> = ({ showLive }) => {
  const items = showLive
    ? [{ label: "Status", value: "Live" }, { label: "Stage", value: "Active" }, { label: "Next", value: "Problem Drop" }]
    : [{ label: "Status", value: "Waiting" }, { label: "Stage", value: "Pre-Release" }, { label: "Next", value: "Problem Drop" }];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0 }}
      style={{ display: "flex", justifyContent: "center", gap: "3.5rem", marginTop: "2.75rem", flexWrap: "wrap" }}
    >
      {items.map(({ label, value }) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>{label}</div>
          <div style={{ fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>{value}</div>
        </div>
      ))}
    </motion.div>
  );
};

/* ══════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════ */
const EventLanding: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { state } = useEvent();
  const { isEventLive, currentTime, eventStartTime, eventName } = useEventState();

  const [countdownExpired, setCountdownExpired] = useState(false);

  useEffect(() => {
    if (isEventLive) setCountdownExpired(false);
  }, [isEventLive]);

  const resolvedName = eventId
    ? eventId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : eventName;

  const handleGoLive = useCallback(() => { setCountdownExpired(true); }, []);

  const handleLogin = useCallback(() => {
    navigate(`/event/${eventId ?? state.eventId}/login`);
  }, [navigate, eventId, state.eventId]);

  const showLive = isEventLive || countdownExpired;

  return (
    <PageTransition>
      <div
        className="relative min-h-screen overflow-hidden text-white flex flex-col"
        style={{ fontFamily: "'Outfit', sans-serif", background: "linear-gradient(160deg, #0a0a0a 0%, #141414 40%, #1a1a1a 70%, #0d0d0d 100%)" }}
      >

        {/* Ambient glows */}
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

        <TopProgressBar currentTime={currentTime} targetTime={eventStartTime} />
        <TopBar showLive={showLive} />

        {/* Center stage */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          paddingTop: "96px",
          paddingBottom: "48px",
          zIndex: 10,
        }}>
          <AmbientRings />

          <AnimatePresence mode="wait">
            {showLive ? (

              /* ── LIVE STATE ── */
              <motion.div
                key="live"
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 1200, width: "100%", padding: "0 2rem" }}
              >
                {/* Live state badge */}
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.45 }}
                  style={{ marginBottom: "3.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    padding: "10px 28px", borderRadius: 999,
                    border: "1px solid rgba(168,85,247,0.35)",
                    background: "rgba(168,85,247,0.08)",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.9rem", fontWeight: 700, letterSpacing: "0.22em",
                    textTransform: "uppercase", color: "rgba(216,180,254,0.9)",
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#a855f7", flexShrink: 0, display: "inline-block" }} />
                    EVENT IS LIVE
                  </span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.6 }}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "clamp(4rem, 10vw, 8rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    color: "#fff",
                    marginBottom: "2rem",
                    textTransform: "uppercase",
                  }}
                >
                  {resolvedName.toUpperCase()}
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.4rem", lineHeight: 1.75, fontWeight: 300, letterSpacing: "0.02em", marginBottom: "3rem", maxWidth: 700, marginInline: "auto" }}
                >
                  The arena is open. Authenticate with your team credentials to&nbsp;begin.
                </motion.p>

                {/* CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  whileHover={{ scale: 1.05, boxShadow: "0 0 56px rgba(255,255,255,0.35), 0 0 0 1px rgba(168,85,247,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogin}
                  className="group inline-flex items-center justify-center gap-3 rounded-full bg-white px-16 py-6 font-bold text-black"
                  style={{ fontSize: "1.2rem", boxShadow: "0 0 28px rgba(255,255,255,0.15), 0 0 0 1px rgba(168,85,247,0.2)", letterSpacing: "0.04em" }}
                >
                  Enter Now — Get Your Problem
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>

                <ShimmerDivider />
                <StatsStrip showLive={true} />
              </motion.div>

            ) : (

              /* ── PRE-EVENT / COUNTDOWN STATE ── */
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                style={{ position: "relative", zIndex: 2, textAlign: "center", maxWidth: 1200, width: "100%", padding: "0 2rem" }}
              >
                {/* Countdown */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, duration: 0.55 }}
                  style={{
                    marginBottom: "6rem",
                    minHeight: 140,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}
                >
                  <motion.div
                    style={{
                      position: "absolute", inset: "-24px",
                      borderRadius: "50%",
                      background: "radial-gradient(ellipse at center, rgba(168,85,247,0.12) 0%, transparent 70%)",
                      pointerEvents: "none", filter: "blur(8px)",
                    }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {currentTime < eventStartTime ? (
                    <CountdownTimer currentTime={currentTime} targetTime={eventStartTime} onComplete={handleGoLive} />
                  ) : (
                    <Loader />
                  )}
                </motion.div>

                {/* Heading — mirrors "AWAITING PROBLEM STATEMENT" pattern */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55, duration: 0.6 }}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "clamp(4rem, 10vw, 8rem)",
                    fontWeight: 900,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    color: "#fff",
                    marginBottom: "2rem",
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
                  style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.3rem", lineHeight: 1.75, fontWeight: 300, letterSpacing: "0.02em" }}
                >
                  The organizers will unlock the arena shortly.
                  <br />
                  This page will automatically advance when the event begins.
                </motion.p>

                {/* Early login CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.85 }}
                  style={{ marginTop: "2.5rem" }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 56px rgba(168,85,247,0.7), 0 0 0 1px rgba(168,85,247,0.5)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleLogin}
                    className="group inline-flex items-center justify-center gap-3 rounded-full px-14 py-5 font-bold"
                    style={{
                      fontSize: "1rem",
                      background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6366f1 100%)",
                      color: "#ffffff",
                      boxShadow: "0 4px 24px rgba(124,58,237,0.4), 0 0 0 1px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Early Login (Waiting Room)
                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.button>
                </motion.div>

                <ShimmerDivider />
                <StatsStrip showLive={false} />
              </motion.div>
            )}
          </AnimatePresence>
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
            fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          OreHack by Oregent © 2026 — Waiting for organizer signal…
        </motion.footer>
      </div>
    </PageTransition>
  );
};

export default EventLanding;
