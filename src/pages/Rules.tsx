import React, { useState, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEvent } from "@/context/EventContext";
import { useEventState } from "@/hooks/useEventState";
import PageTransition from "@/components/PageTransition";
import "@/styles/animations.css";

const RULES_DATA = [
  {
    id: "conduct",
    title: "Code of Conduct",
    color: "#a78bfa",
    items: [
      "Treat all participants, mentors, and organizers with respect.",
      "Harassment, discrimination, or unsportsmanlike behaviour results in immediate disqualification.",
      "All work must be original and created during the event window.",
      "Use of pre-existing templates or licensed code must be explicitly disclosed.",
    ],
  },
  {
    id: "submission",
    title: "Submission Rules",
    color: "#818cf8",
    items: [
      "Each team may submit only one final project.",
      "Submissions must include a public GitHub repository with a clear README.",
      "A working demo link or recorded walkthrough (≤5 min) is mandatory.",
      "Late submissions will not be accepted under any circumstances.",
      "Projects using prohibited libraries or APIs will be disqualified.",
    ],
  },
  {
    id: "time",
    title: "Time Constraints",
    color: "#c084fc",
    items: [
      "Hacking period: event start time to the announced deadline (see Waiting Room).",
      "You may begin only after the problem statements are officially released.",
      "Submission portal closes automatically at the deadline — plan accordingly.",
      "Judges' decisions are final. No appeals will be entertained after results.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility & Team Rules",
    color: "#67e8f9",
    items: [
      "Teams must consist of 1–4 registered participants.",
      "Each participant may only be part of one team.",
      "Registered team credentials are non-transferable.",
      "All team members must be present (online) at judging time.",
    ],
  },
] as const;

/* ─────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────── */
const Rules: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { setRulesAccepted } = useEvent();
  const { isAuthenticated, hasAcceptedRules, rulesEnabled } = useEventState();

  const [agreed, setAgreed] = useState(false);

  const baseEvent = eventId ?? "origin-2k26";
  const hackName  = baseEvent.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const handleContinue = useCallback(() => {
    if (!agreed) return;
    setRulesAccepted();
    navigate(`/event/${baseEvent}/waiting-room`);
  }, [agreed, setRulesAccepted, navigate, baseEvent]);

  /* ── Route guards ── */
  if (!isAuthenticated)  return <Navigate to={`/event/${baseEvent}/login`}        replace />;
  if (hasAcceptedRules)  return <Navigate to={`/event/${baseEvent}/waiting-room`} replace />;
  // Admin disabled the rules step — skip straight through
  if (!rulesEnabled) {
    setRulesAccepted();
    return <Navigate to={`/event/${baseEvent}/waiting-room`} replace />;
  }

  return (
    <PageTransition>
      <div
        className="relative min-h-screen overflow-hidden text-white selection:bg-purple-500/30"
        style={{ background: "linear-gradient(160deg, #0a0a0a 0%, #141414 40%, #1a1a1a 70%, #0d0d0d 100%)" }}
      >


        {/* Professional Ambient Purple Glows */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
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

        {/* ── Sticky top bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky top-0 z-30 flex items-center justify-between px-8 py-6 sm:px-12 backdrop-blur-md"
          style={{ background: "rgba(5,5,5,0.7)", borderBottom: "1px solid rgba(255,255,255,0.03)" }}
        >
          <span
            className="text-xl font-bold tracking-[0.05em] orehack-liquid-text"
            style={{
              color: "#7c3aed",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              letterSpacing: "-0.05em",
            }}
          >
            OREHACK ++
          </span>

          <span style={{
            display:"inline-flex", alignItems:"center", gap:6,
            padding: "3px 12px", borderRadius:999,
            border: "1px solid rgba(168,85,247,0.35)",
            background: "rgba(168,85,247,0.1)",
            fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase",
            color:"rgba(196,181,253,0.9)",
            fontFamily: "'Outfit', sans-serif",
          }}>
            Rules &amp; Regulations
          </span>
        </motion.div>

        {/* ── Main content ── */}
        <main style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 1.5rem 7rem", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            style={{ textAlign: "center", marginBottom: "2.5rem" }}
          >
            <h1 style={{
              fontSize: "clamp(1.75rem,4vw,2.75rem)",
              fontWeight: 800, letterSpacing: "-0.02em",
              color: "#fff",
              marginBottom: "0.75rem",
            }}>
              Rules &amp; Regulations
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
              Read the following carefully — you must agree before entering {hackName}.
            </p>
          </motion.div>

          {/* Rule sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {RULES_DATA.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.08 + idx * 0.1 }}
              >
                <motion.div 
                  whileHover={{ 
                    scale: 1.01, 
                    y: -2,
                    backgroundColor: "rgba(255,255,255,0.03)",
                    borderColor: "rgba(168,85,247,0.3)",
                    boxShadow: "0 8px 30px rgba(168,85,247,0.1)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    backdropFilter: "blur(8px)",
                    padding: "1.75rem 2rem",
                    cursor: "default",
                  }}
                >
                  {/* Section heading */}
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:"1.2rem" }}>
                    <div style={{ width:4, height:22, borderRadius:2, background: section.color, flexShrink:0, boxShadow: `0 0 10px ${section.color}80` }} />
                    <h3 style={{ fontSize:"1rem", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color: "rgba(255,255,255,0.95)" }}>
                      {section.title}
                    </h3>
                  </div>
                  <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"0.75rem", paddingLeft:0, margin:0 }}>
                    {section.items.map((item) => (
                      <li key={item} style={{ fontSize:"1rem", color:"rgba(255,255,255,0.75)", lineHeight:1.65, display:"flex", alignItems:"flex-start", gap:12 }}>
                        <span style={{ color:"rgba(139,92,246,0.65)", flexShrink:0, marginTop:3, fontSize:"0.9rem" }}>→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </main>

        {/* ── Sticky agree + continue footer ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 z-30 flex flex-wrap items-center justify-between gap-6 px-8 py-5 sm:px-12 backdrop-blur-xl"
          style={{
            background: "rgba(5,5,5,0.85)",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {/* Checkbox */}
          <label
            htmlFor="rules-agree"
            style={{ display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", flex:1, minWidth:220, userSelect:"none" }}
          >
            <input
              id="rules-agree"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ display:"none" }}
            />
            {/* Custom checkbox */}
            <div
              style={{
                width: 20, height: 20, minWidth: 20, borderRadius: 6, marginTop: 2,
                border: agreed ? "2px solid #a855f7" : "2px solid rgba(139,92,246,0.45)",
                background: agreed ? "linear-gradient(135deg,#7c3aed,#a855f7)" : "rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: agreed ? "0 0 12px rgba(168,85,247,0.55)" : "none",
                transition: "all 280ms",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <AnimatePresence>
                {agreed && (
                  <motion.svg
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    width="11" height="9" viewBox="0 0 11 9" fill="none"
                  >
                    <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </motion.svg>
                )}
              </AnimatePresence>
            </div>
            <span style={{ fontSize:"0.85rem", lineHeight:1.5, color: agreed ? "rgba(196,181,253,0.9)" : "rgba(255,255,255,0.42)", transition:"color 280ms" }}>
              I have read and agree to all Rules &amp; Regulations
            </span>
          </label>

          {/* Continue button */}
          <motion.button
            id="rules-continue-btn"
            whileHover={{ scale: agreed ? 1.04 : 1 }}
            whileTap={{ scale: agreed ? 0.97 : 1 }}
            onClick={handleContinue}
            disabled={!agreed}
            className="group relative flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold transition-all"
            style={{
              background: agreed ? "linear-gradient(135deg, #e8e8e8 0%, #ffffff 50%, #d0d0d0 100%)" : "rgba(255,255,255,0.05)",
              color: agreed ? "#000000" : "rgba(255,255,255,0.2)",
              cursor: agreed ? "pointer" : "not-allowed",
              boxShadow: agreed ? "0 4px 24px rgba(168,85,247,0.25), inset 0 1px 0 rgba(255,255,255,0.6)" : "none",
            }}
          >
            Continue 
            <svg className={`h-4 w-4 transition-transform ${agreed ? "group-hover:translate-x-1" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </PageTransition>
  );
};

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'red', padding: '2rem', background: 'black', minHeight: '100vh' }}>
          <h1>Rules Page Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function RulesWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Rules />
    </ErrorBoundary>
  );
}
