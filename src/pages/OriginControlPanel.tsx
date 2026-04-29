import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

/* ─── Stage definitions ───────────────────────────────────── */
const STAGES = [
  {
    number: 1,
    title: "Pre-Event Setup",
    subtitle: "Timer & Configuration",
    description: "Control the public countdown timer, set the event start time, enable or disable the clock, and configure pre-event parameters.",
    status: "active" as const,
    route: "/orehackproject1924/panel/stage-1",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M4.93 4.93a10 10 0 0 0 0 14.14" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(139,92,246,0.06) 100%)",
    border: "rgba(99,102,241,0.18)",
    number_color: "rgba(99,102,241,0.25)",
  },
  {
    number: 2,
    title: "Live Monitoring",
    subtitle: "Flow Control & Release",
    description: "Toggle the Rules page and Waiting Room on/off. Release the problem statements to all participants with a single Start button.",
    status: "active" as const,
    route: "/orehackproject1924/panel/stage-2",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, rgba(59,130,246,0.10) 0%, rgba(99,102,241,0.06) 100%)",
    border: "rgba(59,130,246,0.18)",
    number_color: "rgba(59,130,246,0.25)",
  },
  {
    number: 3,
    title: "Submission Control",
    subtitle: "Submission Desk Access",
    description: "Open or lock the submission desk for participants. When enabled, a 'Go to Submission' button appears on the Problem Statements Overview page.",
    status: "active" as const,
    route: "/orehackproject1924/panel/stage-3",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, rgba(168,85,247,0.10) 0%, rgba(236,72,153,0.06) 100%)",
    border: "rgba(168,85,247,0.18)",
    number_color: "rgba(168,85,247,0.25)",
  },
  {
    number: 4,
    title: "Reports & Data",
    subtitle: "Engine Output & Team Records",
    description: "Full database access — view, edit, and manage all submission records, scores, repo links and team credentials.",
    status: "active" as const,
    route: "/orehackproject1924/panel/stage-4",
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    gradient: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.07) 100%)",
    border: "rgba(16,185,129,0.28)",
    number_color: "rgba(16,185,129,0.28)",
  },
] as const;

/* ─── Stage card ────────────────────────────────────────────  */
const StageCard = ({ stage, index }: { stage: typeof STAGES[number]; index: number }) => {
  const navigate = useNavigate();
  const isActive = stage.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => isActive && "route" in stage && navigate(stage.route)}
      style={{
        position: "relative",
        background: "#000000",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "1.25rem",
        padding: "2rem",
        cursor: isActive ? "pointer" : "default",
        opacity: isActive ? 1 : 0.55,
        display: "flex",
        flexDirection: "column",
        gap: "1.1rem",
        overflow: "hidden",
        transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.3s ease, border-color 0.3s ease",
      }}
      whileHover={isActive ? { scale: 1.025, transition: { duration: 0.25 } } : undefined}
      whileTap={isActive ? { scale: 0.98 } : undefined}
    >
      {/* Text Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
          {/* Font 3: Outfit regular, purple */}
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: "0.95rem", color: "#7c3aed", margin: 0 }}>
            Stage {stage.number}
          </p>
          {/* Font 1: Outfit semi-bold, purple */}
          <span style={{
            display: "inline-block",
            padding: "0.2rem 0.65rem",
            borderRadius: "9999px",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            letterSpacing: "-0.05em",
            fontSize: "0.65rem",
            textTransform: "uppercase",
            background: isActive ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.07)",
            color: isActive ? "#a78bfa" : "rgba(255,255,255,0.35)",
            border: isActive ? "1px solid #7c3aed" : "1px solid rgba(255,255,255,0.1)",
          }}>
            {isActive ? "ACTIVE" : "COMING SOON"}
          </span>
        </div>

        {/* Font 5: Playfair Display */}
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: isActive ? "#ffffff" : "rgba(255,255,255,0.55)", margin: "0 0 0.3rem" }}>
          {stage.title}
        </h3>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)", margin: "0 0 0.75rem" }}>
          {stage.subtitle}
        </p>
        <p style={{ fontSize: "0.8rem", color: isActive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.28)", lineHeight: 1.6, margin: 0 }}>
          {stage.description}
        </p>
      </div>

      {/* CTA row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem", position: "relative", zIndex: 1 }}>
        {isActive ? (
          /* Font 2: Instrument Serif italic, purple */
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 500, fontSize: "1.2rem", color: "#7c3aed" }}>
            Enter Stage
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Under Development
          </span>
        )}
      </div>
    </motion.div>
  );
};

/* ─── Main ────────────────────────────────────────────────── */
const OriginControlPanel = () => {
  const navigate = useNavigate();
  const isAuthenticated =
    typeof window !== "undefined" &&
    sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";

  useEffect(() => {
    if (!isAuthenticated) navigate("/orehackproject1924");
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#000000", color: "#f1f5f9", padding: "2.5rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2.5rem" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "#000000",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "1rem",
            padding: "1.75rem 2rem",
          }}
        >
          {/* Breadcrumb - Font 1 size +3 */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Outfit', sans-serif", fontWeight: 600, letterSpacing: "-0.05em", fontSize: "1.2rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" }}>
            <button onClick={() => navigate("/orehackproject1924")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontFamily: "inherit", fontSize: "inherit", padding: 0, transition: "color 0.2s" }}>
              Dashboard
            </button>
            <span>/</span>
            <span style={{ color: "#a78bfa" }}>Select Stage</span>
          </div>

          {/* Event name - Font 5 white size +3 */}
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#ffffff", marginBottom: "0.35rem" }}>
            Origin 2K26 · Control Panel
          </p>
          
          {/* Select a stage - Font 2 */}
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 500, fontSize: "2.6rem", margin: "0 0 0.4rem", color: "#7c3aed" }}>
            Select a Stage
          </h1>
          
          {/* Choose the... - Font 1 size +2 */}
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, letterSpacing: "-0.05em", fontSize: "1.05rem", color: "rgba(255,255,255,0.38)", margin: "0 0 1.25rem" }}>
            Choose the operational stage to manage for this hackathon.
          </p>

          {/* Back to dashboard - Font 5 white box black text */}
          <button
            onClick={() => navigate("/orehackproject1924")}
            style={{ fontFamily: "'Playfair Display', serif", background: "#ffffff", border: "1px solid #ffffff", borderRadius: "0.5rem", padding: "0.6rem 1.1rem", color: "#000000", fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#e5e5e5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
          >
            ← Back to Dashboard
          </button>
        </motion.div>

        {/* Stage grid — 2 × 2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.1rem" }}>
          {STAGES.map((stage, i) => (
            <StageCard key={stage.number} stage={stage} index={i} />
          ))}
        </div>

        {/* Footer hint - Font 3 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{ textAlign: "center", fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: "0.95rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.02em" }}
        >
          Stages 1 – 4 are operational. Select a stage to manage.
        </motion.p>
      </div>
    </div>
  );
};

export default OriginControlPanel;
