import ScrollStack, { ScrollStackItem } from "./ScrollStack";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const steps = [
  {
    num: "01",
    total: "04",
    title: "REGISTER &\nAUTHENTICATE",
    desc: "Teams receive credentials and log in through the secure submission portal. Each team is assigned a unique access token tied to their hackathon entry.",
    tags: ["OAuth Login", "Team Tokens", "Portal Access"],
    infoLabel: "PHASE",
    infoValue: "Onboarding",
    roleLabel: "PROCESS",
    roleValue: "Identity Verification",
    bg: "#7c3aed",
    accent: "#000000",
  },
  {
    num: "02",
    total: "04",
    title: "SUBMIT\nREPOSITORY",
    desc: "Submit your public GitHub repository link along with given  problem statement. Our system dives in and explores your project context at submission time.",
    tags: ["GitHub URL", "Timestamp Lock", "Problem Statement"],
    infoLabel: "PHASE",
    infoValue: "Submission",
    roleLabel: "PROCESS",
    roleValue: "Code Snapshot",
    bg: "#000000",
    accent: "#7c3aed",
  },
  {
    num: "03",
    total: "04",
    title: "AUTOMATED\nEVALUATION",
    desc: "Our engine parses, inspects, and scores your submission through structured AI intelligence — covering code quality, functionality, and innovation.",
    tags: ["Static Analysis", "AI Scoring", "Test Suite"],
    infoLabel: "PHASE",
    infoValue: "Analysis",
    roleLabel: "PROCESS",
    roleValue: "AI Code Review",
    bg: "#7c3aed",
    accent: "#000000",
  },
  {
    num: "04",
    total: "04",
    title: "RESULTS &\nLEADERBOARD",
    desc: "Scores and structured feedback are generated automatically. Rankings update in real time as evaluations complete across all teams.",
    tags: ["Live Rankings", "Score Breakdown", "AI Feedback"],
    infoLabel: "PHASE",
    infoValue: "Results",
    roleLabel: "PROCESS",
    roleValue: "Real-time Ranking",
    bg: "#000000",
    accent: "#7c3aed",
  },
];export default function HowItWorks() {
  const { isDayMode } = useTheme();
  const headingColor = isDayMode ? "text-black" : "text-white";
  const sectionBg = isDayMode ? "#ffffff" : "transparent";

  // Process steps to handle theme-aware backgrounds
  const processedSteps = steps.map((s) => {
    let cardBg = s.bg;
    let innerBg = s.accent;

    if (isDayMode) {
      // "wherever black is there change to white"
      if (s.bg === "#000000") cardBg = "#ffffff";
      if (s.accent === "#000000") innerBg = "#ffffff";
      
      // "in the purple bg card change the inner card to white"
      // (This is already covered by the check above since purple cards have black innerBg)
    }

    return { ...s, themedBg: cardBg, themedAccent: innerBg };
  });

  return (
    <section
      id="how-it-works"
      className="px-6 md:px-16 lg:px-32"
      style={{
        position: "relative",
        zIndex: 10,
        marginTop: "0px", // Touching the previous section
        background: sectionBg,
        transition: "background 0.5s ease",
      }}
    >
      {/* ── Header: Eyebrow + WHO WE EMPOWER ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="w-full text-center mb-8 pt-24"
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-4 orehack-liquid-text"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          (TRUST THE BUILD)
        </p>
        <h2
          className={`text-4xl md:text-7xl font-black leading-none ${headingColor} m-0 uppercase flex flex-row flex-wrap items-baseline justify-center gap-4 md:gap-6 italic`}
          style={{
            fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
            letterSpacing: "-0.04em",
            textShadow: isDayMode ? "none" : "0 0 60px rgba(124, 58, 237, 0.45), 0 0 120px rgba(124, 58, 237, 0.2)",
          }}
        >
          <span>WHO</span>
          <span>WE</span>
          <span
            style={{
              fontFamily: '"Playfair Display", serif',
              color: "#7c3aed",
              letterSpacing: "0.02em",
              textShadow: "0 0 40px rgba(124, 58, 237, 0.8), 0 0 80px rgba(124, 58, 237, 0.4)",
            }}
          >
            EMPOWER ?
          </span>
        </h2>

        {/* Glow divider */}
        <div style={{ position: "relative", marginTop: "2.5rem", height: "2px" }}>
          <div style={{
            width: "100%",
            height: "1px",
            background: `linear-gradient(to right, transparent, rgba(124,58,237,0.6), ${isDayMode ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.3)"}, rgba(124,58,237,0.6), transparent)`,
          }} />
          <div style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: "24px",
            background: `radial-gradient(ellipse at center, rgba(124,58,237, ${isDayMode ? "0.2" : "0.35"}) 0%, transparent 70%)`,
            filter: isDayMode ? "blur(4px)" : "blur(6px)",
            pointerEvents: "none",
          }} />
        </div>
      </motion.div>
      <ScrollStack
        useWindowScroll
        itemDistance={60}
        itemScale={0.04}
        itemStackDistance={25}
        stackPosition="15%"
        scaleEndPosition="10%"
        baseScale={0.88}
        blurAmount={2}
        unpinOnLastItem={true}
      >
        {processedSteps.map((s, idx) => {
          const isWhiteBg = isDayMode && s.bg === "#000000";
          const cardTextColor = isWhiteBg ? "#000000" : "#ffffff";
          const subTextColor = isWhiteBg ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)";
          const labelTextColor = isWhiteBg ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.45)";
          const tagBorderColor = isWhiteBg ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)";

          return (
            <ScrollStackItem key={s.num}>
              <div
                className={`hiw-card ${isDayMode ? 'day-mode' : ''}`}
                style={{
                  background: s.themedBg,
                  border: isDayMode ? "2px solid #000000" : (isWhiteBg ? "2px solid rgba(0,0,0,0.05)" : "2px solid #ffffff"),
                  boxShadow: isDayMode ? "0 20px 40px rgba(0,0,0,0.05)" : "none"
                }}
              >
                {/* Left content */}
                <div className="hiw-card-left">
                  <p className="hiw-step-label" style={{ color: labelTextColor }}>
                    STEP {s.num} / {s.total}
                  </p>
                  <h3 className="hiw-title" style={{ color: cardTextColor }}>{s.title}</h3>
                  <p className="hiw-desc" style={{ color: subTextColor }}>{s.desc}</p>
                  <div className="hiw-tags">
                    {s.tags.map((tag) => (
                      <span key={tag} className="hiw-tag" style={{ color: subTextColor, borderColor: tagBorderColor }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right info box */}
                <div className="hiw-card-right">
                  <div
                    className="hiw-info-box"
                    style={{ 
                      background: s.themedAccent,
                      border: (isDayMode && s.themedAccent === "#ffffff") ? "1px solid rgba(0,0,0,0.1)" : "none",
                      boxShadow: (isDayMode && s.themedAccent === "#ffffff") ? "0 10px 25px rgba(0,0,0,0.05)" : "none"
                    }}
                  >
                    <div
                      className="hiw-arrow-circle"
                      style={{
                        background: idx % 2 === 0 ? "#7c3aed" : (isDayMode ? "#000000" : "#ffffff"),
                        color: idx % 2 === 0 ? "#ffffff" : (isDayMode ? "#ffffff" : "#000000")
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 17L17 7" />
                        <path d="M7 7h10v10" />
                      </svg>
                    </div>
                    <div className="hiw-info-block">
                      <span
                        className="hiw-info-label"
                        style={{ color: idx % 2 === 0 ? (isDayMode ? "#7c3aed" : "#7c3aed") : (isDayMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)") }}
                      >
                        {s.infoLabel}
                      </span>
                      <span
                        className="hiw-info-value"
                        style={{ color: idx % 2 === 0 ? (isDayMode ? "#7c3aed" : "#7c3aed") : (isDayMode ? "#000000" : "#ffffff") }}
                      >
                        {s.infoValue}
                      </span>
                    </div>
                    <div className="hiw-info-block">
                      <span
                        className="hiw-info-label"
                        style={{ color: idx % 2 === 0 ? (isDayMode ? "#7c3aed" : "#7c3aed") : (isDayMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)") }}
                      >
                        {s.roleLabel}
                      </span>
                      <span
                        className="hiw-info-value"
                        style={{ color: idx % 2 === 0 ? (isDayMode ? "#7c3aed" : "#7c3aed") : (isDayMode ? "#000000" : "#ffffff") }}
                      >
                        {s.roleValue}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollStackItem>
          );
        })}
      </ScrollStack>
    </section>
  );
}
