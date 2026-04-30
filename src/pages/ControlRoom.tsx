import React, { useCallback, useState, useMemo } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEventState } from "@/hooks/useEventState";
import { useControlState } from "@/hooks/useControlState";
import PageTransition from "@/components/PageTransition";
import ProblemCard from "@/components/ProblemCard";
import ProblemDrawer from "@/components/ProblemDrawer";
import PhaseBanner from "@/components/PhaseBanner";
import TimerBar from "@/components/TimerBar";
import SelectionResultPanel from "@/components/SelectionResultPanel";
import "@/styles/animations.css";

// ─── Scan-line overlay ────────────────────────────────────────────────────────
const ScanLines: React.FC = () => (
  <div
    style={{
      pointerEvents: "none",
      position: "fixed",
      inset: 0,
      zIndex: 1,
      backgroundImage:
        "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.009) 2px,rgba(255,255,255,0.009) 4px)",
    }}
  />
);

// ─── Floating particles ───────────────────────────────────────────────────────
const Particles: React.FC = () => (
  <div className="ore-particles">
    {Array.from({ length: 10 }, (_, i) => (
      <div key={i} className={`ore-particle ore-particle--${i + 1}`} />
    ))}
  </div>
);

// ─── Loading skeleton ─────────────────────────────────────────────────────────
const CardSkeleton: React.FC<{ n: number }> = ({ n }) => (
  <>
    {Array.from({ length: n }).map((_, i) => (
      <div
        key={i}
        style={{
          borderRadius: 18,
          background: "rgba(15,12,28,0.62)",
          border: "1px solid rgba(255,255,255,0.06)",
          padding: "1.4rem 1.6rem",
          height: 200,
          animation: "pulseText 1.6s ease-in-out infinite",
        }}
      />
    ))}
  </>
);

// ─── Top bar ──────────────────────────────────────────────────────────────────
const TopBar: React.FC<{
  teamName: string;
  phase: string;
  connectionStatus: "live" | "loading" | "error";
}> = ({ teamName, phase, connectionStatus }) => (
  <motion.div
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-8 sm:px-12 backdrop-blur-md"
    style={{
      background: "rgba(5,5,5,0.7)",
      borderBottom: "1px solid rgba(255,255,255,0.03)",
      height: "64px",
    }}
  >
    {/* Logo — matches EventLanding & WaitingRoom style */}
    <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.875rem",
          fontWeight: 700,
          letterSpacing: "0.2em",
          color: "#ffffff",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        OREHACK<span style={{ color: "#a855f7" }}>++</span>
      </span>

      {/* Centre label embedded beside logo for clean look */}
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.65rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.25)",
          paddingLeft: "2rem",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        Control Room — Stage 2
      </span>
    </div>

    {/* Right-hand pills */}
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      {teamName && (
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: "0.65rem",
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.38)",
          lineHeight: 1,
        }}>
          TEAM{" "}
          <span style={{ color: "rgba(255,255,255,0.88)", fontWeight: 700 }}>{teamName.toUpperCase()}</span>
        </span>
      )}

      {/* Connection status dot inline */}
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 7,
        padding: "5px 14px", borderRadius: 999,
        border: "1px solid rgba(168,85,247,0.35)",
        background: "rgba(168,85,247,0.08)",
        fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase",
        color: "rgba(216,180,254,0.9)",
        fontFamily: "'JetBrains Mono', monospace",
        lineHeight: 1,
      }}>
        <motion.div
          style={{ 
            width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
            background: connectionStatus === "live" ? "#4ade80" : connectionStatus === "error" ? "#fb7185" : "#a855f7"
          }}
          animate={{
            boxShadow: connectionStatus === "live"
              ? ["0 0 4px rgba(74,222,128,0.4)", "0 0 12px rgba(74,222,128,0.9)", "0 0 4px rgba(74,222,128,0.4)"]
              : connectionStatus === "error"
              ? ["0 0 4px rgba(251,113,133,0.4)", "0 0 12px rgba(251,113,133,0.9)", "0 0 4px rgba(251,113,133,0.4)"]
              : ["0 0 4px rgba(168,85,247,0.4)", "0 0 12px rgba(168,85,247,0.9)", "0 0 4px rgba(168,85,247,0.4)"],
            scale: [1, 1.35, 1],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
        {phase}
      </span>
    </div>
  </motion.div>
);

// ─── Error banner ─────────────────────────────────────────────────────────────
const ErrorBanner: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      padding: "0.85rem 1.2rem",
      borderRadius: 12,
      background: "rgba(251,113,133,0.08)",
      border: "1px solid rgba(251,113,133,0.25)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      marginBottom: "1.5rem",
    }}
  >
    <span style={{ fontSize: "0.82rem", color: "rgba(251,113,133,0.85)" }}>
      ⚠ {message}
    </span>
    <button
      onClick={onRetry}
      style={{
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "rgba(251,113,133,0.8)",
        background: "rgba(251,113,133,0.1)",
        border: "1px solid rgba(251,113,133,0.25)",
        borderRadius: 8,
        padding: "0.3rem 0.75rem",
        cursor: "pointer",
        flexShrink: 0,
      }}
    >
      Retry
    </button>
  </motion.div>
);

