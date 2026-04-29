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
      background: "#000000",
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
        <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.45rem", fontWeight: 500, letterSpacing: "0.02em", color: "#a78bfa", margin: "0 0 0.3rem" }}>
          {sublabel}
        </p>
        <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.8rem", fontWeight: 500, margin: 0, letterSpacing: "0.01em", color: "#f1f5f9" }}>{label}</h3>
      </div>

      {/* Status badge */}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: "0.35rem",
        padding: "0.25rem 0.75rem", borderRadius: "9999px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.3)",
        color: "#ffffff",
        fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase",
        flexShrink: 0,
        transition: "all 0.3s ease",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ffffff", flexShrink: 0, boxShadow: "0 0 8px rgba(255,255,255,0.5)", transition: "all 0.3s" }} />
        {enabled ? onLabel : offLabel}
      </span>
    </div>

    {/* Description */}
    <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.65, margin: 0 }}>
      {description}
    </p>

    {/* Toggle button */}
    <button
      onClick={onToggle}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.85rem 1.2rem",
        borderRadius: "0.75rem",
        border: "1px solid #ffffff",
        background: "transparent",
        color: "#ffffff",
        fontFamily: "'Playfair Display', serif",
        cursor: "pointer", fontSize: "1rem", fontWeight: 500,
        transition: "all 0.25s ease",
        width: "100%",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
    >
      <span>
        {enabled ? `Disable — ${offLabel}` : `Enable — ${onLabel}`}
      </span>

      {/* Toggle pill */}
      <span style={{
        display: "inline-flex", width: 42, height: 24, borderRadius: 12,
        background: enabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)",
        border: "1px solid #ffffff",
        padding: 3, alignItems: "center",
        justifyContent: enabled ? "flex-end" : "flex-start",
        transition: "all 0.3s",
        flexShrink: 0,
      }}>
        <span style={{
          width: 16, height: 16, borderRadius: "50%",
          background: "#ffffff",
          transition: "background 0.3s",
          boxShadow: enabled ? "0 0 6px #ffffff" : "none",
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
    <div style={{ minHeight: "100vh", background: "#000000", color: "#f1f5f9", padding: "2.5rem 2rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1rem", padding: "1.75rem 2rem" }}
        >
          {/* Breadcrumb - Font 1 size +3 */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Outfit', sans-serif", fontWeight: 600, letterSpacing: "-0.05em", fontSize: "1.2rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" }}>
            <button onClick={() => navigate("/orehackproject1924")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontFamily: "inherit", fontSize: "inherit", padding: 0, transition: "color 0.2s" }}>Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate("/orehackproject1924/panel")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontFamily: "inherit", fontSize: "inherit", padding: 0, transition: "color 0.2s" }}>Stages</button>
            <span>/</span>
            <span style={{ color: "#a78bfa" }}>Stage 2 — Live Monitoring</span>
          </div>

          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: "1.1rem", color: "#ffffff", marginBottom: "0.35rem" }}>Stage 2</p>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 500, fontSize: "2.6rem", margin: "0 0 0.4rem", color: "#7c3aed" }}>Live Monitoring</h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: "1.05rem", color: "rgba(255,255,255,0.38)", margin: "0 0 1.25rem" }}>
            Control the participant flow — toggle the Rules page, Waiting Room, and release the problem statements.
          </p>
          <button
            onClick={() => navigate("/orehackproject1924/panel")}
            style={{ fontFamily: "'Playfair Display', serif", background: "#ffffff", border: "1px solid #ffffff", borderRadius: "0.5rem", padding: "0.6rem 1.1rem", color: "#000000", fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#e5e5e5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
          >
            ← Back to Stages
          </button>
        </motion.div>

        {/* Flow diagram strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          style={{ display: "flex", alignItems: "center", gap: "0", background: "#000000", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.85rem", padding: "0.85rem 1.5rem", overflowX: "auto" }}
        >
          {[
            { step: "Login", active: true, color: "#a78bfa" },
            { step: "→", arrow: true },
            { step: "Rules", active: rulesEnabled, color: "#a78bfa" },
            { step: "→", arrow: true },
            { step: "Waiting Room", active: waitingRoomEnabled, color: "#a78bfa" },
            { step: "→", arrow: true },
            { step: "Stage 2 (Release)", active: stage1Active, color: "#a78bfa" },
          ].map((item, i) =>
            item.arrow ? (
              <span key={i} style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.9rem", padding: "0 0.5rem", flexShrink: 0 }}>→</span>
            ) : (
              <span key={i} style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.3rem", fontWeight: 500, padding: "0.3rem 0.75rem",
                borderRadius: "0.4rem", flexShrink: 0,
                background: item.step === "Stage 2 (Release)" ? (item.active ? `${item.color}15` : "rgba(255,255,255,0.04)") : "#ffffff",
                color: item.step === "Stage 2 (Release)" ? (item.active ? item.color! : "rgba(255,255,255,0.25)") : "#7c3aed",
                border: item.step === "Stage 2 (Release)" ? `1px solid ${item.active ? item.color! + "30" : "rgba(255,255,255,0.07)"}` : "1px solid #ffffff",
                textDecoration: (!item.active && item.step !== "Stage 2 (Release)") ? "line-through" : "none",
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
              onColor="#a78bfa"
              offColor="#ffffff"
              onBorder="rgba(167,139,250,0.3)"
              offBorder="rgba(255,255,255,0.25)"
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
              onColor="#a78bfa"
              offColor="#ffffff"
              onBorder="rgba(167,139,250,0.3)"
              offBorder="rgba(255,255,255,0.25)"
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
            background: "#000000",
            border: "1px solid rgba(255,255,255,0.07)",
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
              <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 500, letterSpacing: "0.02em", color: "#a78bfa", margin: "0 0 0.3rem", fontSize: "1.45rem" }}>
                Problem Statement Release
              </p>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", color: "#ffffff", fontWeight: 500, margin: "0 0 0.4rem" }}>
                {stage1Active ? "Event is LIVE — Problem Statements Released" : "Waiting for Start Signal"}
              </h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.42)", margin: 0, lineHeight: 1.6 }}>
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
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "9999px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffffff", boxShadow: "0 0 10px rgba(255,255,255,0.5)", animation: "lp 1.5s ease-in-out infinite" }} />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", color: "#ffffff" }}>LIVE</span>
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
                border: "1px solid #ffffff",
                background: stage1Active ? "rgba(255,255,255,0.8)" : "#ffffff",
                color: stage1Active ? "rgba(124,58,237,0.5)" : "#7c3aed",
                fontFamily: "'Playfair Display', serif",
                fontSize: "1rem",
                cursor: stage1Active ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => { if (!stage1Active) (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6"; }}
              onMouseLeave={e => { if (!stage1Active) (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
            >
              {stage1Active ? "Event Already Started" : "Start — Release Problem Statements"}
            </button>

            {/* RESET button */}
            {stage1Active && (
              <button
                onClick={handleResetEvent}
                style={{
                  padding: "0.9rem 1.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid #ffffff",
                  background: "#ffffff",
                  color: "#000000",
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#e5e5e5"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
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
