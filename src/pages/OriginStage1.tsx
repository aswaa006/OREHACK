import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEvent } from "@/context/EventContext";

const ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

/* ─── helpers ──────────────────────────────────────────────── */
function tsToLocal(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatAbsolute(ts: number): string {
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: true,
  });
}

/* ─── Timer ring  ──────────────────────────────────────────── */
const TimerRing = ({ remaining, total }: { remaining: number; total: number }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = Math.max(0, Math.min(1, remaining / total));
  const dashOffset = circ * (1 - progress);

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      {/* Track */}
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
      {/* Progress arc */}
      <circle
        cx="70" cy="70" r={r}
        fill="none"
        stroke={remaining <= 0 ? "#4ade80" : remaining < 300000 ? "#f59e0b" : "#a78bfa"}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 70 70)"
        style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.5s ease" }}
      />
      {/* Glow dot at tip */}
      {remaining > 0 && (
        <circle
          cx={70 + r * Math.cos(((-90 + (1 - progress) * 360) * Math.PI) / 180)}
          cy={70 + r * Math.sin(((-90 + (1 - progress) * 360) * Math.PI) / 180)}
          r="5"
          fill={remaining < 300000 ? "#f59e0b" : "#a78bfa"}
          style={{ filter: "blur(1px)" }}
        />
      )}
    </svg>
  );
};

