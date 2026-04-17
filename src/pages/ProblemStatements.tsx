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
  difficulty: string;
  diffColor: string;
};

/* ─── Fallback problem statement entries ─────────────────────── */
const FALLBACK_PROBLEMS: ProblemItem[] = [
  {
    id: "PS-01",
    domain: "AI / ML",
    title: "Intelligent Resource Allocation",
    description:
      "Design a system that dynamically allocates compute resources across distributed tasks using reinforcement learning, minimizing latency and maximising throughput.",
    difficulty: "Hard",
    diffColor: "#f87171",
  },
  {
    id: "PS-02",
    domain: "FinTech",
    title: "Real-time Fraud Detection Pipeline",
    description:
      "Build a streaming fraud detection engine that processes transactions in under 50ms with a false-positive rate below 0.1%, integrating with existing banking APIs.",
    difficulty: "Medium",
    diffColor: "#fbbf24",
  },
  {
    id: "PS-03",
    domain: "HealthTech",
    title: "Diagnostic Image Analysis",
    description:
      "Create a model that classifies medical imaging data (X-ray / MRI) into diagnostic categories with explainability features suitable for clinical decision support.",
    difficulty: "Hard",
    diffColor: "#f87171",
  },
  {
    id: "PS-04",
    domain: "Sustainability",
    title: "Carbon Footprint Tracker",
    description:
      "Develop a platform that aggregates real-time emissions data from IoT sensors across a supply chain and recommends actionable reduction strategies.",
    difficulty: "Easy",
    diffColor: "#4ade80",
  },
  {
    id: "PS-05",
    domain: "DevTools",
    title: "Automated Code Review Assistant",
    description:
      "Build an LLM-powered assistant that reviews pull requests, identifies security vulnerabilities, suggests optimisations, and generates structured change summaries.",
    difficulty: "Medium",
    diffColor: "#fbbf24",
  },
  {
    id: "PS-06",
    domain: "Open Innovation",
    title: "Your Own Problem Statement",
    description:
      "Teams may propose a novel societal or technical challenge. The problem scope, domain, and solution approach must be clearly defined in the submission.",
    difficulty: "Open",
    diffColor: "#a78bfa",
  },
];

/* ─── Card ─────────────────────────────────────────────────── */
const ProblemCard = ({
  ps,
  index,
}: {
  ps: ProblemItem;
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.08 + index * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    style={{
      background: "rgba(15,18,30,0.75)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "1rem",
      padding: "1.4rem 1.6rem",
      backdropFilter: "blur(16px)",
      display: "flex",
      flexDirection: "column",
      gap: "0.65rem",
      position: "relative",
      overflow: "hidden",
      transition: "border-color 0.25s ease",
    }}
    whileHover={{ borderColor: "rgba(167,139,250,0.3)", transition: { duration: 0.2 } }}
  >
    {/* Corner shimmer */}
    <div style={{
      position: "absolute", top: 0, right: 0,
      width: 120, height: 120,
      background: "radial-gradient(circle at top right, rgba(139,92,246,0.08), transparent 70%)",
      pointerEvents: "none",
    }} />

    {/* Top row */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em",
          color: "rgba(167,139,250,0.85)",
          background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.22)",
          borderRadius: "0.35rem", padding: "0.15rem 0.5rem",
        }}>
          {ps.id}
        </span>
        <span style={{
          fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
        }}>
          {ps.domain}
        </span>
      </div>
      <span style={{
        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
        color: ps.diffColor,
        background: `${ps.diffColor}14`,
        border: `1px solid ${ps.diffColor}30`,
        borderRadius: "9999px", padding: "0.15rem 0.55rem",
      }}>
        {ps.difficulty}
      </span>
    </div>

    <h3 style={{
      fontSize: "1rem", fontWeight: 700, color: "#f1f5f9",
      letterSpacing: "-0.01em", margin: 0,
    }}>
      {ps.title}
    </h3>

    <p style={{
      fontSize: "0.8rem", color: "rgba(255,255,255,0.48)",
      lineHeight: 1.65, margin: 0,
    }}>
      {ps.description}
    </p>
  </motion.div>
);

