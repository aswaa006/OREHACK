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
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>Stage 3 — Submission Control</span>
          </div>

          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a78bfa", marginBottom: "0.3rem" }}>Stage 3</p>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 0.35rem" }}>Submission Control</h1>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)", margin: "0 0 1.25rem" }}>
            Control whether participants can access the submission desk from the problem statements overview page.
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
            { step: "Problem Allocation", active: true, color: "#a78bfa" },
            { step: "→", arrow: true },
            { step: "Overview Page", active: true, color: "#60a5fa" },
            { step: "→", arrow: true },
            { step: "Submission Desk", active: submissionEnabled, color: "#4ade80" },
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

        {/* ── Submission toggle card ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            background: submissionEnabled
              ? "linear-gradient(135deg, rgba(16,185,129,0.09) 0%, rgba(5,150,105,0.06) 100%)"
              : "linear-gradient(135deg, rgba(99,102,241,0.09) 0%, rgba(139,92,246,0.06) 100%)",
            border: submissionEnabled ? "1px solid rgba(74,222,128,0.28)" : "1px solid rgba(99,102,241,0.22)",
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
                Submission Desk Access
              </p>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.4rem", letterSpacing: "-0.01em" }}>
                {submissionEnabled ? "🟢  Submission Desk is OPEN" : "🔒  Submission Desk is LOCKED"}
              </h3>
              <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.42)", margin: 0, lineHeight: 1.6 }}>
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
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "9999px", background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.35)" }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 10px rgba(74,222,128,0.8)", animation: "lp 1.5s ease-in-out infinite" }} />
                <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", color: "#4ade80" }}>OPEN</span>
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
                border: "none",
                background: submissionEnabled
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg, #059669, #10b981)",
                color: submissionEnabled ? "rgba(255,255,255,0.25)" : "#fff",
                fontWeight: 800, fontSize: "0.95rem",
                cursor: submissionEnabled ? "not-allowed" : "pointer",
                boxShadow: submissionEnabled ? "none" : "0 6px 24px rgba(16,185,129,0.35)",
                transition: "all 0.3s ease",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {submissionEnabled ? "Submission Already Open" : "Open Submission Desk"}
            </button>

            {/* Lock button */}
            {submissionEnabled && (
              <button
                onClick={() => setSubmissionEnabled(false)}
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
            background: "rgba(15,18,30,0.7)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "1rem",
            padding: "1.5rem 1.8rem",
          }}
        >
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 0.6rem" }}>
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
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "rgba(139,92,246,0.6)", flexShrink: 0, marginTop: 1 }}>{i + 1}.</span>
                <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.42)", lineHeight: 1.6, margin: 0 }}>{text}</p>
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