/* ─── Main ─────────────────────────────────────────────────── */
const OriginStage1 = () => {
  const navigate = useNavigate();
  const { state, setEventStartTime, setTimerEnabled } = useEvent();
  const isAuthenticated =
    typeof window !== "undefined" &&
    sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";

  // Local datetime string bound to the input
  const [inputValue, setInputValue] = useState(() => tsToLocal(state.eventStartTime));
  const [saved, setSaved] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate("/orehackproject1924");
  }, [isAuthenticated, navigate]);

  // Keep input in sync if context changes from outside
  useEffect(() => {
    setInputValue(tsToLocal(state.eventStartTime));
  }, [state.eventStartTime]);

  const handleSave = () => {
    const ts = new Date(inputValue).getTime();
    if (isNaN(ts)) return;
    setEventStartTime(ts);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleToggleTimer = () => {
    if (state.timerEnabled) {
      // Ask for confirmation before disabling
      setConfirmDisable(true);
    } else {
      setTimerEnabled(true);
    }
  };

  const confirmDisableTimer = () => {
    setTimerEnabled(false);
    setConfirmDisable(false);
  };

  const msRemaining = state.eventStartTime - state.currentTime;
  // Total = 24h reference for the ring visual
  const RING_TOTAL = 24 * 60 * 60 * 1000;

  if (!isAuthenticated) return null;

  const isLive = state.isEventLive;

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", color: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif", padding: "2.5rem 2rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "rgba(15,18,30,0.7)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1rem", padding: "1.75rem 2rem", backdropFilter: "blur(16px)" }}
        >
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" }}>
            <button onClick={() => navigate("/orehackproject1924")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", padding: 0 }}>Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate("/orehackproject1924/panel")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", padding: 0 }}>Stages</button>
            <span>/</span>
            <span style={{ color: "#6ee7b7", fontWeight: 600 }}>Stage 1 — Pre-Event Setup</span>
          </div>

          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#6ee7b7", marginBottom: "0.3rem" }}>Stage 1</p>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 0.35rem" }}>Pre-Event Setup</h1>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)", margin: "0 0 1.25rem" }}>Configure the event start time and control the public countdown timer.</p>

          <button
            onClick={() => navigate("/orehackproject1924/panel")}
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.5rem", padding: "0.4rem 1rem", color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", cursor: "pointer" }}
          >
            ← Back to Stages
          </button>
        </motion.div>

        {/* Current Status banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem 1.5rem",
            borderRadius: "0.85rem",
            border: `1px solid ${isLive ? "rgba(74,222,128,0.3)" : "rgba(251,191,36,0.25)"}`,
            background: isLive ? "rgba(74,222,128,0.07)" : "rgba(251,191,36,0.07)",
          }}
        >
          <div style={{
            width: 10, height: 10, borderRadius: "50%",
            background: isLive ? "#4ade80" : "#fbbf24",
            boxShadow: isLive ? "0 0 12px rgba(74,222,128,0.8)" : "0 0 12px rgba(251,191,36,0.7)",
            animation: "pulse 1.8s ease-in-out infinite",
            flexShrink: 0,
          }} />
          <div>
            <p style={{ fontSize: "0.8rem", fontWeight: 700, color: isLive ? "#4ade80" : "#fbbf24", margin: "0 0 0.1rem" }}>
              {!state.timerEnabled ? "TIMER DISABLED — Event Always Live" : isLive ? "EVENT IS LIVE" : "COUNTDOWN ACTIVE"}
            </p>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
              {state.timerEnabled
                ? isLive
                  ? `Started at ${formatAbsolute(state.eventStartTime)}`
                  : `Scheduled for ${formatAbsolute(state.eventStartTime)}`
                : "The public countdown is hidden. Login is always accessible."}
            </p>
          </div>
        </motion.div>

        {/* Main split */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>

          {/* ── Left: Timer ring & countdown ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 }}
            style={{ background: "rgba(15,18,30,0.7)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.1rem", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}
          >
            <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0, alignSelf: "flex-start" }}>Live Countdown</p>

            {/* Ring */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TimerRing remaining={msRemaining} total={RING_TOTAL} />
              <div style={{ position: "absolute", textAlign: "center" }}>
                {!state.timerEnabled ? (
                  <span style={{ fontSize: "2rem" }}>∞</span>
                ) : (
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "1.1rem", fontWeight: 700, color: "#f1f5f9", letterSpacing: "0.06em" }}>
                    {msRemaining <= 0 ? "LIVE" : formatCountdown(msRemaining)}
                  </span>
                )}
              </div>
            </div>

            {/* Absolute time display */}
            <div style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "0.65rem", padding: "0.85rem 1rem", textAlign: "center" }}>
              <p style={{ fontSize: "0.6rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 0.3rem" }}>Scheduled Start</p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", color: state.timerEnabled ? "#c4b5fd" : "rgba(255,255,255,0.25)", margin: 0, textDecoration: state.timerEnabled ? "none" : "line-through" }}>
                {formatAbsolute(state.eventStartTime)}
              </p>
            </div>
          </motion.div>

          {/* ── Right: Controls ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >

            {/* Set start time */}
            <div style={{ background: "rgba(15,18,30,0.7)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1.1rem", padding: "1.5rem" }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 0.9rem" }}>Set Event Start Time</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <input
                  type="datetime-local"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  disabled={!state.timerEnabled}
                  style={{
                    width: "100%",
                    background: state.timerEnabled ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "0.6rem",
                    padding: "0.65rem 0.9rem",
                    color: state.timerEnabled ? "#f1f5f9" : "rgba(255,255,255,0.25)",
                    fontSize: "0.875rem",
                    outline: "none",
                    colorScheme: "dark",
                    cursor: state.timerEnabled ? "auto" : "not-allowed",
                    boxSizing: "border-box",
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <button
                    onClick={handleSave}
                    disabled={!state.timerEnabled}
                    style={{
                      flex: 1,
                      background: state.timerEnabled
                        ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                        : "rgba(255,255,255,0.06)",
                      border: "none",
                      borderRadius: "0.6rem",
                      padding: "0.65rem",
                      color: state.timerEnabled ? "#fff" : "rgba(255,255,255,0.25)",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                      cursor: state.timerEnabled ? "pointer" : "not-allowed",
                      transition: "all 0.2s ease",
                      boxShadow: state.timerEnabled ? "0 4px 18px rgba(124,58,237,0.3)" : "none",
                    }}
                  >
                    {saved ? "✓ Saved!" : "Apply Start Time"}
                  </button>

                  {/* Quick presets */}
                  <button
                    onClick={() => {
                      const future = new Date(Date.now() + 60 * 60 * 1000); // +1h
                      setInputValue(tsToLocal(future.getTime()));
                    }}
                    disabled={!state.timerEnabled}
                    title="+1 hour from now"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "0.6rem",
                      padding: "0.65rem 0.9rem",
                      color: state.timerEnabled ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
                      fontSize: "0.75rem",
                      cursor: state.timerEnabled ? "pointer" : "not-allowed",
                      whiteSpace: "nowrap",
                    }}
                  >
                    +1h
                  </button>
                  <button
                    onClick={() => {
                      const future = new Date(Date.now() + 30 * 60 * 1000); // +30min
                      setInputValue(tsToLocal(future.getTime()));
                    }}
                    disabled={!state.timerEnabled}
                    title="+30 minutes from now"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "0.6rem",
                      padding: "0.65rem 0.9rem",
                      color: state.timerEnabled ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
                      fontSize: "0.75rem",
                      cursor: state.timerEnabled ? "pointer" : "not-allowed",
                      whiteSpace: "nowrap",
                    }}
                  >
                    +30m
                  </button>
                </div>
              </div>

              {!state.timerEnabled && (
                <p style={{ fontSize: "0.72rem", color: "#fbbf24", marginTop: "0.65rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Enable the timer to set a start time.
                </p>
              )}
            </div>

            {/* Timer toggle */}
            <div style={{
              background: "rgba(15,18,30,0.7)",
              border: state.timerEnabled ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(251,191,36,0.25)",
              borderRadius: "1.1rem",
              padding: "1.5rem",
            }}>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 0.5rem" }}>Timer Control</p>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", margin: "0 0 1.1rem", lineHeight: 1.6 }}>
                {state.timerEnabled
                  ? "Timer is ON — public landing page shows the countdown and locks login until start time."
                  : "Timer is OFF — the countdown is hidden and login is always accessible regardless of time."}
              </p>

              <button
                onClick={handleToggleTimer}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.9rem 1.2rem",
                  borderRadius: "0.75rem",
                  border: state.timerEnabled ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(74,222,128,0.35)",
                  background: state.timerEnabled ? "rgba(251,191,36,0.08)" : "rgba(74,222,128,0.08)",
                  color: state.timerEnabled ? "#fbbf24" : "#4ade80",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  transition: "all 0.25s ease",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                  {state.timerEnabled ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
                    </svg>
                  )}
                  {state.timerEnabled ? "Disable Timer (Go Live Immediately)" : "Enable Timer (Restore Countdown)"}
                </span>

                {/* Toggle pill */}
                <span style={{
                  display: "inline-flex",
                  width: 40, height: 22,
                  borderRadius: 11,
                  background: state.timerEnabled ? "rgba(251,191,36,0.2)" : "rgba(74,222,128,0.25)",
                  border: state.timerEnabled ? "1px solid rgba(251,191,36,0.4)" : "1px solid rgba(74,222,128,0.4)",
                  padding: 2,
                  alignItems: "center",
                  transition: "background 0.3s",
                  justifyContent: state.timerEnabled ? "flex-end" : "flex-start",
                }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", background: state.timerEnabled ? "#fbbf24" : "#4ade80", transition: "background 0.3s", boxShadow: "0 0 6px rgba(0,0,0,0.3)" }} />
                </span>
              </button>
            </div>

          </motion.div>
        </div>

        {/* Confirm disable dialog */}
        <AnimatePresence>
          {confirmDisable && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmDisable(false)}
                style={{ position: "absolute", inset: 0, background: "rgba(8,11,20,0.85)", backdropFilter: "blur(8px)" }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 10 }}
                style={{ position: "relative", zIndex: 1, background: "rgba(15,18,30,0.95)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: "1.25rem", padding: "2rem", maxWidth: 420, width: "100%", textAlign: "center" }}
              >
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 0.5rem" }}>Disable the Timer?</h3>
                <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.5)", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
                  This will immediately set the event as <strong style={{ color: "#4ade80" }}>live</strong> for all users — the countdown will disappear and the login portal will open.
                </p>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => setConfirmDisable(false)}
                    style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.65rem", padding: "0.65rem", color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDisableTimer}
                    style={{ flex: 1, background: "linear-gradient(135deg, #d97706, #f59e0b)", border: "none", borderRadius: "0.65rem", padding: "0.65rem", color: "#1c1917", fontWeight: 800, fontSize: "0.82rem", cursor: "pointer", boxShadow: "0 4px 14px rgba(245,158,11,0.3)" }}
                  >
                    Yes, Go Live Now
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <style>{`
          @keyframes pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.5; transform:scale(1.4); } }
        `}</style>
      </div>
    </div>
  );
};

export default OriginStage1;
