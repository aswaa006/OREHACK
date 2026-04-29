import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useEvent } from "@/context/EventContext";
import { useEventState } from "@/hooks/useEventState";

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
            <span style={{ color: "#a78bfa" }}>Stage 3 — Submission Control</span>
          </div>

          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: "1.1rem", color: "#ffffff", marginBottom: "0.35rem" }}>Stage 3</p>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 500, fontSize: "2.6rem", margin: "0 0 0.4rem", color: "#7c3aed" }}>Submission Control</h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: "1.05rem", color: "rgba(255,255,255,0.38)", margin: "0 0 1.25rem" }}>
            Control whether participants can access the submission desk from the problem statements overview page.
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
            { step: "Problem Allocation", active: true, color: "#a78bfa" },
            { step: "→", arrow: true },
            { step: "Overview Page", active: true, color: "#a78bfa" },
            { step: "→", arrow: true },
            { step: "Submission Desk", active: submissionEnabled, color: "#a78bfa" },
          ].map((item, i) =>
            item.arrow ? (
              <span key={i} style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.9rem", padding: "0 0.5rem", flexShrink: 0 }}>→</span>
            ) : (
              <span key={i} style={{
                fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.3rem", fontWeight: 500, padding: "0.3rem 0.75rem",
                borderRadius: "0.4rem", flexShrink: 0,
                background: item.step === "Submission Desk" ? (item.active ? `${item.color}15` : "rgba(255,255,255,0.04)") : "#ffffff",
                color: item.step === "Submission Desk" ? (item.active ? item.color! : "rgba(255,255,255,0.25)") : "#7c3aed",
                border: item.step === "Submission Desk" ? `1px solid ${item.active ? item.color! + "30" : "rgba(255,255,255,0.07)"}` : "1px solid #ffffff",
                textDecoration: (!item.active && item.step !== "Submission Desk") ? "line-through" : "none",
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
              <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.45rem", fontWeight: 500, letterSpacing: "0.02em", color: "#ffffff", margin: "0 0 0.3rem" }}>
                Submission Desk Access
              </p>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 500, margin: "0 0 0.4rem", color: "#a78bfa" }}>
                {submissionEnabled ? "Submission Desk is OPEN" : "Submission Desk is LOCKED"}
              </h3>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.42)", margin: 0, lineHeight: 1.6 }}>
                {submissionEnabled
                  ? "Participants on the Problem Statements Overview page can now see and click the \"Go to Submission Desk\" button. They will be directed to submit their GitHub repository link."
                  : "The submission button is currently hidden on the Problem Statements Overview page. Participants can view the problem statements but cannot navigate to the submission desk yet."}
              </p>
            </div>

            {/* Status badge */}
            {submissionEnabled && (
              <motion.div
                key="active-badge"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "9999px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffffff", boxShadow: "0 0 10px rgba(255,255,255,0.5)", animation: "lp 1.5s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.14em", color: "#ffffff" }}>OPEN</span>
              </motion.div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {/* Enable button */}
            <button
              onClick={() => setSubmissionEnabled(true)}
              disabled={submissionEnabled}
              style={{
                flex: "1 1 200px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                padding: "0.9rem 1.5rem",
                borderRadius: "0.75rem",
                border: "1px solid #ffffff",
                background: submissionEnabled ? "rgba(255,255,255,0.8)" : "#ffffff",
                color: submissionEnabled ? "rgba(124,58,237,0.5)" : "#7c3aed",
                fontFamily: "'Playfair Display', serif",
                fontSize: "1rem",
                cursor: submissionEnabled ? "not-allowed" : "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={e => { if (!submissionEnabled) (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6"; }}
              onMouseLeave={e => { if (!submissionEnabled) (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
            >
              {submissionEnabled ? "Submission Already Open" : "Open Submission Desk"}
            </button>

            {/* Lock button */}
            {submissionEnabled && (
              <button
                onClick={() => setSubmissionEnabled(false)}
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
                Lock Submission Desk
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
            background: "#000000",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "1rem",
            padding: "1.5rem 1.8rem",
          }}
        >
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.25rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a78bfa", margin: "0 0 0.6rem" }}>
            How It Works
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              "After all 10 problem statements cycle through the allocation phase, participants are automatically redirected to the Problem Statements Overview page.",
              "The Overview page displays all problem statements in a read-only grid with no time limit.",
              "When you open the Submission Desk here, a prominent \"Go to Submission Desk\" button appears at the bottom of that page.",
              "Clicking it navigates participants to the existing Submission page where they enter their team name, GitHub URL, and problem statement.",
            ].map((text, i) => (
              <div key={i} style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", fontWeight: 700, color: "rgba(167,139,250,0.6)", flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.95rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.6, margin: 0 }}>{text}</p>
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
