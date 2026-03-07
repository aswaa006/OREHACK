import { useState, useEffect, useRef } from "react";

const steps = [
  {
    num: "01",
    short: "Register",
    title: "Register & Authenticate",
    desc: "Teams receive credentials and log in through the secure submission portal. Each team is assigned a unique access token tied to their hackathon entry.",
    detail: [
      "Secure OAuth-based team login",
      "Unique submission token issued per team",
      "Portal access verified against participant list",
    ],
  },
  {
    num: "02",
    short: "Submit Repo",
    title: "Submit Repository",
    desc: "Submit your public GitHub repository link along with an optional problem statement. Our system clones and snapshots your code at submission time.",
    detail: [
      "GitHub repository URL validated and cloned",
      "Submission timestamp locked on confirm",
      "Optional problem statement attachment",
    ],
  },
  {
    num: "03",
    short: "Evaluation",
    title: "Automated Evaluation",
    desc: "Our engine parses, inspects, and scores your submission through structured AI intelligence — covering code quality, functionality, and innovation.",
    detail: [
      "Static analysis & dependency scan",
      "AI-powered code quality assessment",
      "Functional test suite execution",
    ],
  },
  {
    num: "04",
    short: "Results",
    title: "Results & Leaderboard",
    desc: "Scores and structured feedback are generated automatically. Rankings update in real time as evaluations complete across all teams.",
    detail: [
      "Live-updating public leaderboard",
      "Per-team structured score breakdown",
      "AI-generated feedback report",
    ],
  },
];

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);

  const activeRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cross-fade when step changes
  const handleSelect = (i: number) => {
    if (i === activeRef.current) return;
    activeRef.current = i;
    setVisible(false);
    setTimeout(() => {
      setActive(i);
      setVisible(true);
    }, 180);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const { top, height } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const scrollableDistance = height - windowHeight;
      if (scrollableDistance <= 0) return;

      let progress = -top / scrollableDistance;
      progress = Math.max(0, Math.min(1, progress));

      const numSteps = steps.length;
      let stepIndex = Math.floor(progress * numSteps);
      if (stepIndex >= numSteps) stepIndex = numSteps - 1;

      if (stepIndex !== activeRef.current) {
        handleSelect(stepIndex);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check initial scroll position
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToStep = (i: number) => {
    if (!containerRef.current) return;
    const { top } = containerRef.current.getBoundingClientRect();
    const scrollTop = window.scrollY + top;
    const scrollableDistance = containerRef.current.clientHeight - window.innerHeight;

    // Scroll to slightly inside the step's boundary
    const progress = i / steps.length;
    const targetScroll = scrollTop + (scrollableDistance * progress) + 10;

    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const s = steps[active];

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      style={{
        position: "relative",
        zIndex: 10,
        height: "400vh", // Makes the container tall for scroll-jacking
        marginTop: "clamp(-14rem, -15vh, -6rem)"
      }}
    >
      <style>{`
        @keyframes hiw-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .hiw-step-btn:hover .hiw-num  { color: hsl(220 14% 80%); }
        .hiw-step-btn:hover .hiw-short { color: hsl(220 14% 72%); }
      `}</style>

      {/* Sticky Inner Container */}
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden" // Prevent anything bleeding out during sticky
      }}>
        <div style={{ width: "100%", maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" }}>

          {/* ── section label & heading ── */}
          <div style={{ marginBottom: "3.5rem" }}>
            <p style={{
              fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: "hsl(263 84% 68%)", marginBottom: "0.5rem",
            }}>
              ◆ How It Works
            </p>
            <h2 style={{
              fontSize: "clamp(1.8rem,4vw,2.6rem)", fontWeight: 900,
              color: "hsl(220 14% 97%)", letterSpacing: "-0.025em", lineHeight: 1.1,
            }}>
              Simple.{" "}
              <span style={{
                background: "linear-gradient(135deg, hsl(263 84% 62%), hsl(210 100% 68%))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Structured.
              </span>
            </h2>
          </div>

          {/* ── two-panel layout ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "260px 1fr",
            gap: "0",
            border: "1px solid hsl(217 33% 17%)",
            borderRadius: "1rem",
            overflow: "hidden",
            background: "hsl(220 33% 9%)",
            minHeight: 340,
          }}>

            {/* ── LEFT: step list ── */}
            <div style={{
              borderRight: "1px solid hsl(217 33% 17%)",
              padding: "0.5rem 0",
              display: "flex",
              flexDirection: "column",
            }}>
              {steps.map((step, i) => {
                const isActive = active === i;
                return (
                  <button
                    key={step.num}
                    className="hiw-step-btn"
                    onClick={() => scrollToStep(i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "1.1rem 1.5rem",
                      background: "none",
                      border: "none",
                      borderLeft: `3px solid ${isActive ? "hsl(263 84% 62%)" : "transparent"}`,
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "border-color 0.25s, background 0.25s",
                      backgroundColor: isActive ? "hsl(263 84% 58% / 0.06)" : "transparent",
                    }}
                  >
                    <span
                      className="hiw-num"
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        fontFamily: "'JetBrains Mono','Fira Code',monospace",
                        color: isActive ? "hsl(263 84% 70%)" : "hsl(217 33% 38%)",
                        transition: "color 0.25s",
                        flexShrink: 0,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {step.num}
                    </span>
                    <span
                      className="hiw-short"
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: isActive ? 700 : 400,
                        color: isActive ? "hsl(220 14% 95%)" : "hsl(218 11% 42%)",
                        transition: "color 0.25s, font-weight 0.25s",
                      }}
                    >
                      {step.short}
                    </span>

                    {/* active arrow */}
                    {isActive && (
                      <svg
                        style={{ marginLeft: "auto", flexShrink: 0, opacity: 0.5 }}
                        width="14" height="14" viewBox="0 0 24 24"
                        fill="none" stroke="hsl(263 84% 68%)" strokeWidth={2.5}
                        strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── RIGHT: detail panel ── */}
            <div
              style={{
                padding: "2.5rem 2.5rem 2.25rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(8px)",
                transition: "opacity 0.22s ease, transform 0.22s ease",
              }}
            >
              {/* top */}
              <div>
                {/* step number watermark */}
                <span style={{
                  display: "block",
                  fontSize: "4.5rem",
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "hsl(263 84% 62% / 0.08)",
                  fontFamily: "'JetBrains Mono','Fira Code',monospace",
                  marginBottom: "-1rem",
                  letterSpacing: "-0.04em",
                  userSelect: "none",
                }}>
                  {s.num}
                </span>

                <h3 style={{
                  fontSize: "clamp(1.3rem, 2.5vw, 1.7rem)",
                  fontWeight: 800,
                  color: "hsl(220 14% 97%)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  marginBottom: "0.9rem",
                }}>
                  {s.title}
                </h3>

                <p style={{
                  fontSize: "0.9rem",
                  color: "hsl(218 11% 52%)",
                  lineHeight: 1.75,
                  maxWidth: 560,
                }}>
                  {s.desc}
                </p>
              </div>

              {/* detail bullets */}
              <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {s.detail.map((point, di) => (
                  <div
                    key={`${active}-${di}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.7rem",
                      animation: `hiw-fade-up 0.3s ease ${di * 60}ms both`,
                    }}
                  >
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "hsl(263 84% 62%)",
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: "0.82rem", color: "hsl(218 11% 60%)" }}>
                      {point}
                    </span>
                  </div>
                ))}
              </div>

              {/* progress dots */}
              <div style={{ display: "flex", gap: "0.4rem", marginTop: "2rem" }}>
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToStep(i)}
                    style={{
                      width: active === i ? 20 : 6,
                      height: 6,
                      borderRadius: 9999,
                      background: active === i ? "hsl(263 84% 62%)" : "hsl(217 33% 25%)",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      transition: "width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.25s",
                    }}
                  />
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