// ─── Main page ────────────────────────────────────────────────────────────────
const ControlRoom: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { isAuthenticated, hasAcceptedRules, teamId, teamName, stage1Active, waitingRoomEnabled } = useEventState();
  const baseEvent = eventId ?? "origin-2k26";
  const navigate = useNavigate();

  // Redirect back to waiting room if event is stopped
  React.useEffect(() => {
    // Disabled for UI/UX testing
    // if (!stage1Active && waitingRoomEnabled) {
    //   navigate(`/event/${baseEvent}/waiting-room`, { replace: true });
    // }
  }, [stage1Active, waitingRoomEnabled, navigate, baseEvent]);

  // ⚠️ Hardcoded states for UI/UX testing
  const phase = "VIEW"; // change to "SELECT" to test active problem
  const currentProblemId = "PS-01";
  const phaseEndTime = null;
  const problems = [
    { id: "PS-01", title: "Intelligent Resource Allocation", description: "Design a system that dynamically allocates compute resources across distributed cloud clusters. The system must monitor real-time utilization metrics such as CPU, memory, and network bandwidth, predicting usage spikes using machine learning models to pre-provision resources before bottlenecks occur.", slots: 5, slots_taken: 5, domain: "AI/ML" },
    { id: "PS-02", title: "Real-Time Fraud Detection Pipeline", description: "Build a streaming fraud detection engine that processes millions of transactions per second. You will need to implement a low-latency graph database backend combined with Kafka event streaming to flag anomalous behavior and block suspicious transactions with sub-millisecond latency.", slots: 5, slots_taken: 2, domain: "FinTech" },
    { id: "PS-03", title: "Diagnostic Image Analysis", description: "Create a model that classifies medical imaging data such as X-rays and MRIs with high precision. Your solution should account for low-contrast anomalies, provide a heat-map of suspected pathological regions, and integrate seamlessly with existing hospital RIS/PACS environments via standard DICOM protocols.", slots: 5, slots_taken: 5, domain: "HealthTech" },
    { id: "PS-04", title: "Carbon Footprint Tracker", description: "Develop a platform that aggregates real-time emissions data from global supply chains. It must ingest IoT sensor data, correlate it with public environmental datasets, and provide actionable decarbonization insights to enterprise users via an intuitive, real-time dashboard.", slots: 5, slots_taken: 0, domain: "Sustainability" },
    { id: "PS-05", title: "Automated Code Review Assistant", description: "Build an LLM-powered assistant that reviews pull requests for security vulnerabilities, performance bottlenecks, and style violations. The tool should be capable of providing inline fix suggestions and learning from repository-specific conventions over time without requiring explicit rule configuration.", slots: 5, slots_taken: 3, domain: "DevTools" },
    { id: "PS-06", title: "Adaptive Learning Path Engine", description: "Design a personalised curriculum engine that analyses learner interactions, quiz performance, and attention metrics to dynamically adjust course difficulty. The system should generate tailored practice modules and recommend supplemental resources tailored to individual cognitive learning styles.", slots: 5, slots_taken: 1, domain: "EdTech" },
    { id: "PS-07", title: "Zero-Day Exploit Predictor", description: "Build a threat-intelligence system that ingests CVE feeds, dark web chatter, and open-source intelligence to predict emerging zero-day vulnerabilities. The platform must output a probability matrix for potential attack vectors across widely-used open-source libraries and frameworks.", slots: 5, slots_taken: 4, domain: "Cybersecurity" },
    { id: "PS-08", title: "Dynamic Traffic Flow Optimiser", description: "Create an adaptive signal-control system using real-time video feeds from intersection cameras. Using edge AI processing, the system should dynamically alter traffic light phases to prioritize emergency vehicles and reduce overall congestion in high-density urban corridors.", slots: 5, slots_taken: 2, domain: "Smart Cities" },
    { id: "PS-09", title: "Crop Yield Prediction via Satellite", description: "Develop a pipeline that fuses multispectral satellite imagery with localized weather data to predict seasonal crop yields. Your model must account for soil moisture variations, detect early signs of blight, and provide micro-insurance companies with precise risk assessments.", slots: 5, slots_taken: 0, domain: "AgriTech" },
    { id: "PS-10", title: "Your Own Problem Statement", description: "Teams may propose a novel societal or technical challenge. You must submit a comprehensive proposal outlining the problem's significance, your proposed architectural solution, the tech stack you intend to use, and the potential impact of a successful implementation.", slots: 99, slots_taken: 10, domain: "Open Innovation" }
  ];
  const selections: any[] = [];
  const loading = false;
  const error = null;
  const selectProblem = async () => { return { success: true }; };
  const hasSelected = false;
  const allocationComplete = false;
  const refresh = () => {};

  // When the full allocation cycle finishes, save problems & navigate to overview
  React.useEffect(() => {
    if (allocationComplete && problems.length > 0) {
      try {
        sessionStorage.setItem("orehack_problems_snapshot", JSON.stringify(problems));
      } catch { /* ignore */ }
      navigate(`/event/${baseEvent}/overview`, { replace: true });
    }
  }, [allocationComplete, problems, navigate, baseEvent]);

  const activeProblem = useMemo(() => problems.find(p => p.id === currentProblemId), [problems, currentProblemId]);

  const handleSelect = useCallback(
    async (problemId: string) => {
      await selectProblem(teamId, problemId);
    },
    [selectProblem, teamId]
  );

  const connectionStatus = error ? "error" : loading ? "loading" : "live";

  /* ── State ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState("All");
  const [expandedProblemId, setExpandedProblemId] = useState<string | null>(null);

  const domains = useMemo(() => {
    const uniqueDomains = Array.from(new Set(problems.map(p => p.domain).filter(Boolean)));
    return ["All", ...uniqueDomains];
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDomain = activeDomain === "All" || p.domain === activeDomain;
      return matchesSearch && matchesDomain;
    });
  }, [problems, searchQuery, activeDomain]);

  /* ── Route Guards (after all hooks) ── */
  if (!isAuthenticated) return <Navigate to={`/event/${baseEvent}/login`} replace />;
  if (!hasAcceptedRules) return <Navigate to={`/event/${baseEvent}/rules`} replace />;

  return (
    <PageTransition>
      <div
        className="relative min-h-screen overflow-hidden text-white flex flex-col"
        style={{ fontFamily: "'Outfit', sans-serif", background: "linear-gradient(160deg, #0a0a0a 0%, #141414 40%, #1a1a1a 70%, #0d0d0d 100%)", overflowX: "hidden" }}
      >
        {/* Professional Ambient Purple Glows (matching WaitingRoom) */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <motion.div
            animate={{ opacity: [0.15, 0.25, 0.15], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[20%] -left-[10%] h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[150px]"
          />
          <motion.div
            animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-[40%] -right-[10%] h-[500px] w-[500px] rounded-full bg-purple-900/20 blur-[150px]"
          />
        </div>

        {/* ── Top nav ── */}
        <TopBar teamName={teamName} phase={phase} connectionStatus={connectionStatus} />

        {/* ── Main content ── */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: 1080,
            margin: "0 auto",
            padding: "6rem 1.5rem 5rem",
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Page heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{ marginBottom: "2rem" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                    color: "rgba(196,181,253,0.55)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Stage 2
                </p>
                <h1
                  style={{
                    fontSize: "clamp(1.6rem,3.5vw,2.4rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    color: "#ffffff",
                    lineHeight: 1.2,
                  }}
                >
                  PROBLEM STATEMENT ALLOCATION
                </h1>
              </div>

              {/* Problem count */}
              {!loading && problems.length > 0 && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.72rem",
                    color: "rgba(255,255,255,0.28)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {problems.length} problem{problems.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </motion.div>

          {/* Filtering & Search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginBottom: "2.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Search Input */}
            <div style={{ position: "relative", maxWidth: "100%" }}>
              <input
                type="text"
                placeholder="Search by ID, Title, or Keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.85rem 1rem 0.85rem 2.8rem",
                  borderRadius: 12,
                  background: "rgba(15,12,28,0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#f1f5f9",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(168,85,247,0.5)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(168,85,247,0.15)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)";
                  e.target.style.boxShadow = "none";
                }}
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            {/* Category Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
              {domains.map(domain => (
                <button
                  key={domain}
                  onClick={() => setActiveDomain(domain as string)}
                  style={{
                    padding: "0.4rem 1rem",
                    borderRadius: 999,
                    border: activeDomain === domain ? "1px solid rgba(168,85,247,0.5)" : "1px solid rgba(255,255,255,0.08)",
                    background: activeDomain === domain ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.03)",
                    color: activeDomain === domain ? "#f3e8ff" : "rgba(255,255,255,0.5)",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "'Inter', sans-serif"
                  }}
                  onMouseEnter={(e) => {
                    if (activeDomain !== domain) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeDomain !== domain) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    }
                  }}
                >
                  {domain}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Phase banner & Timer bar — only shown when event is actively running */}
          {stage1Active && (
            <>
              <PhaseBanner phase={phase} />
              <TimerBar phaseEndTime={phaseEndTime} phase={phase} />
            </>
          )}

          {/* Error banner */}
          {error && <ErrorBanner message={error} onRetry={refresh} />}

          {/* Result panel — shown during RESULT phase */}
          {phase === "RESULT" && (
            <SelectionResultPanel
              selections={selections}
              problems={problems}
              visible={true}
            />
          )}

          {/* Problem presentation */}
          {false ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "6rem 2rem", background: "rgba(15,12,28,0.5)", borderRadius: 24, border: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>📡</div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", marginBottom: "0.75rem" }}>Event Standby</h2>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.95rem", maxWidth: 440, margin: "0 auto", lineHeight: 1.6 }}>
                The problem statement release cycle is currently paused. 
                Please wait for the organizers to signal the start of the next phase.
              </p>
            </motion.div>
          ) : loading ? (
            <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.25rem", alignItems: "start" }}>
              <CardSkeleton n={4} />
            </motion.div>
          ) : problems.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "4rem 1.5rem", color: "rgba(255,255,255,0.3)", fontSize: "0.9rem" }}>
              No problem statements found. The organizers will publish them shortly.
            </motion.div>
          ) : phase === "VIEW" || phase === "RESULT" ? (
            <motion.div layout style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.25rem", alignItems: "start" }}>
              {filteredProblems.map((problem, idx) => (
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  phase={phase}
                  isActive={phase === "SELECT" ? problem.id === currentProblemId : false}
                  isMySelection={selections.some(s => s.team_id === teamId && s.problem_id === problem.id)}
                  index={idx}
                  onClick={() => setExpandedProblemId(problem.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div layout style={{ maxWidth: 640, margin: "0 auto" }}>
              {activeProblem ? (
                <ProblemCard
                  key={activeProblem.id}
                  problem={activeProblem}
                  phase={phase}
                  isActive={true}
                  isMySelection={selections.some(s => s.team_id === teamId && s.problem_id === activeProblem.id)}
                  index={0}
                  onClick={() => setExpandedProblemId(activeProblem.id)}
                />
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "4rem 1.5rem", background: "rgba(15,12,28,0.6)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.05)" }}>
                  <h3 style={{ color: "white", marginBottom: "0.5rem" }}>Waiting...</h3>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>No current problem is active. The organizers will begin the next phase shortly.</p>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.main>

        <ProblemDrawer
          problem={problems.find(p => p.id === expandedProblemId) || null}
          isOpen={!!expandedProblemId}
          onClose={() => setExpandedProblemId(null)}
          phase={phase as Phase}
          isActive={phase === "SELECT" ? expandedProblemId === currentProblemId : false}
          hasSelected={hasSelected}
          isMySelection={expandedProblemId ? selections.some(s => s.team_id === teamId && s.problem_id === expandedProblemId) : false}
          onSelect={handleSelect}
          onReject={() => {}} // Could wire this to a reject state if needed
        />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            padding: "1.25rem",
            color: "rgba(255,255,255,0.15)",
            fontSize: "0.65rem",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          OreHack by Oregent © 2025 — Control Room
        </motion.footer>
      </div>
    </PageTransition>
  );
};

export default ControlRoom;