/* ─── Main ─────────────────────────────────────────────────── */
const ProblemStatements: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, hasAcceptedRules, stage1Active } = useEventState();
  const [problems, setProblems] = React.useState<ProblemItem[]>(FALLBACK_PROBLEMS);
  const [submissionEnabled, setSubmissionEnabled] = React.useState<boolean | null>(null);
  const [loading, setLoading] = React.useState(true);

  const baseEvent = eventId ?? "origin-2k25";

  React.useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);

      const { data: hackathon } = await resolveHackathonBySlug(baseEvent);
      if (!mounted) return;

      if (!hackathon) {
        setProblems(FALLBACK_PROBLEMS);
        setSubmissionEnabled(null);
        setLoading(false);
        return;
      }

      const [{ data: problemRows, error: problemError }, { runtime }] = await Promise.all([
        loadHackathonProblems(hackathon.id),
        loadHackathonRuntime(hackathon.id),
      ]);

      if (!mounted) return;

      if (!problemError && problemRows) {
        setProblems(
          problemRows.map((row, index) => ({
            id: row.id,
            domain: "Hackathon",
            title: row.title,
            description: row.description,
            difficulty: row.slots_taken >= row.slots ? "Filled" : row.slots_taken > 0 ? "Active" : `Problem ${index + 1}`,
            diffColor: row.slots_taken >= row.slots ? "#f59e0b" : "#a78bfa",
          })),
        );
      } else {
        setProblems(FALLBACK_PROBLEMS);
      }

      setSubmissionEnabled(runtime?.submission_enabled ?? null);
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [baseEvent]);

  /* Route guards */
  if (!isAuthenticated)  return <Navigate to={`/event/${baseEvent}/login`} replace />;
  if (!hasAcceptedRules) return <Navigate to={`/event/${baseEvent}/rules`}  replace />;
  if (!stage1Active)     return <Navigate to={`/event/${baseEvent}/waiting-room`} replace />;

  return (
    <PageTransition>
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #080b14 0%, #0d0b1e 55%, #080b14 100%)",
        color: "#f1f5f9",
        fontFamily: "'Inter', system-ui, sans-serif",
        overflowX: "hidden",
      }}>
        {/* Grid overlay */}
        <div style={{
          pointerEvents: "none", position: "fixed", inset: 0, zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
        {/* Ambient blobs */}
        <div style={{ pointerEvents: "none", position: "fixed", top: "-20%", left: "-15%", width: "55vw", height: "55vw", background: "radial-gradient(circle, rgba(124,58,237,0.10) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }} />
        <div style={{ pointerEvents: "none", position: "fixed", bottom: "-15%", right: "-10%", width: "45vw", height: "45vw", background: "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)", borderRadius: "50%", zIndex: 0 }} />

        {/* ── Sticky top bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{
            position: "sticky", top: 0, zIndex: 30,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0.9rem 2rem",
            background: "rgba(8,11,20,0.82)", backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(196,181,253,0.85)" }}>
            ORE<span style={{ color: "rgba(255,255,255,0.3)" }}>HACK</span>
          </span>

          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "3px 12px", borderRadius: 999,
            border: "1px solid rgba(74,222,128,0.35)", background: "rgba(74,222,128,0.08)",
            fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(110,231,183,0.9)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px rgba(74,222,128,0.9)", animation: "ps-pulse 1.6s ease-in-out infinite" }} />
            Problem Statements Released
          </span>
        </motion.div>

        {/* ── Main content ── */}
        <main style={{ maxWidth: 820, margin: "0 auto", padding: "2.5rem 1.5rem 10rem", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: "center", marginBottom: "2.5rem" }}
          >
            {/* Live status badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", padding: "0.3rem 0.9rem", borderRadius: "9999px", background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#fbbf24" }}>
                Live Statements Feed
              </span>
            </div>

            <h1 style={{
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              fontWeight: 800, letterSpacing: "-0.02em",
              background: "linear-gradient(135deg, #fff 40%, rgba(196,181,253,0.85) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              marginBottom: "0.75rem",
            }}>
              Problem Statements
            </h1>
            <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.875rem", maxWidth: 500, margin: "0 auto", lineHeight: 1.65 }}>
              Review the available problem statements below and choose your team direction.
              The list auto-syncs with the current event data.
            </p>
          </motion.div>

          {/* Problem cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem", marginBottom: "3rem" }}>
            {problems.map((ps, i) => (
              <ProblemCard key={ps.id} ps={ps} index={i} />
            ))}
          </div>
        </main>

        {/* ── Sticky bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
            background: "rgba(8,11,20,0.94)", backdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "1rem 2rem",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "rgba(255,255,255,0.7)", margin: "0 0 0.2rem" }}>
              Ready to submit?
            </p>
            <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.32)", margin: 0 }}>
              Proceed to the submission desk to register your repository and problem statement.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(`/event/${baseEvent}/submit`)}
            disabled={submissionEnabled === false}
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.6rem",
              padding: "0.75rem 2rem",
              borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #7c3aed, #a855f7)",
              color: "#fff", fontSize: "0.875rem", fontWeight: 700,
              cursor: submissionEnabled === false ? "not-allowed" : "pointer",
              boxShadow: "0 4px 24px rgba(124,58,237,0.45)",
              whiteSpace: "nowrap",
              fontFamily: "'Inter', system-ui, sans-serif",
              opacity: submissionEnabled === false ? 0.55 : 1,
            }}
          >
            {submissionEnabled === false ? "Submission Locked" : "Proceed to Submission"}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </motion.button>
        </motion.div>

        {loading && (
          <div style={{ position: "fixed", left: "50%", bottom: "5.5rem", transform: "translateX(-50%)", zIndex: 31, padding: "0.7rem 1rem", borderRadius: 999, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(8,11,20,0.9)", color: "rgba(255,255,255,0.72)", fontSize: "0.75rem", backdropFilter: "blur(20px)" }}>
            Loading live problem statements...
          </div>
        )}

        <style>{`
          @keyframes ps-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.5); }
          }
        `}</style>
      </div>
    </PageTransition>
  );
};

export default ProblemStatements;
