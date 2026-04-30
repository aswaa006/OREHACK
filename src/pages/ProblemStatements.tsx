import React from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { loadHackathonProblems, loadHackathonRuntime, resolveHackathonBySlug } from "@/lib/event-db";
import { useEventState } from "@/hooks/useEventState";
import PageTransition from "@/components/PageTransition";

type ProblemItem = {
  id: string;
  domain: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard" | "Open";
};

const DIFF_COLOR: Record<string, string> = {
  Easy: "#4ade80",
  Medium: "#fbbf24",
  Hard: "#f87171",
  Open: "#a78bfa",
};

/* ─── 10 Sample Problem Statements ─────────────────────────── */
const FALLBACK_PROBLEMS: ProblemItem[] = [
  {
    id: "PS-01",
    domain: "AI / ML",
    title: "Intelligent Resource Allocation",
    description:
      "Design a system that dynamically allocates compute resources across distributed tasks using reinforcement learning, minimising latency and maximising throughput under variable load conditions.",
    difficulty: "Hard",
  },
  {
    id: "PS-02",
    domain: "FinTech",
    title: "Real-Time Fraud Detection Pipeline",
    description:
      "Build a streaming fraud detection engine that processes transactions in under 50 ms with a false-positive rate below 0.1 %, integrating with standard banking APIs and providing human-readable audit trails.",
    difficulty: "Medium",
  },
  {
    id: "PS-03",
    domain: "HealthTech",
    title: "Diagnostic Image Analysis",
    description:
      "Create a model that classifies medical imaging data (X-ray / MRI) into diagnostic categories with explainability features — saliency maps, confidence scores — suitable for clinical decision support.",
    difficulty: "Hard",
  },
  {
    id: "PS-04",
    domain: "Sustainability",
    title: "Carbon Footprint Tracker",
    description:
      "Develop a platform that aggregates real-time emissions data from IoT sensors across a supply chain and uses ML forecasting to recommend the highest-impact reduction strategies.",
    difficulty: "Easy",
  },
  {
    id: "PS-05",
    domain: "DevTools",
    title: "Automated Code Review Assistant",
    description:
      "Build an LLM-powered assistant that reviews pull requests, identifies security vulnerabilities, suggests optimisations, and generates structured change summaries aligned to team style guides.",
    difficulty: "Medium",
  },
  {
    id: "PS-06",
    domain: "EdTech",
    title: "Adaptive Learning Path Engine",
    description:
      "Design a personalised curriculum engine that analyses learner performance in real time, identifies knowledge gaps, and dynamically re-orders content modules to maximise retention and engagement.",
    difficulty: "Medium",
  },
  {
    id: "PS-07",
    domain: "Cybersecurity",
    title: "Zero-Day Exploit Predictor",
    description:
      "Build a threat-intelligence system that ingests CVE feeds, public exploit databases, and dark-web signals to predict which unpatched vulnerabilities are most likely to be weaponised within 30 days.",
    difficulty: "Hard",
  },
  {
    id: "PS-08",
    domain: "Smart Cities",
    title: "Dynamic Traffic Flow Optimiser",
    description:
      "Create an adaptive signal-control system using real-time vehicle count data and ML to reduce average intersection wait times by at least 25 % without manual re-configuration by city operators.",
    difficulty: "Medium",
  },
  {
    id: "PS-09",
    domain: "AgriTech",
    title: "Crop Yield Prediction via Satellite",
    description:
      "Develop a pipeline that fuses multispectral satellite imagery with local weather data to forecast per-district crop yield three months ahead, surfacing alerts for likely shortfall regions.",
    difficulty: "Easy",
  },
  {
    id: "PS-10",
    domain: "Open Innovation",
    title: "Your Own Problem Statement",
    description:
      "Teams may propose a novel societal or technical challenge. The problem scope, domain, and solution approach must be clearly defined in the submission. Judged on originality and real-world impact.",
    difficulty: "Open",
  },
];

