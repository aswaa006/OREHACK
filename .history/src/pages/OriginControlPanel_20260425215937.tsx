import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StageSelector from "@/components/StageSelector";

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

/* ─── Stage card (Replaced by StageSelector) ─── */

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

  const stagesForSelector = STAGES.map(s => ({
    ...s,
    id: s.route,
    status: s.status === 'active' ? 'ACTIVE' : 'COMPLETED'
  }));

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", padding: "2.5rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <StageSelector
          stages={stagesForSelector}
          activeStage={null}
          onSelectStage={(route: string) => navigate(route)}
          onBackClick={() => navigate("/orehackproject1924")}
        />
      </div>
    </div>
  );
};

export default OriginControlPanel;
