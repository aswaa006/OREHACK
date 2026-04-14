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
  const { isAuthenticated, hasAcceptedRules } = useEventState();

  const [agreed, setAgreed] = useState(false);

  const baseEvent = eventId ?? "origin-2k25";
  const hackName  = baseEvent.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  /* ── Route guards ── */
  if (!isAuthenticated)  return <Navigate to={`/event/${baseEvent}/login`}        replace />;
  if (hasAcceptedRules)  return <Navigate to={`/event/${baseEvent}/waiting-room`} replace />;

  const handleContinue = useCallback(() => {
    if (!agreed) return;
    setRulesAccepted();
    navigate(`/event/${baseEvent}/waiting-room`);
  }, [agreed, setRulesAccepted, navigate, baseEvent]);

  return (
    <PageTransition>
      {/* Root — no overflow:hidden, full scroll */}
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg,#080b14 0%,#0d0b1e 55%,#080b14 100%)",
          color: "#fff",
          fontFamily: "'Inter', system-ui, sans-serif",
          overflowX: "hidden",
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            pointerEvents: "none",
            position: "fixed", inset: 0, zIndex: 0,
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.045) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Radial blobs */}
        <div style={{ pointerEvents:"none", position:"fixed", top:"-20%", left:"-15%", width:"55vw", height:"55vw", background:"radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)", borderRadius:"50%", zIndex:0 }} />
        <div style={{ pointerEvents:"none", position:"fixed", bottom:"-15%", right:"-10%", width:"45vw", height:"45vw", background:"radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)", borderRadius:"50%", zIndex:0 }} />

        {/* ── Sticky top bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "sticky", top: 0, zIndex: 30,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0.9rem 2rem",
            background: "rgba(8,11,20,0.82)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:"0.75rem", fontWeight:600, letterSpacing:"0.22em", textTransform:"uppercase", color:"rgba(196,181,253,0.85)" }}>
            ORE<span style={{ color:"rgba(255,255,255,0.3)" }}>HACK</span>
          </span>

          <span style={{
            display:"inline-flex", alignItems:"center", gap:6,
            padding: "3px 12px", borderRadius:999,
            border: "1px solid rgba(168,85,247,0.35)",
            background: "rgba(168,85,247,0.1)",
            fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase",
            color:"rgba(196,181,253,0.9)",
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
              background: "linear-gradient(135deg,#fff 40%,rgba(196,181,253,0.85) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              marginBottom: "0.75rem",
            }}>
              Rules &amp; Regulations
            </h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", maxWidth: 480, margin: "0 auto", lineHeight: 1.65 }}>
              Read the following carefully — you must agree before entering {hackName}.
            </p>
          </motion.div>

          {/* Rule sections */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {RULES_DATA.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.08 + idx * 0.1 }}
              >
                <div style={{
                  background: "rgba(15,12,28,0.75)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  backdropFilter: "blur(20px)",
                  padding: "1.4rem 1.6rem",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                }}>
                  {/* Section heading */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
                    <div style={{ width:3, height:18, borderRadius:2, background:`linear-gradient(180deg, ${section.color}, transparent)`, flexShrink:0 }} />
                    <h3 style={{ fontSize:"0.8rem", fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color: section.color }}>
                      {section.title}
                    </h3>
                  </div>
                  <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"0.55rem", paddingLeft:0, margin:0 }}>
                    {section.items.map((item) => (
                      <li key={item} style={{ fontSize:"0.86rem", color:"rgba(255,255,255,0.68)", lineHeight:1.65, display:"flex", alignItems:"flex-start", gap:10 }}>
                        <span style={{ color:"rgba(139,92,246,0.65)", flexShrink:0, marginTop:2, fontSize:"0.75rem" }}>→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </main>

        {/* ── Sticky agree + continue footer ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
            background: "rgba(8,11,20,0.94)",
            backdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "1rem 2rem",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem",
            flexWrap: "wrap",
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
            style={{
              padding: "0.7rem 2rem",
              borderRadius: 12,
              border: "none",
              background: agreed
                ? "linear-gradient(135deg,#7c3aed,#a855f7)"
                : "rgba(255,255,255,0.06)",
              color: agreed ? "#fff" : "rgba(255,255,255,0.25)",
              fontSize: "0.875rem", fontWeight: 600,
              cursor: agreed ? "pointer" : "not-allowed",
              transition: "all 280ms",
              boxShadow: agreed ? "0 4px 24px rgba(124,58,237,0.4)" : "none",
              minWidth: 160,
              fontFamily: "'Inter',system-ui,sans-serif",
            }}
          >
            Continue →
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
