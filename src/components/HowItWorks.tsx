import ScrollStack, { ScrollStackItem } from "./ScrollStack";

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
    bg: "hsl(219, 56%, 11%)",
    accent: "hsl(197, 55%, 11%)",
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
    bg: "hsl(197, 55%, 11%)",
    accent:"hsl(219, 56%, 11%)",
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
    bg: "hsl(249, 64%, 17%)",
    accent: "hsl(264, 51%, 10%)",
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
    bg: "hsl(264, 51%, 10%)",
    accent: "hsl(249, 64%, 17%)",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        position: "relative",
        zIndex: 10,
        marginTop: "clamp(-14rem, -15vh, -6rem)",
      }}
    >
      <ScrollStack
        useWindowScroll
        itemDistance={60}
        itemScale={0.04}
        itemStackDistance={25}
        stackPosition="15%"
        scaleEndPosition="10%"
        baseScale={0.88}
        blurAmount={2}
      >
        {steps.map((s) => (
          <ScrollStackItem key={s.num}>
            <div className="hiw-card" style={{ background: s.bg }}>
              {/* Left content */}
              <div className="hiw-card-left">
                <p className="hiw-step-label">
                  STEP {s.num} / {s.total}
                </p>
                <h3 className="hiw-title">{s.title}</h3>
                <p className="hiw-desc">{s.desc}</p>
                <div className="hiw-tags">
                  {s.tags.map((tag) => (
                    <span key={tag} className="hiw-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right info box */}
              <div className="hiw-card-right">
                <div
                  className="hiw-info-box"
                  style={{ background: s.accent }}
                >
                  <div className="hiw-arrow-circle">
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
                    <span className="hiw-info-label">{s.infoLabel}</span>
                    <span className="hiw-info-value">{s.infoValue}</span>
                  </div>
                  <div className="hiw-info-block">
                    <span className="hiw-info-label">{s.roleLabel}</span>
                    <span className="hiw-info-value">{s.roleValue}</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </section>
  );
}
