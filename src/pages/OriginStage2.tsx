import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEvent } from "@/context/EventContext";
import { useEventState } from "@/hooks/useEventState";
import { AdminLockedBackground } from "./OriginAdmin";

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
  onColor: string;
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
      background: "rgba(10,10,15,0.7)",
      border: `1px solid ${enabled ? onBorder : offBorder}`,
      borderRadius: "1.1rem",
      padding: "1.6rem",
      backdropFilter: "blur(12px)",
      transition: "border-color 0.3s ease",
      display: "flex",
      flexDirection: "column",
      gap: "0.9rem",
    }}
  >
    {/* Header */}
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
      <div>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 0.3rem" }}>
          {sublabel}
        </p>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.3rem", fontWeight: 600, margin: 0, letterSpacing: "-0.02em", color: "#ffffff" }}>{label}</h3>
      </div>

      {/* Status badge */}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "0.35rem",
        padding: "0.25rem 0.75rem", borderRadius: "9999px",
        background: enabled ? `${onColor}18` : "rgba(255,255,255,0.05)",
        border: `1px solid ${enabled ? onBorder : "rgba(255,255,255,0.09)"}`,
        color: enabled ? onColor : "rgba(255,255,255,0.3)",
        fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
        flexShrink: 0,
        transition: "all 0.3s ease",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: enabled ? onColor : "rgba(255,255,255,0.2)", flexShrink: 0, boxShadow: enabled ? `0 0 8px ${onColor}` : "none", transition: "all 0.3s" }} />
        {enabled ? onLabel : offLabel}
      </span>
    </div>

    {/* Description */}
    <p style={{ fontFamily: "'Outfit', sans-serif", fontStyle: "italic", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
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
        cursor: "pointer", 
        fontFamily: "'Outfit', sans-serif", fontSize: "0.82rem", fontWeight: 700,
        letterSpacing: "0.05em", textTransform: "uppercase",
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
    setStage1Active(true);
  };

  const handleResetEvent = () => {
    setStage1Active(false);
  };

  return (
    <div className="relative z-0" style={{ minHeight: "100vh", padding: "2.5rem 2rem", background: "#050505" }}>
      <AdminLockedBackground />
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "rgba(8,8,12,0.8)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "1rem", padding: "1.75rem 2rem", backdropFilter: "blur(16px)", boxShadow: "0 0 40px rgba(124,58,237,0.05)" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Outfit', sans-serif", fontSize: "0.68rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" }}>
            <button onClick={() => navigate("/orehackproject1924")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", padding: 0, fontFamily: "inherit" }}>Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate("/orehackproject1924/panel")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "0.68rem", padding: 0, fontFamily: "inherit" }}>Stages</button>
            <span>/</span>
            <span style={{ color: "#c4b5fd", fontWeight: 600 }}>Stage 02 — Live Monitoring</span>
          </div>

          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c4b5fd", marginBottom: "0.3rem" }}>STAGE 02</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.8rem", margin: "0 0 0.35rem" }}>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.05em", color: "#ffffff", margin: 0 }}>Live Monitoring</h1>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.2rem", color: "rgba(255,255,255,0.4)" }}>transmission control</span>
          </div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontStyle: "italic", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", margin: "0 0 1.25rem" }}>
            Dictate the participant lifecycle matrix — manipulate gates, environments, and data flow.
          </p>
          <button
            onClick={() => navigate("/orehackproject1924/panel")}
            style={{ background: "none", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "0.5rem", padding: "0.4rem 1rem", color: "#c4b5fd", fontFamily: "'Outfit', sans-serif", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.6)"; (e.currentTarget as HTMLButtonElement).style.color = "#ffffff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd"; }}
          >
            ← Back to Stages
          </button>
        </motion.div>

        {/* Flow diagram strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          style={{ display: "flex", alignItems: "center", gap: "0", background: "rgba(8,8,12,0.8)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: "0.85rem", padding: "0.85rem 1.5rem", overflowX: "auto", backdropFilter: "blur(12px)" }}
        >
          {[
            { step: "Auth", active: true, color: "#a78bfa" },
            { step: "→", arrow: true },
            { step: "Protocol", active: rulesEnabled, color: "#f472b6" },
            { step: "→", arrow: true },
            { step: "Buffer Zone", active: waitingRoomEnabled, color: "#60a5fa" },
            { step: "→", arrow: true },
            { step: "Stage 02 (Active)", active: stage1Active, color: "#4ade80" },
          ].map((item, i) =>
            item.arrow ? (
              <span key={i} style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.9rem", padding: "0 0.5rem", flexShrink: 0 }}>→</span>
            ) : (
              <span key={i} style={{
                fontFamily: "'Space Mono', monospace",
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
              label="Initiation Protocols Page"
              sublabel="Access Gate"
              description={
                rulesEnabled
                  ? "Subjects must acknowledge and verify adherence to the structural operations before continuing."
                  : "Validation logic bypassed. Subjects are injected directly towards the next node."
              }
              enabled={rulesEnabled}
              onLabel="PROTOCOL REQUIRED"
              offLabel="PROTOCOL BYPASSED"
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
              label="Liminal Buffer Zone"
              sublabel="Access Gate"
              description={
                waitingRoomEnabled
                  ? "Subjects are isolated in the buffer room until absolute command executes the start protocol."
                  : "Buffer zone dissolved. Subjects route immediately to Stage 02 environment upon authentication."
              }
              enabled={waitingRoomEnabled}
              onLabel="BUFFER ZONE ACTIVE"
              offLabel="BUFFER ZONE SKIPPED"
              onColor="#a78bfa"
              offColor="#fbbf24"
              onBorder="rgba(167,139,250,0.3)"
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
              : "linear-gradient(135deg, rgba(124,58,237,0.09) 0%, rgba(139,92,246,0.06) 100%)",
            border: stage1Active ? "1px solid rgba(74,222,128,0.28)" : "1px solid rgba(124,58,237,0.22)",
            borderRadius: "1.25rem",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
            transition: "all 0.4s ease",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: stage1Active ? "#4ade80" : "#c4b5fd", margin: "0 0 0.3rem" }}>
                Absolute Execution
              </p>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.4rem", fontWeight: 600, margin: "0 0 0.4rem", letterSpacing: "-0.01em", color: "#ffffff" }}>
                {stage1Active ? "🟢 Matrix Deployed — Statements Sent" : "⏸ Awaiting Command Code"}
              </h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontStyle: "italic", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.6 }}>
                {stage1Active
                  ? "All subjects within the buffer zone have been forcibly projected into Stage 02. The timeline is now active."
                  : "Initiate to eject the data packets. Subjects in the buffer will be instantaneously transported to the objective view."}
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
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", color: "#4ade80" }}>LIVE</span>
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
                padding: "1rem 1.5rem",
                borderRadius: "0.75rem",
                border: "none",
                background: stage1Active
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg, #7c3aed, #9333ea)",
                color: stage1Active ? "rgba(255,255,255,0.25)" : "#fff",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800, fontSize: "0.95rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: stage1Active ? "not-allowed" : "pointer",
                boxShadow: stage1Active ? "none" : "0 6px 24px rgba(124,58,237,0.35)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => { if (!stage1Active) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
              onMouseLeave={e => { if (!stage1Active) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {stage1Active ? "Sequence Running" : "Execute Release"}
            </button>

            {/* RESET button */}
            {stage1Active && (
              <button
                onClick={handleResetEvent}
                style={{
                  padding: "1rem 1.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#f87171",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700, fontSize: "0.82rem",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Halt / Recall Data
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