/* ─── Ambient concentric rings (mirrors WaitingRoom) ─────── */
const AmbientRings: React.FC = () => (
  <div style={{ pointerEvents: "none", position: "fixed", inset: 0, zIndex: 0, overflow: "hidden" }}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        style={{
          position: "absolute",
          borderRadius: "50%",
          border: `1px solid rgba(168,85,247,${0.09 - i * 0.025})`,
          width: `${28 + i * 14}vmax`,
          height: `${28 + i * 14}vmax`,
          left: "50%", top: "50%",
          transform: "translate(-50%,-50%)",
        }}
        animate={{ scale: [1, 1.04, 1], opacity: [0.35, 0.75, 0.35] }}
        transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ─── Problem Card ────────────────────────────────────────── */
const ProblemCard = ({ ps, index }: { ps: ProblemItem; index: number }) => {
  const col = DIFF_COLOR[ps.difficulty] ?? "#a78bfa";
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ borderColor: "rgba(168,85,247,0.4)", y: -3, transition: { duration: 0.2 } }}
      style={{
        background: "rgba(10,10,18,0.72)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "1rem",
        padding: "1.6rem 1.75rem",
        backdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        gap: "0.8rem",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
      }}
    >
      {/* subtle top-right glow */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 140, height: 140,
        background: "radial-gradient(circle at top right, rgba(139,92,246,0.07), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Top row: id + domain + difficulty */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          {/* PS-ID chip */}
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em",
            color: "rgba(167,139,250,0.9)",
            background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: "0.35rem", padding: "0.15rem 0.5rem",
          }}>
            {ps.id}
          </span>
          {/* Domain */}
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
          }}>
            {ps.domain}
          </span>
        </div>

        {/* Difficulty pill */}
        <span style={{
          fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
          color: col,
          background: `${col}18`,
          border: `1px solid ${col}35`,
          borderRadius: "9999px", padding: "0.2rem 0.65rem",
        }}>
          {ps.difficulty}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontSize: "1.05rem", fontWeight: 700,
        color: "#f1f5f9", letterSpacing: "-0.01em", margin: 0,
        lineHeight: 1.35,
      }}>
        {ps.title}
      </h3>

      {/* Description */}
      <p style={{
        fontSize: "0.825rem", color: "rgba(255,255,255,0.45)",
        lineHeight: 1.7, margin: 0,
      }}>
        {ps.description}
      </p>
    </motion.div>
  );
};

