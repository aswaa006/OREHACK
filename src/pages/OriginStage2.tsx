import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEvent } from "@/context/EventContext";
import { useEventState } from "@/hooks/useEventState";

const ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

/* ─── Reusable toggle row ───────────────────────────────────── */
interface ToggleRowProps {
  id: string;
  label: string;
  sublabel: string;
  description: string;
  enabled: boolean;
  onLabel: string;
  offLabel: string;
  onColor: string;   // hex/rgba
  offColor: string;
  onBorder: string;
  offBorder: string;
  onToggle: () => void;
}

const ToggleRow = ({
  id, label, sublabel, description,
  enabled, onLabel, offLabel,
  onColor, offColor, onBorder, offBorder,
  onToggle,
}: ToggleRowProps) => (
  <div
    id={id}
    style={{
      background: "rgba(15,18,30,0.7)",
      border: `1px solid ${enabled ? onBorder : offBorder}`,
      borderRadius: "1.1rem",
      padding: "1.6rem",
      transition: "border-color 0.3s ease",
      display: "flex",
      flexDirection: "column",
      gap: "0.9rem",
    }}
  >
    {/* Header */}
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
      <div>
        <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 0.3rem" }}>
          {sublabel}
        </p>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, letterSpacing: "-0.01em", color: "#f1f5f9" }}>{label}</h3>
      </div>

      {/* Status badge */}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "0.35rem",
        padding: "0.25rem 0.75rem", borderRadius: "9999px",
        background: enabled ? `${onColor}18` : "rgba(255,255,255,0.05)",
        border: `1px solid ${enabled ? onBorder : "rgba(255,255,255,0.09)"}`,
        color: enabled ? onColor : "rgba(255,255,255,0.3)",
        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
        flexShrink: 0,
        transition: "all 0.3s ease",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: enabled ? onColor : "rgba(255,255,255,0.2)", flexShrink: 0, boxShadow: enabled ? `0 0 8px ${onColor}` : "none", transition: "all 0.3s" }} />
        {enabled ? onLabel : offLabel}
      </span>
    </div>

    {/* Description */}
    <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.65, margin: 0 }}>
      {description}
    </p>

    {/* Toggle button */}
    <button
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.85rem 1.2rem",
        borderRadius: "0.75rem",
        border: `1px solid ${enabled ? offBorder : onBorder}`,
        background: enabled ? `${offColor}09` : `${onColor}09`,
        color: enabled ? offColor : onColor,
        cursor: "pointer", fontSize: "0.82rem", fontWeight: 700,
        transition: "all 0.25s ease",
        width: "100%",
      }}
    >
      <span>
        {enabled ? `Disable — ${offLabel}` : `Enable — ${onLabel}`}
      </span>

      {/* Toggle pill */}
      <span style={{
        display: "inline-flex", width: 42, height: 24, borderRadius: 12,
        background: enabled ? `${onColor}25` : "rgba(255,255,255,0.06)",
        border: `1px solid ${enabled ? onBorder : "rgba(255,255,255,0.1)"}`,
        padding: 3, alignItems: "center",
        justifyContent: enabled ? "flex-end" : "flex-start",
        transition: "all 0.3s",
        flexShrink: 0,
      }}>
        <span style={{
          width: 16, height: 16, borderRadius: "50%",
          background: enabled ? onColor : "rgba(255,255,255,0.25)",
          transition: "background 0.3s",
          boxShadow: enabled ? `0 0 6px ${onColor}` : "none",
        }} />
      </span>
    </button>
  </div>
);

