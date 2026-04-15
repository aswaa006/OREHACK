import React, { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEvent } from "@/context/EventContext";
import { useEventState } from "@/hooks/useEventState";
import CountdownTimer from "@/components/CountdownTimer";
import PageTransition from "@/components/PageTransition";
import AnimatedButton from "@/components/AnimatedButton";
import "@/styles/animations.css";

/* ── decorative background blobs ── */
const Blobs: React.FC = () => (
  <>
    <div className="ore-grid-bg" />
    <div className="ore-radial-1" />
    <div className="ore-radial-2" />

    {/* Extra top-center glow */}
    <div
      style={{
        pointerEvents: "none",
        position: "fixed",
        top: "-6%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "55vw",
        height: "38vw",
        background:
          "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)",
        borderRadius: "50%",
        zIndex: 0,
      }}
    />
  </>
);

/* ── floating particles ── */
const Particles: React.FC = () => (
  <div className="ore-particles">
    {Array.from({ length: 12 }, (_, i) => (
      <div key={i} className={`ore-particle ore-particle--${i + 1}`} />
    ))}
  </div>
);

/* ── top nav strip ── */
const TopBar: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1.25rem 2.5rem",
      background: "rgba(8,11,20,0.7)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    }}
  >
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.78rem",
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(196,181,253,0.8)",
      }}
    >
      ORE<span style={{ color: "rgba(255,255,255,0.4)" }}>HACK</span>
    </span>

    <div className="ore-status">
      <div className="ore-status__dot ore-status__dot--waiting" />
      <span style={{ color: "rgba(251,191,36,0.7)", fontSize: "0.68rem", letterSpacing: "0.18em" }}>
        PRE-EVENT
      </span>
    </div>
  </motion.div>
);

/* ── MODE A — countdown ── */
const CountdownMode: React.FC<{
  eventName: string;
  currentTime: number;
  eventStartTime: number;
  onComplete: () => void;
}> = ({ eventName, currentTime, eventStartTime, onComplete }) => (
  <div style={{ textAlign: "center", zIndex: 1, position: "relative" }}>
    {/* Eyebrow badge */}
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.1 }}
      style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}
    >
      <span className="ore-badge">
        <div className="ore-status__dot ore-status__dot--waiting" style={{ width: 6, height: 6 }} />
        Event starts in
      </span>
    </motion.div>

    {/* Title */}
    <motion.h1
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, delay: 0.18 }}
      style={{
        fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        lineHeight: 1.08,
        marginBottom: "0.6rem",
        background: "linear-gradient(135deg, #fff 30%, rgba(196,181,253,0.85) 70%, rgba(139,92,246,0.7) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {eventName}
    </motion.h1>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.28 }}
      style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.88rem", marginBottom: "3.5rem", letterSpacing: "0.08em" }}
    >
      Powered by Oregent
    </motion.p>

    {/* Countdown */}
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
    >
      <CountdownTimer
        currentTime={currentTime}
        targetTime={eventStartTime}
        onComplete={onComplete}
      />
    </motion.div>

    {/* Locked state notice */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55 }}
      style={{
        marginTop: "3rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.28)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
        Login unlocks when event goes live
      </span>
    </motion.div>

    {/* Decorative bottom info strip */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      style={{
        marginTop: "4.5rem",
        display: "flex",
        justifyContent: "center",
        gap: "2.5rem",
        flexWrap: "wrap",
      }}
    >
      {[
        { label: "Format", value: "Hackathon" },
        { label: "Mode", value: "Online" },
        { label: "Registration", value: "Open" },
      ].map(({ label, value }) => (
        <div key={label} style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: "4px" }}>{label}</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(196,181,253,0.75)" }}>{value}</div>
        </div>
      ))}
    </motion.div>
  </div>
);

/* ── MODE B — live / login reveal ── */
const LiveMode: React.FC<{ eventName: string; onLogin: () => void }> = ({ eventName, onLogin }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.65, ease: "easeOut" }}
    style={{ textAlign: "center", zIndex: 1, position: "relative" }}
  >
    {/* Live badge */}
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}
    >
      <span className="ore-badge" style={{ borderColor: "rgba(74,222,128,0.4)", background: "rgba(74,222,128,0.1)", color: "rgba(134,239,172,0.9)" }}>
        <div className="ore-status__dot ore-status__dot--live" style={{ width: 6, height: 6 }} />
        Event is Live
      </span>
    </motion.div>

    <motion.h1
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      style={{
        fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
        fontWeight: 800,
        letterSpacing: "-0.02em",
        lineHeight: 1.08,
        marginBottom: "0.6rem",
        background: "linear-gradient(135deg, #fff 30%, rgba(196,181,253,0.85) 70%, rgba(139,92,246,0.7) 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}
    >
      {eventName}
    </motion.h1>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.25 }}
      style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.88rem", marginBottom: "3rem", letterSpacing: "0.08em" }}
    >
      Powered by Oregent
    </motion.p>

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.55 }}
    >
      <AnimatedButton
        variant="primary"
        shimmer
        size="lg"
        onClick={onLogin}
        style={{ minWidth: 220 }}
      >
        Enter Portal →
      </AnimatedButton>
    </motion.div>

    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      style={{ marginTop: "1.25rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.26)", letterSpacing: "0.1em" }}
    >
      Authenticate with your team credentials
    </motion.p>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────── */
const EventLanding: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { state } = useEvent();
  const { isEventLive, currentTime, eventStartTime, eventName } = useEventState();

  const resolvedName = eventId
    ? eventId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : eventName;

  const handleGoLive = useCallback(() => {
    // triggered by countdown reaching zero or auto-switch
    // force a re-render by updating time — already handled by context
  }, []);

  const handleLogin = useCallback(() => {
    navigate(`/event/${eventId ?? state.eventId}/login`);
  }, [navigate, eventId, state.eventId]);

  return (
    <PageTransition>
      <div
        className="ore-page ore-waiting-bg"
        style={{ display: "flex", flexDirection: "column" }}
      >
        <Blobs />
        <Particles />
        <TopBar />

        {/* Centered content */}
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6rem 1.5rem 3rem",
            position: "relative",
            zIndex: 1,
          }}
        >
          <AnimatePresence mode="wait">
            {isEventLive ? (
              <motion.div key="live" style={{ width: "100%", textAlign: "center" }}>
                <LiveMode eventName={resolvedName} onLogin={handleLogin} />
              </motion.div>
            ) : (
              <motion.div key="countdown" style={{ width: "100%", textAlign: "center" }}>
                <CountdownMode
                  eventName={resolvedName}
                  currentTime={currentTime}
                  eventStartTime={eventStartTime}
                  onComplete={handleGoLive}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer strip */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "1.25rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            color: "rgba(255,255,255,0.18)",
            fontSize: "0.7rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          OreHack by Oregent © 2025
        </motion.footer>
      </div>
    </PageTransition>
  );
};

export default EventLanding;
