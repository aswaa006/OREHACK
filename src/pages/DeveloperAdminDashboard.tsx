import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, BarChart3, Calendar, CheckCircle, Clock, FileText, PlusCircle, Rocket, TrendingUp, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";

const tabs = ["System", "Hackathons", "Evaluation", "Logs"] as const;

const evaluationTrendData = [
  { time: "00:00", count: 12, avg: 78 },
  { time: "04:00", count: 19, avg: 81 },
  { time: "08:00", count: 28, avg: 84 },
  { time: "12:00", count: 35, avg: 83 },
  { time: "16:00", count: 42, avg: 87 },
  { time: "20:00", count: 38, avg: 86 },
  { time: "23:59", count: 45, avg: 89 },
];

type HackathonItem = {
  name: string;
  slug: string;
  theme: string;
  startDate: string;
  durationHours: number;
  submissions: number;
  evaluated: number;
  status: "live" | "scheduled";
};

const defaultHackathons: HackathonItem[] = [
  {
    name: "Origin 2K26",
    slug: "origin-2k26",
    theme: "AI + Web + Product",
    startDate: "",
    durationHours: 36,
    submissions: 120,
    evaluated: 95,
    status: "live",
  },
  {
    name: "BuildCore v3",
    slug: "buildcore-v3",
    theme: "Developer Tools",
    startDate: "",
    durationHours: 24,
    submissions: 85,
    evaluated: 72,
    status: "live",
  },
  {
    name: "DevStrike '24",
    slug: "devstrike-24",
    theme: "Open Innovation",
    startDate: "",
    durationHours: 24,
    submissions: 65,
    evaluated: 58,
    status: "live",
  },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const statusData = [
  { name: "Online", value: 3, color: "#18c99b" },
  { name: "Offline", value: 0, color: "#50607f" },
];

const sectionTransition = { duration: 0.4, ease: "easeOut" as const };
const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

type TooltipPayload = {
  value: number;
  name: string;
  color?: string;
};

const ChartTooltip = ({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: TooltipPayload[];
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

const DeveloperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("System");
  const [hackathons, setHackathons] = useState<HackathonItem[]>(defaultHackathons);
  const [userCount, setUserCount] = useState(0);
  const [syncError, setSyncError] = useState("");
  const [newHackathon, setNewHackathon] = useState({
    name: "",
    slug: "",
    theme: "AI + Web + Product",
    startDate: "",
    durationHours: "36",
  });

  const loadDashboardData = useCallback(async () => {
    setSyncError("");

    const [hackathonsRes, usersRes] = await Promise.all([
      supabase
        .from("hackathons")
        .select("name, slug, theme, start_date, duration_hours, status")
        .order("created_at", { ascending: false }),
      supabase.from("users").select("id", { count: "exact", head: true }),
    ]);

    if (hackathonsRes.error) {
      setSyncError(hackathonsRes.error.message || "Failed to sync dashboard data.");
      setHackathons(defaultHackathons);
      return;
    }

    const mappedHackathons: HackathonItem[] = (hackathonsRes.data || []).map((hackathon) => {
      return {
        name: hackathon.name || "Untitled Hackathon",
        slug: hackathon.slug || slugify(hackathon.name || "hackathon"),
        theme: hackathon.theme || "General",
        startDate: hackathon.start_date || "",
        durationHours: Number(hackathon.duration_hours || 24),
        submissions: 0,
        evaluated: 0,
        status: hackathon.status === "scheduled" ? "scheduled" : "live",
      };
    });

    setHackathons(mappedHackathons.length ? mappedHackathons : defaultHackathons);
    setUserCount(usersRes.count || 0);
  }, []);

  useEffect(() => {
    loadDashboardData();

    const channel = supabase
      .channel("developer-admin-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "hackathons" }, loadDashboardData)
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, loadDashboardData)
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, loadDashboardData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDashboardData]);

  const hackathonStatsData = useMemo(
    () => hackathons.slice(0, 6).map((hackathon) => ({
      name: hackathon.name,
      submissions: hackathon.submissions,
      evaluated: hackathon.evaluated,
    })),
    [hackathons],
  );

  const totalSubmissions = useMemo(
    () => hackathons.reduce((sum, hackathon) => sum + hackathon.submissions, 0),
    [hackathons],
  );
  const totalEvaluated = useMemo(
    () => hackathons.reduce((sum, hackathon) => sum + hackathon.evaluated, 0),
    [hackathons],
  );
  const activeHackathons = useMemo(
    () => hackathons.filter((hackathon) => hackathon.status === "live").length,
    [hackathons],
  );

  const systemCards = [
    {
      label: "Active Hackathons",
      value: String(activeHackathons),
      delta: "Origin 2K26 is Live",
      progress: Math.min(100, 55 + activeHackathons * 10),
      icon: BarChart3,
      tone: "from-sky-500/25 via-sky-500/10 to-transparent",
      iconTone: "from-sky-500 to-blue-600",
    },
    {
      label: "Total Submissions",
      value: String(totalSubmissions),
      delta: `${totalEvaluated} already evaluated`,
      progress: totalSubmissions ? Math.min(100, Math.round((totalEvaluated / totalSubmissions) * 100)) : 0,
      icon: FileText,
      tone: "from-violet-500/25 via-violet-500/10 to-transparent",
      iconTone: "from-violet-500 to-fuchsia-600",
    },
    {
      label: "Registered Users",
      value: String(userCount),
      delta: "Live from users database",
      progress: Math.min(100, userCount ? 40 + userCount : 25),
      icon: Activity,
      tone: "from-emerald-500/25 via-emerald-500/10 to-transparent",
      iconTone: "from-emerald-500 to-teal-600",
    },
    {
      label: "Avg Eval Time",
      value: "4.2s",
      delta: "Stable performance",
      progress: 68,
      icon: Clock,
      tone: "from-cyan-500/25 via-cyan-500/10 to-transparent",
      iconTone: "from-cyan-500 to-blue-600",
    },
  ];

  const handleCreateHackathon = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newHackathon.name.trim()) return;

    const slug = slugify(newHackathon.slug || newHackathon.name);
    if (!slug) return;
    if (hackathons.some((item) => item.slug === slug)) return;

    const { error } = await supabase.from("hackathons").insert({
      name: newHackathon.name.trim(),
      slug,
      theme: newHackathon.theme.trim() || "General",
      start_date: newHackathon.startDate || null,
      duration_hours: Number(newHackathon.durationHours || 24),
      status: "live",
      submissions: 0,
      evaluated: 0,
    });

    if (error) {
      setSyncError(error.message || "Unable to create hackathon.");
      return;
    }

    setNewHackathon({
      name: "",
      slug: "",
      theme: "AI + Web + Product",
      startDate: "",
      durationHours: "36",
    });

    await loadDashboardData();
  };

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
              <h1 className="text-xl font-bold text-foreground">
                Developer Admin
                <span className="ml-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">Oregent</span>
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">Full System Control</p>
            </motion.div>
            <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              ← Exit
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-6 py-6">
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
                {activeTab === tab && <motion.span layoutId="active-dev-tab" className="absolute inset-0 rounded-lg bg-primary/15" />}
                <span className="relative">{tab}</span>
              </motion.button>
            ))}
          </div>

          {syncError && <p className="mb-4 text-sm text-destructive">{syncError}</p>}

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
              {activeTab === "System" && (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {systemCards.map((card, idx) => (
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
                          Evaluation Trend
                        </h3>
                        <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">Last 24h</span>
                      </div>

                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={evaluationTrendData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="countArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                              </linearGradient>
                              <linearGradient id="countLine" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="hsl(var(--primary))" />
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke="hsl(var(--primary) / 0.15)" strokeDasharray="3 3" />
                            <XAxis dataKey="time" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--primary) / 0.45)", strokeWidth: 1 }} />
                            <Area
                              type="monotone"
                              dataKey="count"
                              name="Evaluations"
                              stroke="url(#countLine)"
                              fill="url(#countArea)"
                              strokeWidth={2.8}
                              animationDuration={1100}
                              animationEasing="ease-out"
                            />
                            <Line
                              type="monotone"
                              dataKey="avg"
                              name="Avg Score"
                              stroke="#9ca3af"
                              strokeDasharray="6 6"
                              strokeWidth={2}
                              dot={false}
                              animationDuration={1300}
                              animationBegin={140}
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
                      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Activity className="h-4 w-4 text-emerald-400" />
                        Engine Health
                      </h3>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={56}
                              outerRadius={82}
                              paddingAngle={5}
                              animationDuration={900}
                            >
                              {statusData.map((entry) => (
                                <Cell key={entry.name} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-center text-xs text-muted-foreground">3 / 3 nodes online and processing requests.</p>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.35 }}
                    className="surface-elevated rounded-2xl border border-border/70 p-6"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">Submissions by Hackathon</h3>
                      <span className="text-xs text-muted-foreground">Compared with evaluated count</span>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hackathonStatsData} margin={{ top: 6, right: 8, left: -12, bottom: 0 }}>
                          <CartesianGrid stroke="hsl(var(--primary) / 0.12)" strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar dataKey="submissions" name="Submissions" radius={[8, 8, 0, 0]} fill="hsl(var(--primary))" animationDuration={900} />
                          <Bar dataKey="evaluated" name="Evaluated" radius={[8, 8, 0, 0]} fill="#60a5fa" animationDuration={1200} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </>
              )}

              {activeTab === "Hackathons" && (
                <div className="grid gap-5 xl:grid-cols-3">
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    onSubmit={handleCreateHackathon}
                    className="surface-elevated rounded-2xl border border-border/70 p-5 xl:col-span-1"
                  >
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <PlusCircle className="h-4 w-4 text-primary" />
                      Add New Hackathon
                    </h3>
                    <div className="space-y-3">
                      <input
                        value={newHackathon.name}
                        onChange={(event) => setNewHackathon((prev) => ({ ...prev, name: event.target.value }))}
                        placeholder="Hackathon Name"
                        className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
                      />
                      <input
                        value={newHackathon.slug}
                        onChange={(event) => setNewHackathon((prev) => ({ ...prev, slug: event.target.value }))}
                        placeholder="Slug (optional)"
                        className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
                      />
                      <input
                        value={newHackathon.theme}
                        onChange={(event) => setNewHackathon((prev) => ({ ...prev, theme: event.target.value }))}
                        placeholder="Theme"
                        className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="datetime-local"
                          title="Hackathon start date and time"
                          value={newHackathon.startDate}
                          onChange={(event) => setNewHackathon((prev) => ({ ...prev, startDate: event.target.value }))}
                          className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
                        />
                        <input
                          type="number"
                          min={1}
                          title="Hackathon duration in hours"
                          placeholder="Duration"
                          value={newHackathon.durationHours}
                          onChange={(event) => setNewHackathon((prev) => ({ ...prev, durationHours: event.target.value }))}
                          className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
                        />
                      </div>
                      <button
                        type="submit"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        <Rocket className="h-4 w-4" />
                        Create Live Hackathon
                      </button>
                    </div>
                    <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      New hackathons appear instantly in this list.
                    </p>
                  </motion.form>

                  <div className="space-y-4 xl:col-span-2">
                    {hackathons.map((hackathon, idx) => {
                      const progress = hackathon.submissions ? Math.round((hackathon.evaluated / hackathon.submissions) * 100) : 0;
                      return (
                        <motion.div
                          key={hackathon.slug}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          whileHover={{ y: -3 }}
                          className="surface-elevated rounded-2xl border border-border/70 p-5"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-foreground">{hackathon.name}</h3>
                              <p className="text-xs text-muted-foreground">{hackathon.theme}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">
                                {hackathon.status === "live" ? "Live" : "Scheduled"}
                              </span>
                              <Link
                                to={`/hackathon/${hackathon.slug}/login`}
                                className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary transition-colors hover:bg-primary/20"
                              >
                                Open Live
                              </Link>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                            <p>Submissions: {hackathon.submissions}</p>
                            <p>Evaluated: {hackathon.evaluated}</p>
                            <p>Duration: {hackathon.durationHours}h</p>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted/70">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.75, delay: idx * 0.08 + 0.15, ease: "easeOut" }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === "Evaluation" && (
                <div className="grid gap-4 lg:grid-cols-3">
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="surface-elevated rounded-2xl border border-border/70 p-6 lg:col-span-2"
                  >
                    <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Zap className="h-4 w-4 text-primary" />
                      Evaluation Pipeline Throughput
                    </h3>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hackathonStatsData.map((h) => ({ ...h, efficiency: Math.round((h.evaluated / h.submissions) * 100) }))}>
                          <defs>
                            <linearGradient id="effGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.05} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid stroke="hsl(var(--primary) / 0.12)" strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Area dataKey="efficiency" name="Efficiency %" stroke="#22d3ee" fill="url(#effGradient)" strokeWidth={2.5} animationDuration={900} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="surface-elevated space-y-4 rounded-2xl border border-border/70 p-6"
                  >
                    {[{ label: "Evaluations / hour", value: "124", icon: BarChart3 }, { label: "Success rate", value: "99.8%", icon: CheckCircle }].map((item, idx) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 + 0.2 }}
                        className="rounded-xl border border-border/70 bg-card/70 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                          <item.icon className="h-4 w-4 text-primary" />
                        </div>
                        <p className="text-2xl font-semibold text-foreground">{item.value}</p>
                      </motion.div>
                    ))}
                    <button className="w-full rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20">
                      Re-run All Evaluations
                    </button>
                  </motion.div>
                </div>
              )}

              {activeTab === "Logs" && (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="surface-elevated rounded-2xl border border-border/70 p-6">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">System Logs</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { time: "14:23:01", action: "Evaluation completed", details: "NeuralForge -> 94.2", type: "success" },
                      { time: "14:22:58", action: "Repository parsed", details: "github.com/neuralforge/proj", type: "info" },
                      { time: "14:22:45", action: "Submission received", details: "NeuralForge", type: "info" },
                      { time: "14:20:12", action: "Engine health check", details: "OK", type: "success" },
                      { time: "14:15:00", action: "Hackathon status", details: "LIVE", type: "success" },
                    ].map((log, idx) => (
                      <motion.div
                        key={log.time}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3"
                      >
                        <span className={`h-2 w-2 rounded-full ${log.type === "success" ? "bg-emerald-400" : "bg-cyan-400"}`} />
                        <span className="font-mono text-muted-foreground">[{log.time}]</span>
                        <span className="text-foreground">{log.action}</span>
                        <span className="text-muted-foreground">{log.details}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.section>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DeveloperAdminDashboard;