/* ─── Main ─────────────────────────────────────────────────── */
const OriginStage2 = () => {
  const navigate = useNavigate();
  const { setRulesEnabled, setWaitingRoomEnabled, setStage1Active } = useEvent();
  const { rulesEnabled, waitingRoomEnabled, stage1Active } = useEventState();

  const isAuthenticated =
    typeof window !== "undefined" &&
    sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";

  useEffect(() => {
    if (!isAuthenticated) navigate("/orehackproject1924");
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const handleStartEvent = () => {
    // Flip stage1Active → WaitingRoom users auto-navigate to stage-2
    setStage1Active(true);
  };

  const handleResetEvent = () => {
    setStage1Active(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", color: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif", padding: "2.5rem 2rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "rgba(15,18,30,0.7)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1rem", padding: "1.75rem 2rem", backdropFilter: "blur(16px)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" }}>
            <button onClick={() => navigate("/orehackproject1924")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", padding: 0 }}>Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate("/orehackproject1924/panel")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", padding: 0 }}>Stages</button>
            <span>/</span>
            <span style={{ color: "#60a5fa", fontWeight: 600 }}>Stage 2 — Live Monitoring</span>
          </div>

          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#60a5fa", marginBottom: "0.3rem" }}>Stage 2</p>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 0.35rem" }}>Live Monitoring</h1>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)", margin: "0 0 1.25rem" }}>
            Control the participant flow — toggle the Rules page, Waiting Room, and release the problem statements.
          </p>
          <button
            onClick={() => navigate("/orehackproject1924/panel")}
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.5rem", padding: "0.4rem 1rem", color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", cursor: "pointer" }}
          >
            ← Back to Stages
          </button>
        </motion.div>

        {/* Flow diagram strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          style={{ display: "flex", alignItems: "center", gap: "0", background: "rgba(15,18,30,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.85rem", padding: "0.85rem 1.5rem", overflowX: "auto" }}
        >
          {[
            { step: "Login", active: true, color: "#a78bfa" },
            { step: "→", arrow: true },
            { step: "Rules", active: rulesEnabled, color: "#f472b6" },
            { step: "→", arrow: true },
            { step: "Waiting Room", active: waitingRoomEnabled, color: "#60a5fa" },
            { step: "→", arrow: true },
            { step: "Stage 2 (Release)", active: stage1Active, color: "#4ade80" },
          ].map((item, i) =>
            item.arrow ? (
              <span key={i} style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.9rem", padding: "0 0.5rem", flexShrink: 0 }}>→</span>
            ) : (
              <span key={i} style={{
                fontSize: "0.7rem", fontWeight: 700, padding: "0.3rem 0.75rem",
                borderRadius: "0.4rem", flexShrink: 0,
                background: item.active ? `${item.color}15` : "rgba(255,255,255,0.04)",
                color: item.active ? item.color! : "rgba(255,255,255,0.25)",
                border: `1px solid ${item.active ? item.color! + "30" : "rgba(255,255,255,0.07)"}`,
                textDecoration: (!item.active && !item.arrow) ? "line-through" : "none",
                transition: "all 0.3s",
              }}>
                {item.step}
              </span>
            )
          )}
        </motion.div>

        {/* Toggle cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

          {/* Rules toggle */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <ToggleRow
              id="toggle-rules"
              label="Rules & Regulations Page"
              sublabel="Page Control"
              description={
                rulesEnabled
                  ? "Participants must read and agree to all rules before entering the waiting room. Disable to skip this step entirely."
                  : "Rules page is SKIPPED. Participants go directly from login → waiting room (or stage 2). Re-enable to restore the rules requirement."
              }
              enabled={rulesEnabled}
              onLabel="RULES REQUIRED"
              offLabel="RULES SKIPPED"
              onColor="#f472b6"
              offColor="#fbbf24"
              onBorder="rgba(244,114,182,0.3)"
              offBorder="rgba(251,191,36,0.25)"
              onToggle={() => setRulesEnabled(!rulesEnabled)}
            />
          </motion.div>

          {/* Waiting Room toggle */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.14 }}>
            <ToggleRow
              id="toggle-waiting-room"
              label="Waiting Room Page"
              sublabel="Page Control"
              description={
                waitingRoomEnabled
                  ? "Participants land on the waiting room and stay there until the problem statements are released via the Start button below. Disable to skip directly to Stage 2."
                  : "Waiting room is SKIPPED. Participants flow directly from rules (or login) → Stage 2. Re-enable to restore the waiting room gate."
              }
              enabled={waitingRoomEnabled}
              onLabel="WAITING ROOM ACTIVE"
              offLabel="WAITING ROOM SKIPPED"
              onColor="#60a5fa"
              offColor="#fbbf24"
              onBorder="rgba(96,165,250,0.3)"
              offBorder="rgba(251,191,36,0.25)"
              onToggle={() => setWaitingRoomEnabled(!waitingRoomEnabled)}
            />
          </motion.div>
        </div>

        {/* ── Start / Release control ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: stage1Active
              ? "linear-gradient(135deg, rgba(16,185,129,0.09) 0%, rgba(5,150,105,0.06) 100%)"
              : "linear-gradient(135deg, rgba(99,102,241,0.09) 0%, rgba(139,92,246,0.06) 100%)",
            border: stage1Active ? "1px solid rgba(74,222,128,0.28)" : "1px solid rgba(99,102,241,0.22)",
            borderRadius: "1.25rem",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
            transition: "all 0.4s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 0.3rem" }}>
                Problem Statement Release
              </p>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.4rem", letterSpacing: "-0.01em" }}>
                {stage1Active ? "🟢  Event is LIVE — Problem Statements Released" : "⏸  Waiting for Start Signal"}
              </h3>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.42)", margin: 0, lineHeight: 1.6 }}>
                {stage1Active
                  ? "All participants in the waiting room have been automatically redirected to Stage 2. The event is in progress."
                  : "Click START to release the problem statements. All participants currently in the waiting room will be instantly redirected."}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {stage1Active ? (
                <motion.div
                  key="live-badge"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "9999px", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.35)" }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px rgba(74,222,128,0.8)", animation: "lp 1.5s ease-in-out infinite" }} />
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", color: "#4ade80" }}>LIVE</span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* START button */}
            <button
              onClick={handleStartEvent}
              disabled={stage1Active}
              style={{
                flex: "1 1 200px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.9rem 1.5rem",
                borderRadius: "0.75rem",
                border: "none",
                background: stage1Active
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg, #059669, #10b981)",
                color: stage1Active ? "rgba(255,255,255,0.25)" : "#fff",
                fontWeight: 800, fontSize: "0.95rem",
                cursor: stage1Active ? "not-allowed" : "pointer",
                boxShadow: stage1Active ? "none" : "0 6px 24px rgba(16,185,129,0.35)",
                transition: "all 0.3s ease",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {stage1Active ? "Event Already Started" : "▶  Start — Release Problem Statements"}
            </button>

            {/* RESET button */}
            {stage1Active && (
              <button
                onClick={handleResetEvent}
                style={{
                  padding: "0.9rem 1.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#f87171",
                  fontWeight: 700, fontSize: "0.82rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Reset / Stop Event
              </button>
            )}
          </div>
        </motion.div>

        <style>{`
          @keyframes lp { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.4; transform:scale(1.5); } }
        `}</style>
      </div>
    </div>
  );
};

export default OriginStage2;
