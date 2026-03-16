import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Award, Clock, CheckCircle, Zap, Star, Send, FileCheck } from "lucide-react";

const tabs = ["Overview", "Submissions", "Leaderboard", "Reports"];

const mockSubmissions = [
  { team: "NeuralForge", repo: "github.com/neuralforge/proj", time: "14:23", score: 94.2, status: "Evaluated", rank: 1 },
  { team: "ByteStorm", repo: "github.com/bytestorm/hack", time: "14:45", score: 91.8, status: "Evaluated", rank: 2 },
  { team: "CodeVault", repo: "github.com/codevault/app", time: "15:02", score: 88.5, status: "Evaluated", rank: 3 },
  { team: "QuantumLeap", repo: "github.com/qleap/sub", time: "15:30", score: 92.1, status: "Evaluated", rank: 4 },
];

// Enhanced mock data for charts
const scoreDistributionData = [
  { range: "90-100", count: 8, fill: "#10b981" },
  { range: "80-90", count: 15, fill: "#3b82f6" },
  { range: "70-80", count: 12, fill: "#f59e0b" },
  { range: "60-70", count: 4, fill: "#ef4444" },
];

const submissionTimelineData = [
  { time: "12 PM", count: 5 },
  { time: "1 PM", count: 8 },
  { time: "2 PM", count: 12 },
  { time: "3 PM", count: 15 },
  { time: "4 PM", count: 18 },
  { time: "5 PM", count: 20 },
];

const statusPieData = [
  { name: "Evaluated", value: 128, color: "#10b981" },
];

const HackathonAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated 4-Color Gradient Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500 via-purple-600 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 50, -50, 0],
            y: [0, 50, 0, 50],
            scale: [1, 1.1, 1, 1.05],
            opacity: [0.3, 0.4, 0.3, 0.35],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl"
          animate={{
            x: [-50, 50, 0, 50],
            y: [0, -50, 50, 0],
            scale: [1, 1.05, 1.1, 1],
            opacity: [0.25, 0.35, 0.3, 0.28],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-tr from-indigo-600 via-purple-500 to-transparent rounded-full blur-3xl"
          animate={{
            x: [50, -50, 50, 0],
            y: [50, 0, -50, 50],
            scale: [1.05, 1, 1.1, 1],
            opacity: [0.3, 0.25, 0.35, 0.3],
          }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-teal-500 via-cyan-600 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -50, 50, -50],
            y: [-50, 50, 0, 50],
            scale: [1, 1.08, 1, 1.1],
            opacity: [0.28, 0.32, 0.3, 0.33],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10">
        <div className="border-b border-border/30 backdrop-blur-md bg-gradient-to-r from-background/60 to-background/40 shadow-lg">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-lg font-bold text-foreground">Hackathon Admin</h1>
              <p className="text-xs text-muted-foreground">Origin 2K26</p>
            </motion.div>
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Exit
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-6 py-6">
        <div className="flex gap-1 mb-8 border-b border-border overflow-x-auto">
          {tabs.map((tab, idx) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -2 }}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
                activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </motion.button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "Overview" && (
            <div className="space-y-6">
              {/* Main Stats Grid with Animations */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Submissions", value: "128", icon: Send, color: "from-blue-500 to-blue-600" },
                  { label: "Evaluated", value: "96", icon: FileCheck, color: "from-cyan-500 to-cyan-600" },
                  { label: "Queued", value: "32", icon: Clock, color: "from-indigo-500 to-indigo-600" },
                  { label: "Avg Score", value: "78.4", icon: TrendingUp, color: "from-purple-500 to-purple-600" },
                ].map((s, idx) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: idx * 0.12, duration: 0.6, ease: "easeOut" }}
                    whileHover={{ y: -8, scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className={`surface-elevated rounded-xl p-5 border border-primary/20 hover:border-primary/40 transition-all group cursor-pointer bg-gradient-to-br ${s.color}/8`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <motion.p 
                        className="text-xs text-foreground/80 font-medium tracking-wide"
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {s.label}
                      </motion.p>
                      <motion.div
                        className={`p-2.5 rounded-lg bg-gradient-to-br ${s.color} text-white shadow-lg`}
                        whileHover={{ rotate: 20, scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <s.icon className="w-5 h-5" />
                      </motion.div>
                    </div>
                    <motion.p 
                      className="text-3xl font-bold text-white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.12 + 0.2, duration: 0.6 }}
                    >
                      {s.value}
                    </motion.p>
                    {/* Animated progress bar */}
                    <div className="h-2 bg-muted rounded-full mt-4 overflow-hidden relative">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${s.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: "85%" }}
                        transition={{ delay: idx * 0.12 + 0.4, duration: 1.2, ease: "easeOut" }}
                      />
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${s.color} opacity-40 blur`}
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Submissions Timeline Chart */}
              <motion.div
                className="surface-elevated rounded-xl p-6 border border-primary/20 shadow-lg shadow-primary/10"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                whileHover={{ borderColor: "hsl(var(--primary) / 0.4)" }}
              >
                <motion.div
                  className="flex items-center justify-between mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </motion.div>
                    Submissions Timeline
                  </h3>
                  <motion.div 
                    className="px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Real-time
                  </motion.div>
                </motion.div>
                <motion.div 
                  className="h-64 -mx-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={submissionTimelineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.2)" />
                    <XAxis dataKey="time" stroke="hsl(var(--foreground) / 0.8)" style={{ fontSize: "0.75rem", fill: "hsl(var(--foreground) / 0.9)" }} />
                    <YAxis stroke="hsl(var(--foreground) / 0.8)" style={{ fontSize: "0.75rem", fill: "hsl(var(--foreground) / 0.9)" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "2px solid hsl(var(--primary))",
                          borderRadius: "0.75rem",
                          boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                        }}
                        labelStyle={{ color: "var(--foreground)" }}
                        cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", r: 6, strokeWidth: 2, stroke: "var(--background)" }}
                        activeDot={{ r: 8, strokeWidth: 3 }}
                        animationDuration={1500}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </motion.div>

              {/* Score Distribution & Status Charts */}
              <div className="grid md:grid-cols-2 gap-4">
                <motion.div
                  className="surface-elevated rounded-xl p-6 border border-primary/20 shadow-lg shadow-primary/10"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
                  whileHover={{ borderColor: "hsl(var(--primary) / 0.4)" }}
                >
                  <motion.h3 
                    className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Award className="w-4 h-4 text-primary" />
                    Score Distribution
                  </motion.h3>
                  <motion.div 
                    className="h-64 -mx-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scoreDistributionData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.2)" />
                      <XAxis dataKey="range" stroke="hsl(var(--foreground) / 0.8)" style={{ fontSize: "0.75rem", fill: "hsl(var(--foreground) / 0.9)" }} />
                      <YAxis stroke="hsl(var(--foreground) / 0.8)" style={{ fontSize: "0.75rem", fill: "hsl(var(--foreground) / 0.9)" }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "2px solid hsl(var(--primary))",
                            borderRadius: "0.75rem",
                            boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                          }}
                          labelStyle={{ color: "var(--foreground)" }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" animationDuration={1500} isAnimationActive={true} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="surface-elevated rounded-xl p-6 border border-primary/20 shadow-lg shadow-primary/10"
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
                  whileHover={{ borderColor: "hsl(var(--primary) / 0.4)" }}
                >
                  <motion.h3 
                    className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <CheckCircle className="w-4 h-4 text-primary" />
                    Submission Status
                  </motion.h3>
                  <motion.div 
                    className="h-64 -mx-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <Pie
                          data={statusPieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          animationDuration={1200}
                          isAnimationActive={true}
                        >
                          {statusPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "2px solid hsl(var(--primary))",
                            borderRadius: "0.75rem",
                            boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                          }}
                          labelStyle={{ color: "var(--foreground)" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          )}

        {activeTab === "Submissions" && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Enhanced Table Container */}
            <motion.div
              className="surface-elevated rounded-xl overflow-hidden border border-primary/20 shadow-lg"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Animated table header background */}
              <div className="relative overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-b border-primary/20">
                      {/* Animated gradient line under header */}
                      <motion.div
                        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ delay: 0.3, duration: 1 }}
                      />
                      <th className="text-left text-xs font-semibold text-primary px-6 py-4 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4" />
                          Team
                        </div>
                      </th>
                      <th className="text-left text-xs font-semibold text-primary px-6 py-4 uppercase tracking-wider">Repository</th>
                      <th className="text-center text-xs font-semibold text-primary px-6 py-4 uppercase tracking-wider">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="w-4 h-4" />
                          Score
                        </div>
                      </th>
                      <th className="text-right text-xs font-semibold text-primary px-6 py-4 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {mockSubmissions.map((s, idx) => (
                      <motion.tr
                        key={s.team}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.6, ease: "easeOut" }}
                        whileHover={{ scale: 1.01 }}
                        className="group relative bg-background/50 hover:bg-gradient-to-r hover:from-primary/5 hover:via-primary/10 hover:to-primary/5 transition-all duration-300"
                      >
                        {/* Animated left border accent */}
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent"
                          initial={{ scaleY: 0 }}
                          whileHover={{ scaleY: 1 }}
                          transition={{ duration: 0.3 }}
                        />

                        {/* Rank/Position */}
                        <td className="px-6 py-4">
                          <motion.div
                            className="flex items-center gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.1 + 0.2 }}
                          >
                            {s.rank && (
                              <motion.div
                                className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-xs font-bold"
                                whileHover={{ scale: 1.2, rotate: 360 }}
                                transition={{ duration: 0.5 }}
                              >
                                #{s.rank}
                              </motion.div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {s.team}
                              </span>
                              <span className="text-xs text-muted-foreground">{s.time}</span>
                            </div>
                          </motion.div>
                        </td>

                        {/* Repository */}
                        <td className="px-6 py-4">
                          <motion.div
                            className="flex items-center gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.1 + 0.25 }}
                          >
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary/60" />
                            <code className="text-xs text-muted-foreground group-hover:text-primary/80 transition-colors font-mono bg-background/50 px-2 py-1 rounded">
                              {s.repo}
                            </code>
                          </motion.div>
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4 text-center">
                          {s.score ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1 + 0.3, type: "spring" }}
                              className="relative inline-block"
                            >
                              {/* Animated score background */}
                              <motion.div
                                className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              />
                              <div className="relative flex flex-col items-center">
                                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary">
                                  {s.score}
                                </span>
                                <span className="text-xs text-muted-foreground">/100</span>
                              </div>
                            </motion.div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4 text-right">
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 + 0.35, type: "spring" }}
                            whileHover={{ scale: 1.05 }}
                          >
                            {s.status === "Evaluated" ? (
                              <motion.div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-success/10 via-success/15 to-success/10 border border-success/30 cursor-pointer"
                                whileHover={{
                                  borderColor: "hsl(var(--success))",
                                  boxShadow: "0 0 12px rgba(16, 185, 129, 0.3)",
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <motion.div
                                  className="w-2 h-2 rounded-full bg-success"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                                <span className="text-xs font-semibold text-success">Evaluated</span>
                              </motion.div>
                            ) : (
                              <motion.div
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 border border-primary/30 cursor-pointer"
                                whileHover={{
                                  borderColor: "hsl(var(--primary))",
                                  boxShadow: "0 0 12px rgba(59, 130, 246, 0.3)",
                                }}
                                transition={{ duration: 0.3 }}
                              >
                                <motion.div
                                  className="w-2 h-2 rounded-full bg-primary"
                                  animate={{ pulse: [1, 1.2, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                />
                                <span className="text-xs font-semibold text-primary">Queued</span>
                              </motion.div>
                            )}
                          </motion.div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Summary stats bar */}
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {[
                { label: "Total Submissions", value: mockSubmissions.length, color: "from-blue-500 to-blue-600" },
                { label: "All Evaluated", value: mockSubmissions.filter(s => s.status === "Evaluated").length, color: "from-cyan-500 to-cyan-600" },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`surface-elevated rounded-xl p-4 border border-primary/10 bg-gradient-to-br ${stat.color}/10 cursor-pointer`}
                >
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <motion.p
                    className={`text-2xl font-bold mt-2 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + idx * 0.1 + 0.2 }}
                  >
                    {stat.value}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {activeTab === "Leaderboard" && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="surface-elevated rounded-xl p-6 border border-primary/20 shadow-lg shadow-primary/10 text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-sm text-muted-foreground mb-4">View the detailed leaderboard:</p>
              <Link
                to="/hackathon/origin-2k26/leaderboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-accent transition-all group"
              >
                <span>View Leaderboard</span>
                <motion.span group-hover={{ x: 5 }} className="group-hover:translate-x-1 transition-transform">→</motion.span>
              </Link>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "Reports" && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="surface-elevated rounded-xl p-8 border border-primary/10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Evaluation reports will be generated and displayed here after processing completes.
              </p>
              <motion.div
                className="mt-6 flex justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ delay: i * 0.2, repeat: Infinity, duration: 1.5 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default HackathonAdminDashboard;
