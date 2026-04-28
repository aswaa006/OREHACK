import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Award, Clock, FileCheck, Send, Star, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { loadNormalizedSubmissions, type NormalizedSubmission } from "@/lib/submission-data";
import {
  clearAdminSession,
  normalizeDashboardRole,
  readLegacyAdminSession,
} from "@/lib/dashboard-routing";

// ─── Design Tokens (matching admin.css premium system) ───────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap');

  .hack-admin-root {
    --bg-primary: #0a0e27;
    --bg-secondary: #1a1f3a;
    --bg-tertiary: #242d4a;
    --accent-cyan: #00d9ff;
    --accent-green: #39ff14;
    --accent-magenta: #ff006e;
    --accent-orange: #ffa500;
    --accent-purple: #b026ff;
    --text-primary: #f5f7fa;
    --text-secondary: #a0aec0;
    --text-tertiary: #718096;
    --border-color: rgba(0,217,255,0.2);
    --border-light: rgba(255,255,255,0.05);
    --font-display: 'Space Grotesk', sans-serif;
    --font-body: 'Inter', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --shadow-glow-cyan: 0 0 24px rgba(0,217,255,0.3);
    --shadow-glow-green: 0 0 24px rgba(57,255,20,0.3);
    --shadow-glow-magenta: 0 0 24px rgba(255,0,110,0.3);
    --transition-base: 300ms cubic-bezier(0.4,0,0.2,1);
    --transition-fast: 150ms cubic-bezier(0.4,0,0.2,1);
    min-height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: var(--font-body);
    position: relative;
    overflow-x: hidden;
  }

  .hack-admin-root *,::-webkit-scrollbar { scrollbar-width: thin; scrollbar-color: var(--accent-cyan) var(--bg-secondary); }
  .hack-admin-root ::-webkit-scrollbar { width: 6px; height: 6px; }
  .hack-admin-root ::-webkit-scrollbar-track { background: var(--bg-secondary); }
  .hack-admin-root ::-webkit-scrollbar-thumb { background: var(--accent-cyan); border-radius: 10px; }

  /* Ambient grid */
  .hack-grid-bg {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(rgba(0,217,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,217,255,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  /* Header */
  .hack-header {
    position: sticky; top: 0; z-index: 50;
    background: rgba(10,14,39,0.75);
    border-bottom: 1px solid var(--border-color);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .hack-header-inner {
    max-width: 1400px; margin: 0 auto;
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 32px;
  }
  .hack-brand {
    display: flex; align-items: center; gap: 12px;
  }
  .hack-brand-dot {
    width: 10px; height: 10px; border-radius: 50%;
    background: var(--accent-green);
    box-shadow: 0 0 12px var(--accent-green);
    animation: pulseDot 2s ease-in-out infinite;
  }
  @keyframes pulseDot {
    0%,100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.6; }
  }
  .hack-brand-title {
    font-family: var(--font-display); font-size: 20px; font-weight: 700;
    color: var(--text-primary); letter-spacing: -0.5px;
  }
  .hack-brand-sub {
    font-size: 11px; font-weight: 600; letter-spacing: 2px;
    text-transform: uppercase;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hack-exit-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 20px;
    background: rgba(0,217,255,0.08);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    color: var(--text-secondary);
    font-size: 13px; font-weight: 600;
    text-decoration: none;
    transition: all var(--transition-fast);
    cursor: pointer;
  }
  .hack-exit-btn:hover {
    color: var(--text-primary);
    border-color: var(--accent-cyan);
    box-shadow: var(--shadow-glow-cyan);
    background: rgba(0,217,255,0.15);
  }

  /* Tabs */
  .hack-tabs {
    display: flex; gap: 4px;
    padding: 6px;
    background: rgba(26,31,58,0.6);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    backdrop-filter: blur(12px);
    margin-bottom: 32px;
    width: fit-content;
  }
  .hack-tab {
    position: relative;
    padding: 9px 22px;
    border-radius: 10px;
    border: none; outline: none;
    background: transparent;
    color: var(--text-tertiary);
    font-family: var(--font-display); font-size: 13px; font-weight: 600;
    cursor: pointer;
    transition: color var(--transition-fast);
    letter-spacing: 0.3px;
  }
  .hack-tab:hover { color: var(--text-primary); }
  .hack-tab.active { color: var(--bg-primary); }
  .hack-tab-bg {
    position: absolute; inset: 0; border-radius: 10px;
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-green));
    box-shadow: var(--shadow-glow-cyan);
    z-index: -1;
  }

  /* Stat cards */
  .hack-stat-card {
    position: relative;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 24px;
    overflow: hidden;
    transition: all var(--transition-base);
    cursor: default;
  }
  .hack-stat-card::before {
    content: ''; position: absolute; inset: 0; border-radius: 18px;
    background: linear-gradient(135deg, rgba(0,217,255,0.06) 0%, transparent 60%);
    opacity: 0; transition: opacity var(--transition-base);
  }
  .hack-stat-card:hover { transform: translateY(-6px); }
  .hack-stat-card:hover::before { opacity: 1; }
  .hack-stat-card.tone-cyan:hover { border-color: var(--accent-cyan); box-shadow: var(--shadow-glow-cyan); }
  .hack-stat-card.tone-green:hover { border-color: var(--accent-green); box-shadow: var(--shadow-glow-green); }
  .hack-stat-card.tone-magenta:hover { border-color: var(--accent-magenta); box-shadow: var(--shadow-glow-magenta); }
  .hack-stat-card.tone-purple:hover { border-color: var(--accent-purple); box-shadow: 0 0 24px rgba(176,38,255,0.3); }

  .hack-stat-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 16px; position: relative; z-index: 1;
  }
  .hack-stat-icon.cyan { background: linear-gradient(135deg, rgba(0,217,255,0.2), rgba(0,217,255,0.06)); border: 1px solid rgba(0,217,255,0.3); color: var(--accent-cyan); }
  .hack-stat-icon.green { background: linear-gradient(135deg, rgba(57,255,20,0.2), rgba(57,255,20,0.06)); border: 1px solid rgba(57,255,20,0.3); color: var(--accent-green); }
  .hack-stat-icon.magenta { background: linear-gradient(135deg, rgba(255,0,110,0.2), rgba(255,0,110,0.06)); border: 1px solid rgba(255,0,110,0.3); color: var(--accent-magenta); }
  .hack-stat-icon.purple { background: linear-gradient(135deg, rgba(176,38,255,0.2), rgba(176,38,255,0.06)); border: 1px solid rgba(176,38,255,0.3); color: var(--accent-purple); }

  .hack-stat-label {
    font-family: var(--font-mono); font-size: 10px; font-weight: 700;
    color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1.5px;
    margin-bottom: 8px; position: relative; z-index: 1;
  }
  .hack-stat-value {
    font-family: var(--font-display); font-size: 40px; font-weight: 900;
    color: var(--text-primary); letter-spacing: -2px; line-height: 1;
    position: relative; z-index: 1; margin-bottom: 6px;
  }
  .hack-stat-delta {
    font-size: 11px; color: var(--text-tertiary); position: relative; z-index: 1;
    margin-bottom: 16px;
  }
  .hack-stat-bar-track {
    height: 4px; background: rgba(255,255,255,0.06); border-radius: 10px;
    overflow: hidden; position: relative; z-index: 1;
  }

  /* Panel cards (chart containers) */
  .hack-panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 18px; padding: 28px;
    transition: border-color var(--transition-base), box-shadow var(--transition-base);
  }
  .hack-panel:hover { border-color: rgba(0,217,255,0.35); box-shadow: 0 0 40px rgba(0,217,255,0.08); }
  .hack-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 24px;
  }
  .hack-panel-title {
    display: flex; align-items: center; gap: 10px;
    font-family: var(--font-display); font-size: 15px; font-weight: 700;
    color: var(--text-primary); letter-spacing: -0.3px;
  }
  .hack-panel-title-icon { color: var(--accent-cyan); }
  .hack-panel-badge {
    padding: 4px 12px; border-radius: 20px;
    background: rgba(0,217,255,0.1); border: 1px solid rgba(0,217,255,0.3);
    font-family: var(--font-mono); font-size: 10px; font-weight: 700;
    color: var(--accent-cyan); text-transform: uppercase; letter-spacing: 1px;
  }
  .hack-panel-badge.green {
    background: rgba(57,255,20,0.1); border-color: rgba(57,255,20,0.3); color: var(--accent-green);
  }

  /* Metric bars in panel */
  .hack-metric-row { margin-bottom: 16px; }
  .hack-metric-row:last-child { margin-bottom: 0; }
  .hack-metric-label-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 6px;
    font-size: 12px; color: var(--text-secondary);
  }
  .hack-metric-pct { font-family: var(--font-mono); color: var(--accent-cyan); font-weight: 700; }
  .hack-metric-track {
    height: 6px; background: rgba(255,255,255,0.06); border-radius: 10px; overflow: hidden;
  }
  .hack-metric-fill {
    height: 100%; border-radius: 10px;
    background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green));
    box-shadow: 0 0 8px rgba(0,217,255,0.4);
  }

  /* Submissions table */
  .hack-table-wrap {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 18px; overflow: hidden;
  }
  .hack-table { width: 100%; border-collapse: collapse; min-width: 680px; }
  .hack-table thead tr {
    background: rgba(0,217,255,0.06);
    border-bottom: 1px solid var(--border-color);
  }
  .hack-table th {
    padding: 14px 20px;
    font-family: var(--font-mono); font-size: 10px; font-weight: 700;
    color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1.5px;
    text-align: left;
  }
  .hack-table th.center { text-align: center; }
  .hack-table th.right { text-align: right; }
  .hack-table tbody tr {
    border-bottom: 1px solid var(--border-light);
    transition: background var(--transition-fast);
    cursor: pointer;
  }
  .hack-table tbody tr:hover { background: rgba(0,217,255,0.04); }
  .hack-table tbody tr:last-child { border-bottom: none; }
  .hack-table td { padding: 16px 20px; font-size: 13px; vertical-align: middle; }

  .hack-rank {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(0,217,255,0.12); border: 1px solid rgba(0,217,255,0.25);
    font-family: var(--font-mono); font-size: 11px; font-weight: 700;
    color: var(--accent-cyan);
  }
  .hack-team-name { font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
  .hack-team-sub { font-size: 11px; color: var(--text-tertiary); }
  .hack-repo { font-family: var(--font-mono); font-size: 11px; color: var(--text-tertiary); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .hack-score { font-family: var(--font-mono); font-weight: 700; color: var(--text-primary); text-align: center; }
  .hack-expand-btn {
    background: none; border: none; cursor: pointer;
    color: var(--accent-cyan); font-size: 10px; padding: 0;
    transition: transform var(--transition-fast);
  }

  .hack-status-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;
    font-family: var(--font-mono);
  }
  .hack-status-badge.evaluated { background: rgba(57,255,20,0.12); border: 1px solid rgba(57,255,20,0.3); color: var(--accent-green); }
  .hack-status-badge.queued { background: rgba(0,217,255,0.12); border: 1px solid rgba(0,217,255,0.3); color: var(--accent-cyan); }
  .hack-status-badge.rejected { background: rgba(255,0,110,0.12); border: 1px solid rgba(255,0,110,0.3); color: var(--accent-magenta); }
  .hack-status-dot {
    width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  }
  .hack-status-badge.evaluated .hack-status-dot { background: var(--accent-green); box-shadow: 0 0 6px var(--accent-green); animation: dotPulse 2s infinite; }
  .hack-status-badge.queued .hack-status-dot { background: var(--accent-cyan); box-shadow: 0 0 6px var(--accent-cyan); animation: dotPulse 2s infinite; }
  .hack-status-badge.rejected .hack-status-dot { background: var(--accent-magenta); }
  @keyframes dotPulse {
    0%,100% { opacity: 1; } 50% { opacity: 0.4; }
  }

  /* Expanded detail row */
  .hack-detail-row td { padding: 0 20px 20px; }
  .hack-detail-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; padding-top: 16px; }
  .hack-detail-card {
    padding: 16px; border-radius: 12px;
    background: rgba(0,217,255,0.04); border: 1px solid rgba(0,217,255,0.15);
  }
  .hack-detail-card-title {
    font-family: var(--font-mono); font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px;
    color: var(--accent-cyan); margin-bottom: 12px;
  }
  .hack-detail-card.innovation .hack-detail-card-title { color: var(--accent-purple); }
  .hack-detail-card.completeness .hack-detail-card-title { color: var(--accent-green); }
  .hack-detail-item {
    display: flex; justify-content: space-between; align-items: center;
    font-size: 11px; color: var(--text-secondary); margin-bottom: 6px;
  }
  .hack-detail-item:last-child { margin-bottom: 0; }
  .hack-detail-item-value { font-weight: 700; color: var(--text-primary); font-family: var(--font-mono); }

  /* Leaderboard / Reports placeholder */
  .hack-placeholder {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 40px; text-align: center;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color); border-radius: 18px;
  }
  .hack-placeholder-icon {
    width: 72px; height: 72px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,217,255,0.1); border: 2px solid rgba(0,217,255,0.25);
    color: var(--accent-cyan); margin-bottom: 20px;
    box-shadow: var(--shadow-glow-cyan);
  }
  .hack-placeholder-text {
    font-size: 14px; color: var(--text-secondary); margin-bottom: 28px; max-width: 400px;
  }
  .hack-cta-link {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 28px; border-radius: 12px;
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-green));
    color: var(--bg-primary); font-family: var(--font-display);
    font-size: 13px; font-weight: 700; text-decoration: none;
    text-transform: uppercase; letter-spacing: 0.5px;
    box-shadow: var(--shadow-glow-cyan);
    transition: all var(--transition-base);
  }
  .hack-cta-link:hover { transform: translateY(-2px); box-shadow: 0 0 40px rgba(0,217,255,0.5); filter: brightness(1.1); }

  /* Tooltip */
  .hack-tooltip {
    background: rgba(26,31,58,0.95); border: 1px solid var(--border-color);
    border-radius: 10px; padding: 10px 14px;
    backdrop-filter: blur(12px); font-size: 12px;
  }
  .hack-tooltip-label { color: var(--text-secondary); margin-bottom: 4px; }
  .hack-tooltip-value { color: var(--accent-cyan); font-family: var(--font-mono); font-weight: 700; }

  /* Loading shimmer */
  .hack-loading-bar {
    height: 2px; width: 100%; overflow: hidden;
    background: rgba(0,217,255,0.1);
    position: fixed; top: 0; left: 0; z-index: 9999;
  }
  .hack-loading-bar::after {
    content: ''; display: block; height: 100%;
    width: 40%; background: linear-gradient(90deg, transparent, var(--accent-cyan), var(--accent-green), transparent);
    animation: loadSweep 1.4s ease-in-out infinite;
  }
  @keyframes loadSweep {
    0% { transform: translateX(-150%); }
    100% { transform: translateX(350%); }
  }

  /* Error banner */
  .hack-error {
    padding: 12px 20px; border-radius: 10px;
    background: rgba(255,0,110,0.1); border: 1px solid rgba(255,0,110,0.3);
    color: var(--accent-magenta); font-size: 13px; margin-bottom: 24px;
  }

  @media (max-width: 768px) {
    .hack-header-inner { padding: 14px 20px; }
    .hack-stat-value { font-size: 30px; }
    .hack-detail-grid { grid-template-columns: 1fr; }
    .hack-tabs { width: 100%; overflow-x: auto; }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

type SubmissionItem = NormalizedSubmission;

const tabs = ["Overview", "Submissions", "Leaderboard", "Reports"] as const;

const submissionTimelineData = [
  { time: "12 PM", count: 5 },
  { time: "1 PM", count: 8 },
  { time: "2 PM", count: 12 },
  { time: "3 PM", count: 15 },
  { time: "4 PM", count: 18 },
  { time: "5 PM", count: 20 },
];

const scoreDistributionData = [
  { range: "90-100", count: 8 },
  { range: "80-90", count: 15 },
  { range: "70-80", count: 12 },
  { range: "60-70", count: 4 },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const HackTooltip = ({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ name: string; value: number }>;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="hack-tooltip">
      <p className="hack-tooltip-label">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="hack-tooltip-value">
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

// Animated stat bar fill using CSS animation via inline style trick
const StatBar = ({ pct, color }: { pct: number; color: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.width = "0%";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.width = `${pct}%`;
      });
    });
  }, [pct]);
  return (
    <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 10, overflow: "hidden" }}>
      <div
        ref={ref}
        style={{
          height: "100%",
          borderRadius: 10,
          background: `linear-gradient(90deg, ${color}, #39ff14)`,
          boxShadow: `0 0 8px ${color}80`,
          transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
};

const MetricBar = ({ label, value, delay }: { label: string; value: number; delay: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timeout = setTimeout(() => {
      el.style.width = `${value}%`;
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return (
    <div className="hack-metric-row">
      <div className="hack-metric-label-row">
        <span>{label}</span>
        <span className="hack-metric-pct">{value}%</span>
      </div>
      <div className="hack-metric-track">
        <div
          ref={ref}
          className="hack-metric-fill"
          style={{ width: 0, transition: "width 1s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const HackathonAdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);

  // Inject premium styles once
  useEffect(() => {
    const styleId = "hack-admin-premium-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = CSS;
      document.head.appendChild(style);
    }
  }, []);

  // Auth + data
  useEffect(() => {
    let mounted = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("id, default_role, is_active")
          .eq("id", user.id)
          .maybeSingle();

        const roleRows = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const resolvedRole = normalizeDashboardRole(roleRows.data?.[0]?.role ?? profile?.default_role);
        const allowed = resolvedRole === "hackathon_admin" || resolvedRole === "developer_admin";

        if (!profile || profile.is_active === false || !allowed) {
          clearAdminSession();
          await supabase.auth.signOut();
          navigate("/admin/auth");
          return false;
        }
        return true;
      }

      const legacySession = readLegacyAdminSession();
      if (!legacySession) { navigate("/admin/auth"); return false; }
      if (legacySession.role !== "unknown" && legacySession.role !== "hackathon_admin" && legacySession.role !== "developer_admin") {
        navigate("/admin/auth"); return false;
      }
      return true;
    };

    const load = async () => {
      setLoading(true); setError("");
      const { data, error: fetchError } = await loadNormalizedSubmissions({ limit: 200 });
      if (!mounted) return;
      if (fetchError) { setError(fetchError || "Failed to load submissions."); setLoading(false); return; }
      setSubmissions(data as SubmissionItem[]);
      setLoading(false);
    };

    const boot = async () => {
      const allowed = await checkAuth();
      if (!allowed || !mounted) return;
      await load();
      channel = supabase
        .channel("hackathon-admin-live")
        .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, load)
        .subscribe();
    };

    void boot();
    return () => {
      mounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Derived stats
  const totalSubmissions = submissions.length;
  const evaluatedSubmissions = submissions.filter((s) => s.status === "evaluated" || s.score !== null).length;
  const queuedSubmissions = submissions.filter((s) => s.status === "queued").length;
  const avgScore = useMemo(() => {
    const scored = submissions.filter((s) => s.score !== null).map((s) => Number(s.score));
    if (!scored.length) return 0;
    return scored.reduce((sum, v) => sum + v, 0) / scored.length;
  }, [submissions]);

  const statCards = [
    {
      label: "Total Submissions",
      value: String(totalSubmissions),
      delta: "Live from database",
      progress: Math.min(100, totalSubmissions ? 20 + totalSubmissions : 8),
      Icon: Send,
      tone: "cyan",
      barColor: "#00d9ff",
    },
    {
      label: "Evaluated",
      value: String(evaluatedSubmissions),
      delta: `${totalSubmissions ? Math.round((evaluatedSubmissions / totalSubmissions) * 100) : 0}% completed`,
      progress: totalSubmissions ? Math.round((evaluatedSubmissions / totalSubmissions) * 100) : 0,
      Icon: FileCheck,
      tone: "green",
      barColor: "#39ff14",
    },
    {
      label: "Queued",
      value: String(queuedSubmissions),
      delta: "Awaiting evaluation",
      progress: totalSubmissions ? Math.round((queuedSubmissions / totalSubmissions) * 100) : 0,
      Icon: Clock,
      tone: "magenta",
      barColor: "#ff006e",
    },
    {
      label: "Avg Score",
      value: avgScore ? avgScore.toFixed(1) : "0.0",
      delta: "From evaluated submissions",
      progress: Math.min(100, Math.round(avgScore)),
      Icon: TrendingUp,
      tone: "purple",
      barColor: "#b026ff",
    },
  ];

  const tableSubmissions = submissions.map((s, i) => ({
    id: s.id,
    team: s.team_name?.trim() || s.team_id,
    repo: s.repository_url,
    time: s.status === "evaluated" ? "Evaluated" : s.status === "rejected" ? "Rejected" : "Queued",
    score: s.final_score ?? s.score ?? 0,
    status: s.status === "evaluated" ? "Evaluated" : s.status === "rejected" ? "Rejected" : "Queued",
    rank: i + 1,
    final_score: s.final_score,
    max_total: (s as any).max_total,
    technical_score: (s as any).technical_score,
    max_technical: (s as any).max_technical,
    technical_breakdown: (s as any).technical_breakdown,
    innovation_score: (s as any).innovation_score,
    max_innovation: (s as any).max_innovation,
    innovation_breakdown: (s as any).innovation_breakdown,
    completeness_score: (s as any).completeness_score,
    max_completeness: (s as any).max_completeness,
    completeness_breakdown: (s as any).completeness_breakdown,
    evaluation_timestamp: (s as any).evaluation_timestamp,
  }));

  return (
    <div className="hack-admin-root">
      {/* Ambient grid */}
      <div className="hack-grid-bg" />

      {/* Loading bar */}
      {loading && <div className="hack-loading-bar" />}

      {/* Ambient glows */}
      <div style={{ position: "fixed", pointerEvents: "none", inset: 0, zIndex: 0, overflow: "hidden" }}>
        <motion.div
          style={{
            position: "absolute", top: -100, left: -100,
            width: 480, height: 480, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,217,255,0.12) 0%, transparent 70%)",
          }}
          animate={{ x: [0, 30, -18, 0], y: [0, 20, -10, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{
            position: "absolute", bottom: -80, right: -80,
            width: 420, height: 420, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(57,255,20,0.1) 0%, transparent 70%)",
          }}
          animate={{ x: [0, -24, 12, 0], y: [0, -20, 10, 0], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      {/* Header */}
      <header className="hack-header">
        <div className="hack-header-inner">
          <motion.div
            className="hack-brand"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="hack-brand-dot" />
            <div>
              <div className="hack-brand-title">Hackathon Admin</div>
              <div className="hack-brand-sub">Origin 2K26 · Control Center</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link to="/" className="hack-exit-btn">
              ← Exit Dashboard
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 32px 60px", position: "relative", zIndex: 1 }}>
        {error && <div className="hack-error">⚠ {error}</div>}

        {/* Tabs */}
        <motion.div
          className="hack-tabs"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`hack-tab${activeTab === tab ? " active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {activeTab === tab && (
                <motion.div layoutId="hack-active-tab" className="hack-tab-bg" transition={{ type: "spring", duration: 0.4 }} />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{tab}</span>
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* ── OVERVIEW ── */}
            {activeTab === "Overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Stat cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20 }}>
                  {statCards.map((card, idx) => (
                    <motion.div
                      key={card.label}
                      className={`hack-stat-card tone-${card.tone}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.07 }}
                    >
                      <div className={`hack-stat-icon ${card.tone}`}>
                        <card.Icon size={20} />
                      </div>
                      <div className="hack-stat-label">{card.label}</div>
                      <div className="hack-stat-value">{card.value}</div>
                      <div className="hack-stat-delta">{card.delta}</div>
                      <StatBar pct={card.progress} color={card.barColor} />
                    </motion.div>
                  ))}
                </div>

                {/* Charts row */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                  {/* Submissions Timeline */}
                  <motion.div
                    className="hack-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.28 }}
                  >
                    <div className="hack-panel-header">
                      <div className="hack-panel-title">
                        <TrendingUp size={16} className="hack-panel-title-icon" />
                        Submissions Timeline
                      </div>
                      <div className="hack-panel-badge">Real-time</div>
                    </div>
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={submissionTimelineData} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                          <defs>
                            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00d9ff" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#39ff14" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="rgba(0,217,255,0.08)" strokeDasharray="3 3" />
                          <XAxis dataKey="time" tick={{ fill: "#718096", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#718096", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                          <Tooltip content={<HackTooltip />} cursor={{ stroke: "rgba(0,217,255,0.3)", strokeWidth: 1 }} />
                          <Area
                            type="monotone"
                            dataKey="count"
                            name="Submissions"
                            stroke="#00d9ff"
                            strokeWidth={2.5}
                            fill="url(#areaFill)"
                            animationDuration={1200}
                            animationBegin={100}
                            animationEasing="ease-out"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Live Decision Metrics */}
                  <motion.div
                    className="hack-panel"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.36 }}
                  >
                    <div className="hack-panel-header">
                      <div className="hack-panel-title">Live Metrics</div>
                      <div className="hack-panel-badge green">Signals</div>
                    </div>
                    <MetricBar label="Evaluation Completion" value={75} delay={400} />
                    <MetricBar label="Queue Drain Speed" value={62} delay={500} />
                    <MetricBar label="Judge Throughput" value={81} delay={600} />
                    <p style={{ marginTop: 20, fontSize: 12, color: "#718096", lineHeight: 1.6 }}>
                      Core operational signals that need quick intervention decisions.
                    </p>
                  </motion.div>
                </div>

                {/* Score Distribution */}
                <motion.div
                  className="hack-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.44 }}
                >
                  <div className="hack-panel-header">
                    <div className="hack-panel-title">Score Distribution</div>
                    <span style={{ fontSize: 12, color: "#718096" }}>Teams grouped by score range</span>
                  </div>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scoreDistributionData} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00d9ff" />
                            <stop offset="100%" stopColor="#39ff14" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(0,217,255,0.08)" strokeDasharray="3 3" />
                        <XAxis dataKey="range" tick={{ fill: "#718096", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#718096", fontSize: 11, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<HackTooltip />} />
                        <Bar
                          dataKey="count"
                          name="Teams"
                          radius={[8, 8, 0, 0]}
                          fill="url(#barFill)"
                          animationDuration={1000}
                          animationBegin={150}
                          animationEasing="ease-out"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            )}

            {/* ── SUBMISSIONS ── */}
            {activeTab === "Submissions" && (
              <div className="hack-table-wrap" style={{ overflowX: "auto" }}>
                <table className="hack-table">
                  <thead>
                    <tr>
                      <th style={{ width: 40 }} />
                      <th>Team</th>
                      <th>Repository</th>
                      <th className="center">Final Score</th>
                      <th className="right" style={{ paddingRight: 24 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={5} style={{ padding: "32px 20px", color: "#718096", fontSize: 13 }}>
                          <div className="hack-loading-bar" style={{ position: "relative", marginBottom: 8 }} />
                          Loading submissions…
                        </td>
                      </tr>
                    )}
                    {!loading && !tableSubmissions.length && (
                      <tr>
                        <td colSpan={5} style={{ padding: "40px 20px", textAlign: "center", color: "#718096", fontSize: 13 }}>
                          No submissions yet.
                        </td>
                      </tr>
                    )}
                    {tableSubmissions.map((sub, idx) => {
                      const isExpanded = expandedSubmissionId === sub.id;
                      const statusClass = sub.status.toLowerCase();
                      return (
                        <React.Fragment key={sub.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            onClick={() => setExpandedSubmissionId(isExpanded ? null : sub.id)}
                          >
                            {/* Expand button */}
                            <td style={{ width: 40, paddingLeft: 16 }}>
                              <motion.button
                                className="hack-expand-btn"
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                ▶
                              </motion.button>
                            </td>

                            {/* Team */}
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span className="hack-rank">#{sub.rank}</span>
                                <div>
                                  <div className="hack-team-name">{sub.team}</div>
                                  <div className="hack-team-sub">{sub.time}</div>
                                </div>
                              </div>
                            </td>

                            {/* Repo */}
                            <td>
                              <div className="hack-repo">{sub.repo}</div>
                            </td>

                            {/* Score */}
                            <td className="hack-score">
                              {sub.final_score ? `${sub.final_score.toFixed(1)} / ${sub.max_total || 100}` : "—"}
                            </td>

                            {/* Status */}
                            <td style={{ textAlign: "right", paddingRight: 20 }}>
                              <span className={`hack-status-badge ${statusClass}`}>
                                <span className="hack-status-dot" />
                                {sub.status}
                              </span>
                            </td>
                          </motion.tr>

                          {/* Detail expansion */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.tr
                                key={`${sub.id}-detail`}
                                className="hack-detail-row"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <td colSpan={5}>
                                  <div className="hack-detail-grid">
                                    {/* Technical */}
                                    <div className="hack-detail-card">
                                      <div className="hack-detail-card-title">
                                        Technical ({sub.technical_score || 0}/{sub.max_technical || 65})
                                      </div>
                                      {sub.technical_breakdown
                                        ? Object.entries(sub.technical_breakdown).map(([k, v]) => (
                                            <div key={k} className="hack-detail-item">
                                              <span style={{ textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
                                              <span className="hack-detail-item-value">{(v as number).toFixed(1)}</span>
                                            </div>
                                          ))
                                        : <span style={{ fontSize: 11, color: "#718096" }}>No breakdown available</span>
                                      }
                                    </div>

                                    {/* Innovation */}
                                    <div className="hack-detail-card innovation">
                                      <div className="hack-detail-card-title">
                                        Innovation ({sub.innovation_score || 0}/{sub.max_innovation || 25})
                                      </div>
                                      {sub.innovation_breakdown
                                        ? Object.entries(sub.innovation_breakdown).map(([k, v]) => (
                                            <div key={k} className="hack-detail-item">
                                              <span style={{ textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
                                              <span className="hack-detail-item-value">{(v as number).toFixed(1)}</span>
                                            </div>
                                          ))
                                        : <span style={{ fontSize: 11, color: "#718096" }}>No breakdown available</span>
                                      }
                                    </div>

                                    {/* Completeness */}
                                    <div className="hack-detail-card completeness">
                                      <div className="hack-detail-card-title">
                                        Completeness ({sub.completeness_score || 0}/{sub.max_completeness || 10})
                                      </div>
                                      {sub.completeness_breakdown
                                        ? Object.entries(sub.completeness_breakdown).map(([k, v]) => (
                                            <div key={k} className="hack-detail-item">
                                              <span style={{ textTransform: "capitalize" }}>{k.replace(/_/g, " ")}</span>
                                              <span className="hack-detail-item-value">{(v as number).toFixed(1)}</span>
                                            </div>
                                          ))
                                        : <span style={{ fontSize: 11, color: "#718096" }}>No breakdown available</span>
                                      }
                                    </div>
                                  </div>

                                  {sub.evaluation_timestamp && (
                                    <p style={{ marginTop: 12, fontSize: 11, color: "#718096" }}>
                                      Evaluated: {new Date(sub.evaluation_timestamp).toLocaleString()}
                                    </p>
                                  )}
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── LEADERBOARD ── */}
            {activeTab === "Leaderboard" && (
              <div className="hack-placeholder">
                <div className="hack-placeholder-icon">
                  <Award size={32} />
                </div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                  Public Leaderboard
                </h2>
                <p className="hack-placeholder-text">
                  Open the public leaderboard with complete team rankings and detailed score breakdowns for all participants.
                </p>
                <Link to="/hackathon/origin-2k26/leaderboard" className="hack-cta-link">
                  <Star size={16} />
                  View Leaderboard
                </Link>
              </div>
            )}

            {/* ── REPORTS ── */}
            {activeTab === "Reports" && (
              <div className="hack-placeholder">
                <div className="hack-placeholder-icon">
                  <TrendingUp size={32} />
                </div>
                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
                  Evaluation Reports
                </h2>
                <p className="hack-placeholder-text">
                  Automated evaluation reports and export controls will appear here after processing finishes.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default HackathonAdminDashboard;