/* ─── Main Page ───────────────────────────────────────────── */
const ProblemStatements: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, hasAcceptedRules, stage1Active } = useEventState();
  const [problems, setProblems] = React.useState<ProblemItem[]>(FALLBACK_PROBLEMS);
  const [submissionEnabled, setSubmissionEnabled] = React.useState<boolean | null>(true);
  const [loading, setLoading] = React.useState(false);

  const baseEvent = eventId ?? "origin-2k26";

  React.useEffect(() => {
    // Hardcoded for UI/UX testing without DB
    setProblems(FALLBACK_PROBLEMS);
    setSubmissionEnabled(true);
    setLoading(false);
  }, [baseEvent]);

  /* Route guards */
  if (!isAuthenticated) return <Navigate to={`/event/${baseEvent}/login`} replace />;
  if (!hasAcceptedRules) return <Navigate to={`/event/${baseEvent}/rules`} replace />;
  if (!stage1Active) return <Navigate to={`/event/${baseEvent}/waiting-room`} replace />;

  return (
    <PageTransition>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(160deg, #0a0a0a 0%, #141414 40%, #1a1a1a 70%, #0d0d0d 100%)",
          color: "#f1f5f9",
          fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
          overflowX: "hidden",
          position: "relative",
        }}
      >
        {/* Background ambient glows */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <motion.div
            animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, borderRadius: "50%", background: "rgba(124,58,237,0.1)", filter: "blur(120px)" }}
          />
          <motion.div
            animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.2, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            style={{ position: "absolute", bottom: "-15%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "rgba(99,102,241,0.1)", filter: "blur(120px)" }}
          />
        </div>

        {/* Concentric ring watermark */}
        <AmbientRings />

        {/* ── Top bar (matches WaitingRoom / EventLanding) ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: "fixed", top: 0, left: 0, right: 0, zIndex: 30,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 3rem", height: 64,
            background: "rgba(5,5,5,0.75)", backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {/* Logo */}
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.875rem", fontWeight: 700, letterSpacing: "0.2em",
            color: "#ffffff", textTransform: "uppercase", lineHeight: 1,
          }}>
            OREHACK<span style={{ color: "#a855f7" }}>++</span>
          </span>

          {/* Status pill */}
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "5px 14px", borderRadius: 999,
            border: "1px solid rgba(168,85,247,0.35)",
            background: "rgba(168,85,247,0.08)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "rgba(216,180,254,0.9)", lineHeight: 1,
          }}>
            <motion.span
              style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7", display: "inline-block", flexShrink: 0 }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
            PROBLEMS RELEASED
          </span>
        </motion.div>

        {/* Purple progress bar at top */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 3, zIndex: 100, background: "rgba(255,255,255,0.04)" }}>
          <div style={{ height: "100%", width: "100%", background: "#a855f7", boxShadow: "0 0 10px rgba(168,85,247,0.5)" }} />
        </div>

        {/* ── Main content ── */}
        <main style={{
          position: "relative", zIndex: 10,
          maxWidth: 1000, margin: "0 auto",
          padding: "104px 2rem 120px",
        }}>

          {/* Page header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: "center", marginBottom: "3.5rem" }}
          >
            {/* Top badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}
            >
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "7px 20px", borderRadius: 999,
                border: "1px solid rgba(168,85,247,0.35)",
                background: "rgba(168,85,247,0.08)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.22em",
                textTransform: "uppercase", color: "rgba(216,180,254,0.9)",
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#a855f7", display: "inline-block" }} />
                PROBLEM STATEMENTS RELEASED
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "#fff",
                marginBottom: "1.25rem",
                textTransform: "uppercase",
              }}
            >
              CHOOSE YOUR{" "}
              <span style={{ color: "#a855f7" }}>CHALLENGE</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "1rem", lineHeight: 1.75, fontWeight: 300,
                maxWidth: 560, margin: "0 auto",
              }}
            >
              Review the problem statements below and align your team on a direction.
              <br />
              Proceed to submission once you're ready.
            </motion.p>

            {/* Shimmer divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              style={{ margin: "2.5rem auto 0", width: 80, height: 1, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", position: "relative" }}
            >
              <motion.div
                style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,transparent,rgba(168,85,247,0.9),transparent)" }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            style={{ display: "flex", justifyContent: "center", gap: "3.5rem", marginBottom: "3rem", flexWrap: "wrap" }}
          >
            {[
              { label: "Total", value: `${problems.length}` },
              { label: "Stage", value: "Active" },
              { label: "Phase", value: "Problem Drop" },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 8 }}>{label}</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em" }}>{value}</div>
              </div>
            ))}
          </motion.div>

          {/* Cards grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
            gap: "1rem",
          }}>
            {problems.map((ps, i) => (
              <ProblemCard key={ps.id} ps={ps} index={i} />
            ))}
          </div>
        </main>

        {/* ── Sticky bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
            background: "rgba(5,5,5,0.92)", backdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(168,85,247,0.12)",
            padding: "1rem 3rem",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "rgba(255,255,255,0.75)", margin: "0 0 0.2rem" }}>
              Ready to submit?
            </p>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)", margin: 0, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>
              Register your repository and chosen problem statement.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 40px rgba(168,85,247,0.5), 0 0 0 1px rgba(168,85,247,0.4)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/event/${baseEvent}/submit`)}
            disabled={submissionEnabled === false}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.6rem",
              padding: "0.85rem 2.5rem",
              borderRadius: 12, border: "none",
              background: submissionEnabled === false
                ? "rgba(168,85,247,0.2)"
                : "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff", fontSize: "0.95rem", fontWeight: 700,
              cursor: submissionEnabled === false ? "not-allowed" : "pointer",
              boxShadow: submissionEnabled === false ? "none" : "0 4px 24px rgba(124,58,237,0.45), 0 0 0 1px rgba(168,85,247,0.3), inset 0 1px 0 rgba(255,255,255,0.12)",
              whiteSpace: "nowrap",
              opacity: submissionEnabled === false ? 0.55 : 1,
              letterSpacing: "0.04em",
            }}
          >
            {submissionEnabled === false ? "Submission Locked" : "Proceed to Submission"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </motion.div>

        {/* Loading toast */}
        {loading && (
          <div style={{
            position: "fixed", left: "50%", bottom: "5.5rem",
            transform: "translateX(-50%)", zIndex: 31,
            padding: "0.7rem 1.25rem", borderRadius: 999,
            border: "1px solid rgba(168,85,247,0.2)", background: "rgba(10,10,18,0.92)",
            color: "rgba(255,255,255,0.6)", fontSize: "0.72rem",
            backdropFilter: "blur(20px)", fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.1em",
          }}>
            Loading live problem statements…
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ProblemStatements;
