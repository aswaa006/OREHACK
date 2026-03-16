import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Zap, BarChart3, FileText, Activity, Clock } from "lucide-react";

const tabs = ["System", "Hackathons", "Evaluation", "Logs"];

// Mock data for charts
const evaluationTrendData = [
  { time: "00:00", count: 12, avg: 78 },
  { time: "04:00", count: 19, avg: 82 },
  { time: "08:00", count: 28, avg: 85 },
  { time: "12:00", count: 35, avg: 84 },
  { time: "16:00", count: 42, avg: 87 },
  { time: "20:00", count: 38, avg: 86 },
  { time: "23:59", count: 45, avg: 88 },
];

const hackathonStatsData = [
  { name: "Origin 2K26", submissions: 120, evaluated: 95 },
  { name: "BuildCore v3", submissions: 85, evaluated: 72 },
  { name: "DevStrike '24", submissions: 65, evaluated: 58 },
];

const statusData = [
  { name: "Online", value: 3, color: "#10b981" },
  { name: "Offline", value: 0, color: "#6b7280" },
];

const DeveloperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("System");

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
              <h1 className="text-lg font-bold text-foreground">
                Developer Admin
                <span className="ml-2 text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Oregent
                </span>
              </h1>
              <p className="text-xs text-muted-foreground">Full System Control</p>
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
                <motion.div layoutId="dev-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
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
          {activeTab === "System" && (
            <div className="space-y-6">
              {/* Animated Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Active Hackathons", value: "3", icon: BarChart3, color: "from-blue-500 to-blue-600" },
                  { label: "Total Submissions", value: "412", icon: FileText, color: "from-purple-500 to-purple-600" },
                  { label: "Engine Status", value: "Online", icon: Activity, color: "from-cyan-500 to-cyan-600" },
                  { label: "Avg Eval Time", value: "4.2s", icon: Clock, color: "from-indigo-500 to-indigo-600" },
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

              {/* Evaluation Trend Chart */}
              <motion.div
                className="surface-elevated rounded-xl p-6 border border-primary/20 shadow-lg shadow-primary/10"
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                whileHover={{ borderColor: "hsl(var(--primary) / 0.4)", shadow: "0 20px 40px rgba(59, 130, 246, 0.15)" }}
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
                    Evaluation Trend
                  </h3>
                  <motion.div 
                    className="px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Last 24h
                  </motion.div>
                </motion.div>
                <motion.div 
                  className="h-64 -mx-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evaluationTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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

              {/* Hackathon Stats Chart */}
              <motion.div
                className="surface-elevated rounded-xl p-6 border border-primary/20 shadow-lg shadow-primary/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h3 className="text-sm font-semibold text-foreground mb-4">Submissions by Hackathon</h3>
                <div className="h-64 -mx-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hackathonStatsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.2)" />
                      <XAxis dataKey="name" stroke="hsl(var(--foreground) / 0.8)" style={{ fontSize: "0.75rem", fill: "hsl(var(--foreground) / 0.9)" }} />
                      <YAxis stroke="hsl(var(--foreground) / 0.8)" style={{ fontSize: "0.75rem", fill: "hsl(var(--foreground) / 0.9)" }}/>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "0.5rem",
                        }}
                        labelStyle={{ color: "var(--foreground)" }}
                      />
                      <Bar dataKey="submissions" fill="hsl(var(--primary))" animationDuration={1000} />
                      <Bar dataKey="evaluated" fill="hsl(var(--primary) / 0.6)" animationDuration={1000} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="surface-elevated rounded-xl p-6 border border-primary/20 shadow-lg shadow-primary/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Quick Actions
                </h3>
                <div className="flex flex-wrap gap-3">
                  {["Re-run All Evaluations", "Override Score", "Manage Hackathons", "Assign Admins"].map((action, idx) => (
                    <motion.div
                      key={action}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
                      className="relative group overflow-hidden"
                    >
                      <motion.button
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative px-4 py-2.5 rounded-lg border border-primary/30 text-sm font-semibold text-primary bg-gradient-to-br from-primary/5 to-transparent hover:from-primary/10 hover:to-primary/5 transition-all duration-300 overflow-hidden"
                      >
                        {/* Animated shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                          animate={{ x: ["-100%", "100%"] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <span className="relative">{action}</span>
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

        {activeTab === "Hackathons" && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {["Origin 2K26", "BuildCore v3", "DevStrike '24"].map((name, idx) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.15, duration: 0.7, ease: "easeOut" }}
                whileHover={{ scale: 1.02, x: 12 }}
                className="group relative surface-elevated rounded-xl p-6 border border-primary/20 overflow-hidden shadow-lg cursor-pointer"
              >
                {/* Animated gradient background on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />

                {/* Animated top border line with smooth animation */}
                <motion.div
                  className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary via-primary/60 to-transparent"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />

                {/* Animated right side accent */}
                <motion.div
                  className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/40 to-transparent"
                  initial={{ scaleY: 0 }}
                  whileHover={{ scaleY: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />

                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Animated status indicator */}
                    <motion.div
                      className="relative flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    >
                      <motion.div
                        className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-primary/25 to-primary/10"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm shadow-lg"
                        animate={{ boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.5)", "0 0 0 8px rgba(59, 130, 246, 0)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {idx + 1}
                      </motion.div>
                    </motion.div>

                    {/* Hackathon info */}
                    <motion.div 
                      className="flex flex-col gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.15 + 0.2 }}
                    >
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                        {name}
                      </h3>
                      <motion.p 
                        className="text-xs text-muted-foreground"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        Active • {85 + idx * 5} Submissions
                      </motion.p>
                    </motion.div>
                  </div>

                  {/* Manage button with enhanced animation */}
                  <motion.button
                    initial={{ opacity: 0.7, scale: 0.95 }}
                    whileHover={{ opacity: 1, scale: 1.08 }}
                    whileTap={{ scale: 0.96 }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-xs font-semibold text-primary hover:border-primary/60 transition-all duration-300 relative overflow-hidden group/btn"
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <span className="relative flex items-center gap-2">
                      Manage
                      <motion.span 
                        animate={{ x: [0, 4, 0] }} 
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      >
                        →
                      </motion.span>
                    </span>
                  </motion.button>
                </div>

                {/* Stats row - appears on hover */}
                <motion.div
                  className="relative mt-5 pt-5 border-t border-primary/10 grid grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {[
                    { label: "Submissions", value: `${85 + idx * 5}` },
                    { label: "Avg Score", value: `${78 + idx * 2}.5` },
                    { label: "Status", value: "Live" },
                  ].map((stat, sidx) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 5 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      transition={{ delay: sidx * 0.08 }}
                      className="text-center"
                    >
                      <motion.p 
                        className="text-xs text-muted-foreground font-medium"
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                      >
                        {stat.label}
                      </motion.p>
                      <motion.p 
                        className="text-sm font-semibold text-primary"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {stat.value}
                      </motion.p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === "Evaluation" && (
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="surface-elevated rounded-xl p-6 border border-primary/20 shadow-lg shadow-primary/10"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.7, ease: "easeOut" }}
              whileHover={{ borderColor: "hsl(var(--primary) / 0.4)" }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Zap className="w-4 h-4 text-primary" />
                  </motion.div>
                  Evaluation Engine
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Override scores, re-run evaluations, and monitor pipeline health from here.
                </p>
              </motion.div>

              <motion.div
                className="h-64 -mx-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hackathonStatsData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary) / 0.2)" />
                    <XAxis dataKey="name" stroke="hsl(var(--foreground) / 0.8)" style={{ fontSize: "0.75rem", fill: "hsl(var(--foreground) / 0.9)" }} />
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
                    <Bar dataKey="evaluated" fill="hsl(var(--primary))" animationDuration={1500} isAnimationActive={true} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {[
                { label: "Evaluations/Hour", value: "124", icon: BarChart3, color: "from-blue-400 to-blue-500" },
                { label: "Success Rate", value: "99.8%", icon: CheckCircle, color: "from-indigo-400 to-indigo-500" },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1, duration: 0.6, ease: "easeOut" }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className={`surface-elevated rounded-xl p-5 border border-primary/20 hover:border-primary/40 group cursor-pointer bg-gradient-to-br ${stat.color}/8`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <motion.p 
                      className="text-xs text-muted-foreground/90 font-medium"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      {stat.label}
                    </motion.p>
                    <motion.div
                      className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}
                      whileHover={{ rotate: 15, scale: 1.15 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <stat.icon className="w-4 h-4" />
                    </motion.div>
                  </div>
                  <motion.p 
                    className="text-2xl font-bold text-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + idx * 0.1 + 0.2 }}
                  >
                    {stat.value}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {activeTab === "Logs" && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="surface-elevated rounded-xl p-6 border border-primary/20 bg-gradient-to-b from-background/50 to-background/25 max-h-96 overflow-y-auto"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <motion.div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <h3 className="text-sm font-semibold text-foreground">System Logs</h3>
              </div>

              <div className="space-y-2 font-mono text-xs">
                {[
                  { time: "14:23:01", action: "Evaluation completed", details: "NeuralForge → 94.2", type: "success" },
                  { time: "14:22:58", action: "Repository parsed", details: "github.com/neuralforge/proj", type: "info" },
                  { time: "14:22:45", action: "Submission received", details: "NeuralForge", type: "info" },
                  { time: "14:20:12", action: "Engine health check", details: "OK", type: "success" },
                  { time: "14:15:00", action: "Hackathon status", details: "LIVE", type: "success" },
                ].map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ x: 5, backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                    className="flex gap-4 p-2 rounded border border-transparent hover:border-primary/20 transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-2 min-w-fit">
                      <motion.div
                        className={`w-2 h-2 rounded-full ${log.type === "success" ? "bg-success" : "bg-primary"}`}
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                      />
                      <span className="text-muted-foreground font-mono text-xs">[{log.time}]</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <span className="text-foreground group-hover:text-primary transition-colors font-medium">{log.action}</span>
                      <span className="text-muted-foreground text-xs">{log.details}</span>
                    </div>
                    <motion.div
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${
                        log.type === "success" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {log.type === "success" ? "✓" : "ℹ"}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Log controls */}
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-xs font-semibold text-primary hover:border-primary/60 transition-all"
              >
                Clear Logs
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-xs font-semibold text-primary hover:border-primary/60 transition-all"
              >
                Export
              </motion.button>
            </motion.div>
          </motion.div>
        )}
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default DeveloperAdminDashboard;
