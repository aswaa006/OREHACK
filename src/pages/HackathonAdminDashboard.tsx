import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

type SubmissionItem = {
  id: string;
  team_id: string;
  team_name: string | null;
  repository_url: string;
  submitted_at: string;
  score: number | null;
  status: "queued" | "evaluated" | "rejected";
  final_score: number | null;
  max_total: number | null;
  technical_score: number | null;
  max_technical: number | null;
  innovation_score: number | null;
  max_innovation: number | null;
  completeness_score: number | null;
  max_completeness: number | null;
  technical_breakdown: Record<string, number> | null;
  innovation_breakdown: Record<string, number> | null;
  completeness_breakdown: Record<string, number> | null;
  evaluation_timestamp: string | null;
};

const normalizeStatus = (value: unknown): SubmissionItem["status"] => {
  if (value === "evaluated" || value === "rejected") return value;
  return "queued";
};

const sectionTransition = { duration: 0.4, ease: "easeOut" as const };
const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const ChartTooltip = ({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: Array<{ name: string; value: number }>;
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-primary/25 bg-card/95 px-3 py-2 shadow-xl backdrop-blur-sm">
      <p className="mb-1 text-xs font-medium text-foreground/80">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs text-foreground/90">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary/80" />
          {entry.name}: <span className="font-semibold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const HackathonAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("submissions")
        .select("*")
        .limit(50);

      if (!mounted) return;

      if (fetchError) {
        setError(fetchError.message || "Failed to load submissions.");
        setLoading(false);
        return;
      }

      const normalized = (data || []).map((row: Record<string, unknown>, index: number) => ({
        id: String(row.teamID ?? row.TeamID ?? row.id ?? index),
        team_id: String(row.teamID ?? row.TeamID ?? row.id ?? ""),
        team_name: (row.Team_Name as string | null) ?? null,
        repository_url: ((row.Repo_URL as string | undefined) || "") as string,
        submitted_at: "",
        score: typeof row.Total_Scores === "number" ? row.Total_Scores : null,
        status: normalizeStatus(row.Progress),
        final_score: typeof row.Total_Scores === "number" ? row.Total_Scores : null,
        max_total: 100,
        technical_score: typeof row.Tech_Scores === "number" ? row.Tech_Scores : null,
        max_technical: 65,
        innovation_score: typeof row.Innov_Scores === "number" ? row.Innov_Scores : null,
        max_innovation: 25,
        completeness_score: typeof row.Completeness_Scores === "number" ? row.Completeness_Scores : null,
        max_completeness: 10,
        technical_breakdown: null,
        innovation_breakdown: null,
        completeness_breakdown: null,
        evaluation_timestamp: null,
      })) as SubmissionItem[];

      setSubmissions(normalized);
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("hackathon-admin-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, load)
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const totalSubmissions = submissions.length;
  const evaluatedSubmissions = submissions.filter((submission) => submission.status === "evaluated" || submission.score !== null).length;
  const queuedSubmissions = submissions.filter((submission) => submission.status === "queued").length;
  const avgScore = useMemo(() => {
    const scored = submissions.filter((submission) => submission.score !== null).map((submission) => Number(submission.score));
    if (!scored.length) return 0;
    return scored.reduce((sum, value) => sum + value, 0) / scored.length;
  }, [submissions]);

  const statCards = [
    {
      label: "Total Submissions",
      value: String(totalSubmissions),
      delta: "Live from database",
      progress: Math.min(100, totalSubmissions ? 20 + totalSubmissions : 8),
      icon: Send,
      tone: "from-sky-500/25 via-sky-500/10 to-transparent",
      iconTone: "from-sky-500 to-blue-600",
    },
    {
      label: "Evaluated",
      value: String(evaluatedSubmissions),
      delta: `${totalSubmissions ? Math.round((evaluatedSubmissions / totalSubmissions) * 100) : 0}% completed`,
      progress: totalSubmissions ? Math.round((evaluatedSubmissions / totalSubmissions) * 100) : 0,
      icon: FileCheck,
      tone: "from-emerald-500/25 via-emerald-500/10 to-transparent",
      iconTone: "from-emerald-500 to-teal-600",
    },
    {
      label: "Queued",
      value: String(queuedSubmissions),
      delta: "Awaiting evaluation",
      progress: totalSubmissions ? Math.round((queuedSubmissions / totalSubmissions) * 100) : 0,
      icon: Clock,
      tone: "from-cyan-500/25 via-cyan-500/10 to-transparent",
      iconTone: "from-cyan-500 to-sky-600",
    },
    {
      label: "Avg Score",
      value: avgScore ? avgScore.toFixed(1) : "0.0",
      delta: "Calculated from evaluated submissions",
      progress: Math.min(100, Math.round(avgScore)),
      icon: TrendingUp,
      tone: "from-violet-500/25 via-violet-500/10 to-transparent",
      iconTone: "from-violet-500 to-fuchsia-600",
    },
  ];

  const tableSubmissions = submissions.map((submission, index) => ({
    id: submission.id,
    team: submission.team_name?.trim() || submission.team_id,
    repo: submission.repository_url,
    time: submission.status === "evaluated" ? "Evaluated" : submission.status === "rejected" ? "Rejected" : "Queued",
    score: submission.final_score ?? submission.score ?? 0,
    status: submission.status === "evaluated" ? "Evaluated" : submission.status === "rejected" ? "Rejected" : "Queued",
    rank: index + 1,
  }));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <motion.div
          className="absolute -top-20 -left-20 h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-cyan-500/20 via-primary/15 to-transparent blur-3xl"
          animate={{ x: [0, 24, -16, 0], y: [0, 16, -8, 0], opacity: [0.22, 0.34, 0.22] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 h-[24rem] w-[24rem] rounded-full bg-gradient-to-tl from-emerald-500/20 via-cyan-500/15 to-transparent blur-3xl"
          animate={{ x: [0, -20, 10, 0], y: [0, -18, 8, 0], opacity: [0.18, 0.28, 0.18] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
        />
      </div>

      <div className="relative z-10">
        <header className="border-b border-border/50 bg-background/40 backdrop-blur-md">
          <div className="container mx-auto flex items-center justify-between px-6 py-5">
            <motion.div initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
              <h1 className="text-xl font-bold text-foreground">Hackathon Admin</h1>
              <p className="mt-1 text-xs text-muted-foreground">Origin 2K26</p>
            </motion.div>
            <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              ← Exit
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-6 py-6">
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <div className="mb-7 flex w-full gap-2 overflow-x-auto rounded-xl border border-border/60 bg-card/40 p-1.5 backdrop-blur-sm">
            {tabs.map((tab, idx) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeTab === tab && <motion.span layoutId="active-hack-tab" className="absolute inset-0 rounded-lg bg-primary/15" />}
                <span className="relative">{tab}</span>
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.section
              key={activeTab}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={sectionTransition}
              className="space-y-6"
            >
              {activeTab === "Overview" && (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((card, idx) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: idx * 0.06 }}
                        whileHover={{ y: -4 }}
                        className={`surface-elevated rounded-2xl border border-border/70 bg-gradient-to-br ${card.tone} p-5 shadow-lg shadow-black/15`}
                      >
                        <div className="mb-4 flex items-start justify-between">
                          <p className="text-xs font-medium text-foreground/80">{card.label}</p>
                          <div className={`rounded-lg bg-gradient-to-br p-2.5 text-white ${card.iconTone}`}>
                            <card.icon className="h-4 w-4" />
                          </div>
                        </div>
                        <p className="text-3xl font-semibold text-foreground">{card.value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{card.delta}</p>
                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted/70">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${card.progress}%` }}
                            transition={{ duration: 0.95, delay: idx * 0.08 + 0.2, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid gap-4 xl:grid-cols-3">
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.35 }}
                      className="surface-elevated col-span-2 rounded-2xl border border-border/70 p-6"
                    >
                      <div className="mb-5 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Submissions Timeline
                        </h3>
                        <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">Real-time</span>
                      </div>

                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={submissionTimelineData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="submissionArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="hsl(var(--primary) / 0.15)" strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--primary) / 0.45)", strokeWidth: 1 }} />
                            <Area
                              type="monotone"
                              dataKey="count"
                              name="Submissions"
                              stroke="#22d3ee"
                              fill="url(#submissionArea)"
                              strokeWidth={2.8}
                              animationDuration={1100}
                              animationBegin={120}
                              animationEasing="ease-out"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.28, duration: 0.35 }}
                      className="surface-elevated rounded-2xl border border-border/70 p-6"
                    >
                      <h3 className="mb-4 text-sm font-semibold text-foreground">Live Decision Metrics</h3>
                      <div className="space-y-4">
                        {[
                          { label: "Evaluation Completion", value: 75 },
                          { label: "Queue Drain Speed", value: 62 },
                          { label: "Judge Throughput", value: 81 },
                        ].map((metric, idx) => (
                          <div key={metric.label}>
                            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                              <span>{metric.label}</span>
                              <span>{metric.value}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted/70">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                transition={{ duration: 0.85, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-5 text-xs text-muted-foreground">These are the core operational signals that need quick intervention decisions.</p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.35 }}
                    className="surface-elevated rounded-2xl border border-border/70 p-6"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Score Distribution</h3>
                      <span className="text-xs text-muted-foreground">Teams grouped by score range</span>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreDistributionData} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                          <CartesianGrid stroke="hsl(var(--primary) / 0.12)" strokeDasharray="3 3" />
                          <XAxis dataKey="range" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="count" name="Teams" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))" animationDuration={1000} animationBegin={140} animationEasing="ease-out" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </>
              )}

              {activeTab === "Submissions" && (
                <div className="surface-elevated overflow-hidden rounded-2xl border border-border/70">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px]">
                      <thead>
                        <tr className="border-b border-border/70 bg-card/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                          <th className="px-5 py-3 w-1">•</th>
                          <th className="px-5 py-3">Team</th>
                          <th className="px-5 py-3">Repository</th>
                          <th className="px-5 py-3 text-center">Final Score</th>
                          <th className="px-5 py-3 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableSubmissions.map((submission, idx) => (
                          <React.Fragment key={submission.id}>
                            <motion.tr
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="border-b border-border/60 bg-background/40 text-sm hover:bg-card/60 cursor-pointer"
                              onClick={() => setExpandedSubmissionId(expandedSubmissionId === submission.id ? null : submission.id)}
                            >
                              <td className="px-5 py-4 text-center">
                                <motion.div
                                  animate={{ rotate: expandedSubmissionId === submission.id ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="text-primary"
                                >
                                  ▶
                                </motion.div>
                              </td>
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">#{submission.rank}</span>
                                  <div>
                                    <p className="font-medium text-foreground">{submission.team}</p>
                                    <p className="text-xs text-muted-foreground">{submission.time}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-xs text-muted-foreground truncate">{submission.repo}</td>
                              <td className="px-5 py-4 text-center font-semibold text-foreground">
                                {submission.final_score ? `${submission.final_score.toFixed(1)} / ${submission.max_total || 100}` : "-"}
                              </td>
                              <td className="px-5 py-4 text-right">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                    submission.status === "Evaluated"
                                      ? "bg-emerald-500/15 text-emerald-400"
                                      : submission.status === "Rejected"
                                        ? "bg-rose-500/15 text-rose-300"
                                        : "bg-cyan-500/15 text-cyan-300"
                                  }`}
                                >
                                  {submission.status}
                                </span>
                              </td>
                            </motion.tr>

                            {expandedSubmissionId === submission.id && (
                              <motion.tr
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-b border-border/60 bg-card/30"
                              >
                                <td colSpan={5} className="px-5 py-4">
                                  <div className="grid gap-4 md:grid-cols-3">
                                    {/* Technical Scores */}
                                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Technical ({submission.technical_score || 0}/{submission.max_technical || 65})</p>
                                      <div className="space-y-2 text-xs">
                                        {submission.technical_breakdown && Object.entries(submission.technical_breakdown).map(([key, value]) => (
                                          <div key={key} className="flex justify-between text-muted-foreground">
                                            <span className="capitalize">{key.replace(/_/g, " ")}</span>
                                            <span className="font-semibold text-foreground">{(value as number).toFixed(1)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Innovation Scores */}
                                    <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent">Innovation ({submission.innovation_score || 0}/{submission.max_innovation || 25})</p>
                                      <div className="space-y-2 text-xs">
                                        {submission.innovation_breakdown && Object.entries(submission.innovation_breakdown).map(([key, value]) => (
                                          <div key={key} className="flex justify-between text-muted-foreground">
                                            <span className="capitalize">{key.replace(/_/g, " ")}</span>
                                            <span className="font-semibold text-foreground">{(value as number).toFixed(1)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Completeness Scores */}
                                    <div className="rounded-lg border border-secondary/20 bg-secondary/5 p-4">
                                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-secondary">Completeness ({submission.completeness_score || 0}/{submission.max_completeness || 10})</p>
                                      <div className="space-y-2 text-xs">
                                        {submission.completeness_breakdown && Object.entries(submission.completeness_breakdown).map(([key, value]) => (
                                          <div key={key} className="flex justify-between text-muted-foreground">
                                            <span className="capitalize">{key.replace(/_/g, " ")}</span>
                                            <span className="font-semibold text-foreground">{(value as number).toFixed(1)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  {submission.evaluation_timestamp && (
                                    <p className="mt-3 text-xs text-muted-foreground">
                                      Evaluated: {new Date(submission.evaluation_timestamp).toLocaleString()}
                                    </p>
                                  )}
                                </td>
                              </motion.tr>
                            )}
                          </React.Fragment>
                        ))}
                        {!loading && !tableSubmissions.length && (
                          <tr>
                            <td className="px-5 py-4 text-sm text-muted-foreground" colSpan={5}>No submissions yet.</td>
                          </tr>
                        )}
                        {loading && (
                          <tr>
                            <td className="px-5 py-4 text-sm text-muted-foreground" colSpan={5}>Loading submissions...</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "Leaderboard" && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="surface-elevated rounded-2xl border border-border/70 p-8 text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Award className="h-6 w-6" />
                  </div>
                  <p className="mb-6 text-sm text-muted-foreground">Open the public leaderboard with complete team rankings and score breakdown.</p>
                  <Link
                    to="/hackathon/origin-2k26/leaderboard"
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                  >
                    <Star className="h-4 w-4" />
                    View Leaderboard
                  </Link>
                </motion.div>
              )}

              {activeTab === "Reports" && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="surface-elevated rounded-2xl border border-border/70 p-8 text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-muted-foreground">Automated evaluation reports and export controls will appear here after processing finishes.</p>
                </motion.div>
              )}
            </motion.section>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default HackathonAdminDashboard;
