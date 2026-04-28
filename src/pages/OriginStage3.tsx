import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEvent } from "@/context/EventContext";
import { useEventState } from "@/hooks/useEventState";
import { AdminLockedBackground } from "./OriginAdmin";

const ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

/* ─── Main ─────────────────────────────────────────────────── */
const OriginStage3 = () => {
  const navigate = useNavigate();
  const { setSubmissionEnabled } = useEvent();
  const { submissionEnabled } = useEventState();

  const isAuthenticated =
    typeof window !== "undefined" &&
    sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";

  useEffect(() => {
    if (!isAuthenticated) navigate("/orehackproject1924");
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

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
            <span style={{ color: "#c4b5fd", fontWeight: 600 }}>Stage 03 — Submission Command</span>
          </div>

          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c4b5fd", marginBottom: "0.3rem" }}>STAGE 03</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.8rem", margin: "0 0 0.35rem" }}>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "2rem", fontWeight: 600, letterSpacing: "-0.05em", color: "#ffffff", margin: 0 }}>Submission Command</h1>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.2rem", color: "rgba(255,255,255,0.4)" }}>external access terminal</span>
          </div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontStyle: "italic", fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", margin: "0 0 1.25rem" }}>
            Authorize payload uploads from active subjects completing their environment evaluation.
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
            { step: "Problem Allocation", active: true, color: "#a78bfa" },
            { step: "→", arrow: true },
            { step: "Overview Page", active: true, color: "#60a5fa" },
            { step: "→", arrow: true },
            { step: "Submission Terminal", active: submissionEnabled, color: "#4ade80" },
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

        {/* ── Submission toggle card ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: submissionEnabled
              ? "linear-gradient(135deg, rgba(16,185,129,0.09) 0%, rgba(5,150,105,0.06) 100%)"
              : "linear-gradient(135deg, rgba(124,58,237,0.09) 0%, rgba(139,92,246,0.06) 100%)",
            border: submissionEnabled ? "1px solid rgba(74,222,128,0.28)" : "1px solid rgba(124,58,237,0.22)",
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
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: submissionEnabled ? "#4ade80" : "rgba(255,255,255,0.3)", margin: "0 0 0.3rem" }}>
                Submission Desk Access
              </p>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.4rem", fontWeight: 600, margin: "0 0 0.4rem", letterSpacing: "-0.01em", color: "#ffffff" }}>
                {submissionEnabled ? "🟢 Portals OPEN — Awaiting Data" : "🔒 Terminal LOCKED"}
              </h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontStyle: "italic", fontSize: "0.85rem", color: "rgba(255,255,255,0.42)", margin: 0, lineHeight: 1.6 }}>
                {submissionEnabled
                  ? "Subjects viewing problem statements now have full access to transmit payloads to the core system."
                  : "All external payloads are blocked. Subjects are limited to isolated environment analysis until unlocked."}
              </p>
            </div>

            {/* Status badge */}
            <AnimatePresence mode="wait">
            {submissionEnabled && (
              <motion.div
                key="active-badge"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "9999px", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.35)" }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px rgba(74,222,128,0.8)", animation: "lp 1.5s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", color: "#4ade80" }}>OPEN</span>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Enable button */}
            <button
              onClick={() => setSubmissionEnabled(true)}
              disabled={submissionEnabled}
              style={{
                flex: "1 1 200px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "1rem 1.5rem",
                borderRadius: "0.75rem",
                border: "none",
                background: submissionEnabled
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg, #7c3aed, #9333ea)",
                color: submissionEnabled ? "rgba(255,255,255,0.25)" : "#fff",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800, fontSize: "0.95rem",
                letterSpacing: "0.05em", textTransform: "uppercase",
                cursor: submissionEnabled ? "not-allowed" : "pointer",
                boxShadow: submissionEnabled ? "none" : "0 6px 24px rgba(124,58,237,0.35)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => { if (!submissionEnabled) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
              onMouseLeave={e => { if (!submissionEnabled) (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {submissionEnabled ? "Terminal Accessible" : "Unlock Terminal Flow"}
            </button>

            {/* Lock button */}
            {submissionEnabled && (
              <button
                onClick={() => setSubmissionEnabled(false)}
                style={{
                  padding: "1rem 1.5rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#f87171",
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700, fontSize: "0.82rem",
                  letterSpacing: "0.05em", textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Seal Access
              </button>
            )}
          </div>
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          style={{
            background: "rgba(10,10,15,0.7)",
            border: "1px solid rgba(124,58,237,0.15)",
            borderRadius: "1rem",
            padding: "1.5rem 1.8rem",
            backdropFilter: "blur(12px)",
          }}
        >
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 0.6rem" }}>
            Data Pathway
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              "Following matrix initialization, subjects complete problem decoding and map to local environment interfaces.",
              "Central network acts as a data lake — monitoring problem logic indefinitely without external time pressures.",
              "Enabling the core terminal reveals vector uplinks on all subject dashboards.",
              "Upon interaction, remote links to active Github registries are established for automated review.",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.72rem", fontWeight: 700, color: "rgba(167,139,250,0.6)", flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <style>{`
          @keyframes lp { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.4; transform:scale(1.5); } }
        `}</style>
      </div>
    </div>
  );
};

export default OriginStage3;
