import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

/* ─── Stage definitions ───────────────────────────────────── */
const STAGES = [
  {
    number: 1,
    title: "Pre-Event Setup",
    subtitle: "Registration & Configuration",
    description: "Configure hackathon parameters, set up registration pipelines, define problem domains and team structure.",
    status: "coming-soon" as const,
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
    subtitle: "Real-time Event Oversight",
    description: "Monitor active submissions, track participant progress in real-time and manage live scoring pipelines.",
    status: "coming-soon" as const,
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
    title: "Evaluation Engine",
    subtitle: "Scoring & Judging Interface",
    description: "Assign judges, distribute scoring templates, collect technical, innovation and completeness scores per team.",
    status: "coming-soon" as const,
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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
        background: stage.gradient,
        border: `1px solid ${stage.border}`,
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
      {/* Giant stage number watermark */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: "1.25rem",
          top: "-0.5rem",
          fontSize: "7rem",
          fontWeight: 900,
          color: stage.number_color,
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
          letterSpacing: "-0.04em",
        }}
      >
        {stage.number}
      </span>

      {/* Icon */}
      <div style={{
        width: 52, height: 52,
        borderRadius: "0.9rem",
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${stage.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: isActive ? "#6ee7b7" : "rgba(255,255,255,0.5)",
        flexShrink: 0,
      }}>
        {stage.icon}
      </div>

      {/* Text */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
          <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", margin: 0 }}>
            Stage {stage.number}
          </p>
          <span style={{
            display: "inline-block",
            padding: "0.15rem 0.55rem",
            borderRadius: "9999px",
            fontSize: "0.58rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            background: isActive ? "rgba(16,185,129,0.18)" : "rgba(255,255,255,0.07)",
            color: isActive ? "#6ee7b7" : "rgba(255,255,255,0.35)",
            border: isActive ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.1)",
          }}>
            {isActive ? "ACTIVE" : "COMING SOON"}
          </span>
        </div>

        <h3 style={{ fontSize: "1.3rem", fontWeight: 800, color: isActive ? "#f1f5f9" : "rgba(255,255,255,0.55)", margin: "0 0 0.2rem", letterSpacing: "-0.02em" }}>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.5rem", pos: "relative", zIndex: 1 }}>
        {isActive ? (
          <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 700, color: "#6ee7b7" }}>
            Enter Stage
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
    <div style={{ minHeight: "100vh", background: "#080b14", color: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif", padding: "2.5rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2.5rem" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(15,18,30,0.7)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "1rem",
            padding: "1.75rem 2rem",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" }}>
            <button onClick={() => navigate("/orehackproject1924")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", padding: 0, transition: "color 0.2s" }}>
              Dashboard
            </button>
            <span>/</span>
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>Select Stage</span>
          </div>

          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a78bfa", marginBottom: "0.35rem" }}>
            Origin 2K26 · Control Panel
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 0.4rem" }}>
            Select a Stage
          </h1>
          <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.38)", margin: "0 0 1.25rem" }}>
            Choose the operational stage to manage for this hackathon.
          </p>

          <button
            onClick={() => navigate("/orehackproject1924")}
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.5rem", padding: "0.4rem 1rem", color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.28)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; }}
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

        {/* Footer hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          style={{ textAlign: "center", fontSize: "0.68rem", color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em" }}
        >
          Stages 1 – 3 are under active development and will be unlocked progressively.
        </motion.p>
      </div>
    </div>
  );
};

export default OriginControlPanel;
