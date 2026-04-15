import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const hackathons = [
  { id: "origin-2k26", name: "Origin 2K26", status: "Live", participants: 413, deadline: "10th April 10.00 am" },
  { id: "buildcore-v3", name: "BuildCore v3", status: "Upcoming", participants: 0, deadline: "3rd May 11.15 am" },
  { id: "devstrike-24", name: "DevStrike '24", status: "Completed", participants: 256, deadline: "Ended" },
  { id: "codeblitz-1", name: "CodeBlitz 1.0", status: "Upcoming", participants: 190, deadline: "9th May 4.40 pm" },
  { id: "simats-open", name: "SIMATS Open Challenge", status: "Live", participants: 275, deadline: "17th May 8.20 pm" },
  { id: "hackfest-2026", name: "HackFest 2026", status: "Upcoming", participants: 142, deadline: "26th May 2.55 pm" },
];

const STATUS = {
  Live: { badge: "LIVE", card: "hsl(142 71% 45%)", glow: "hsl(142 71% 45% / 0.30)", bg: "hsl(142 71% 45% / 0.08)", border: "hsl(142 71% 45% / 0.45)", dot: true, pulse: true },
  Upcoming: { badge: "UPCOMING", card: "hsl(217 91% 60%)", glow: "hsl(217 91% 60% / 0.20)", bg: "hsl(217 91% 60% / 0.07)", border: "hsl(217 91% 60% / 0.35)", dot: false, pulse: false },
  Completed: { badge: "COMPLETED", card: "hsl(218 11% 55%)", glow: "transparent", bg: "hsl(217 33% 14% / 0.60)", border: "hsl(217 33% 22%)", dot: false, pulse: false },
};

/* ══════════════════════════════════════════════════════════
   FRAGMENT GEOMETRY
═══════════════════════════════════════════════════════════ */
const CLIPS = [
  "polygon(0% 0%, 55% 0%, 42% 50%, 0% 50%)",
  "polygon(45% 0%, 100% 0%, 100% 50%, 58% 50%)",
  "polygon(0% 50%, 42% 50%, 55% 100%, 0% 100%)",
  "polygon(58% 50%, 100% 50%, 100% 100%, 45% 100%)",
  "polygon(42% 50%, 58% 50%, 45% 100%, 55% 100%)",
  "polygon(45% 0%, 55% 0%, 58% 50%, 42% 50%)",
];
const ORIGINS: [number, number][] = [[-160, -130], [160, -130], [-160, 130], [160, 130], [0, 200], [0, -200]];

/* ══════════════════════════════════════════════════════════
   SPARKLINE
═══════════════════════════════════════════════════════════ */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 80, h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  const filled = `${pts} ${w},${h} 0,${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.slice(4, 7)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={filled} fill={`url(#sg-${color.slice(4, 7)})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════
   EXPLODING CARD  (glassmorphic)
═══════════════════════════════════════════════════════════ */
interface CardProps { h: typeof hackathons[0]; assembled: boolean; active: boolean }

function ExplodingCard({ h, assembled, active }: CardProps) {
  const navigate = useNavigate();
  const [locked, setLocked] = useState(false);
  const prevAssembled = useRef(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (assembled && !prevAssembled.current) {
      t = setTimeout(() => setLocked(true), 860);
    } else if (!assembled) {
      setLocked(false);
    }
    prevAssembled.current = assembled;
    return () => clearTimeout(t);
  }, [assembled]);

  let sc = STATUS[h.status as keyof typeof STATUS];
  if (h.id === "origin-2k26") {
    sc = { ...sc, card: "hsl(0 0% 75%)", glow: "hsl(0 0% 75% / 0.30)", bg: "hsl(0 0% 75% / 0.15)", border: "hsl(0 0% 75% / 0.45)" };
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "1.1rem",
        transform: active ? "scale(1) translateZ(0)" : "scale(0.94) translateZ(-30px)",
        opacity: active ? 1 : 0.65,
        filter: h.status === "Completed" ? "grayscale(60%) brightness(0.75)" : "none",
        transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease, filter 0.5s ease",
      }}
    >
      {/* ── glassmorphic background ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "1.1rem",
          background: h.id === "origin-2k26" 
            ? "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url('/place to strt.jpeg') center/cover no-repeat" 
            : "hsl(220 30% 10% / 0.55)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          opacity: assembled ? 1 : 0,
          transition: "opacity 0.4s ease 0.3s",
        }}
      />

      {/* ── fragment shards (assemble animation) ── */}
      {CLIPS.map((clip, fi) => {
        const [ox, oy] = ORIGINS[fi];
        return (
          <div
            key={fi}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              clipPath: clip,
              background: h.id === "origin-2k26"
                ? "linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url('/place to strt.jpeg') center/cover no-repeat"
                : "linear-gradient(135deg, hsl(220 33% 14% / 0.7), hsl(220 33% 9% / 0.8))",
              border: "1px solid hsl(217 33% 18% / 0.6)",
              borderRadius: "1.1rem",
              backdropFilter: "blur(14px)",
              transform: assembled ? "translate(0,0) scale(1)" : `translate(${ox}px,${oy}px) scale(0.80)`,
              opacity: assembled ? 1 : 0,
              transition: assembled
                ? `transform ${0.55 + fi * 0.045}s cubic-bezier(0.22,1,0.36,1) ${fi * 30}ms,
                   opacity   0.3s ease ${fi * 30}ms`
                : "none",
            }}
          />
        );
      })}

      {/* ── status border glow  ── */}
      <div
        aria-hidden
        className={sc.pulse && locked ? "live-border-glow" : ""}
        style={{
          position: "absolute",
          inset: -1,
          borderRadius: "1.15rem",
          pointerEvents: "none",
          border: locked ? `1px solid ${sc.border}` : "1px solid transparent",
          boxShadow: locked ? `0 0 22px 2px ${sc.glow}, inset 0 0 12px 2px ${sc.bg}` : "none",
          transition: "box-shadow 0.7s ease, border-color 0.5s ease",
        }}
      />

      {/* ── seam lines ── */}
      {assembled && !locked && (
        <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", borderRadius: "1.1rem", overflow: "hidden" }}>
          <line x1="42%" y1="0%" x2="55%" y2="50%" stroke={sc.card} strokeWidth="1" strokeOpacity="0.35" />
          <line x1="58%" y1="50%" x2="45%" y2="100%" stroke={sc.card} strokeWidth="1" strokeOpacity="0.35" />
        </svg>
      )}

      {/* ── CARD CONTENT ── */}
      <div
        onClick={() => {
          if (assembled) {
            window.dispatchEvent(new Event('logoTurbo'));
            if (h.id === "origin-2k26") {
              navigate(`/hackathon/${h.id}/login`);
            } else {
              navigate("/admin/auth");
            }
          }
        }}
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          padding: "2rem 2rem 1.75rem",
          borderRadius: "1rem",
          cursor: assembled ? "pointer" : "default",
          opacity: assembled ? 1 : 0,
          transition: "opacity 0.35s ease 0.55s",
          display: "flex",
          flexDirection: "column",
          gap: "0.9rem",
          justifyContent: "space-between",
        }}
      >
        {/* top window controls */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "-0.2rem" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56", boxShadow: "inset 0 0 4px rgba(0,0,0,0.2)" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e", boxShadow: "inset 0 0 4px rgba(0,0,0,0.2)" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f", boxShadow: "inset 0 0 4px rgba(0,0,0,0.2)" }} />
        </div>

        {/* top: name + badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
          <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "hsl(220 14% 97%)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {h.name}
          </h3>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.35rem",
            fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em",
            padding: "0.28rem 0.75rem", borderRadius: "9999px",
            border: `1px solid ${sc.border}`, color: sc.card, background: sc.bg,
            flexShrink: 0, marginTop: "0.25rem",
          }}>
            {sc.dot && (
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.card, display: "inline-block", animation: "pulse 1.5s infinite" }} />
            )}
            {sc.badge}
          </span>
        </div>

        {/* divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg, ${sc.border}, transparent)` }} />

        {/* stats row */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          <StatRow label="Participants" value={h.participants.toLocaleString()} color={sc.card} />
          <StatRow label="Deadline" value={h.deadline} color={sc.card} />
        </div>

        {/* CTA */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "0.5rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: sc.card,
            padding: "0.65rem 1.6rem",
            borderRadius: "0.6rem",
            border: `1px solid ${sc.border}`,
            background: sc.bg,
            width: "fit-content",
            transition: "box-shadow 0.3s, transform 0.2s",
            "--cta-bg": h.id === "origin-2k26" ? "hsl(0 0% 75%)" : undefined,
            "--cta-shadow": h.id === "origin-2k26" ? "hsl(0 0% 75% / 0.65)" : undefined,
          } as React.CSSProperties}
            className="hackathon-cta"
          >
            Dive In
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "0.78rem", color: "hsl(218 11% 48%)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "hsl(220 14% 90%)" }}>{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN SECTION — PIN SCROLL
═══════════════════════════════════════════════════════════ */
const N = hackathons.length;
const TRACK_VH = N;

export default function ActiveHackathons() {
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);

  // Which cards have assembled
  const [assembled, setAssembled] = useState<boolean[]>(() => hackathons.map(() => false));
  // Active card index (for scale/glow)
  const [activeIdx, setActiveIdx] = useState(0);

  const assembledRef = useRef(assembled);
  assembledRef.current = assembled;

  const handleScroll = useCallback(() => {
    const track = trackRef.current;
    const rail = railRef.current;
    const pBar = progressBarRef.current;
    if (!track || !rail) return;

    const rect = track.getBoundingClientRect();
    const trackHeight = track.offsetHeight;
    const scrollable = trackHeight - window.innerHeight;
    const scrolledIn = Math.max(0, -rect.top);
    const p = Math.min(1, scrolledIn / scrollable);

    const firstCard = rail.firstElementChild as HTMLElement | null;
    const cw = firstCard ? firstCard.offsetWidth : 400;
    const GAP = 32;
    const maxOffset = (N - 1) * (cw + GAP);

    rail.style.transform = `translateX(${-p * maxOffset}px)`;
    if (pBar) pBar.style.width = `${p * 100}%`;

    const raw = p * (N - 1);
    const idx = Math.round(raw);
    setActiveIdx(Math.min(N - 1, idx));

    const next = [...assembledRef.current];
    const isBelowScreen = rect.top > window.innerHeight - 150;
    const isAboveScreen = rect.bottom < 150;

    hackathons.forEach((_, i) => {
      if (isBelowScreen || isAboveScreen) {
        next[i] = false;
      } else {
        const targetP = i / (N - 1);
        const dist = Math.abs(p - targetP);
        next[i] = dist < 0.85 / (N - 1);
      }
    });

    if (next.some((v, i) => v !== assembledRef.current[i])) {
      setAssembled([...next]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{ opacity:1 } 50%{ opacity:0.4 } }

        /* Living border glow for LIVE cards */
        @keyframes borderBreath {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.45; }
        }
        .live-border-glow { animation: borderBreath 2.2s ease-in-out infinite; }

        /* Enter Portal hover */
        .hackathon-cta { transition: all 0.3s ease !important; }
        .hackathon-cta:hover {
          box-shadow: 0 0 28px -4px var(--cta-shadow, hsl(142 71% 45% / 0.65)) !important;
          transform: translateY(-2px) !important;
          background-color: var(--cta-bg, hsl(142 71% 45%)) !important;
          color: #060f0a !important;
        }
        .hackathon-cta:hover .scan-beam {
          animation: scanBeam 0.55s ease forwards;
        }

        /* Scan beam overlay */
        .scan-beam {
          position: absolute;
          top: 0; left: -120%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent);
          transform: skewX(-18deg);
        }
        @keyframes scanBeam {
          0%   { left: -120%; }
          100% { left: 160%;  }
        }

        /* Dot-nav */
        .dot-btn { transition: all 0.3s ease !important; }
        .dot-btn:hover .dot-label {
          opacity: 1 !important;
          max-width: 160px !important;
          margin-left: 0.55rem;
        }
        .dot-label {
          max-width: 0;
          opacity: 0;
          overflow: hidden;
          white-space: nowrap;
          transition: all 0.3s ease;
        }
      `}</style>

      {/* ── SCROLL TRACK ── */}
      <div ref={trackRef} id="hackathons" style={{ height: `${TRACK_VH * 100}vh`, position: "relative" }}>

        {/* ── STICKY CONTAINER ── */}
        <div style={{
          position: "sticky", top: 0, height: "100vh",
          overflow: "hidden", display: "flex", alignItems: "center", background: "transparent",
        }}>

          {/* subtle grid */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(hsl(217 33% 17% / 0.2) 1px, transparent 1px),linear-gradient(90deg, hsl(217 33% 17% / 0.2) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
            pointerEvents: "none",
          }} />

          {/* ── INNER LAYOUT ── */}
          <div style={{ width: "100%", position: "relative", zIndex: 1 }}>

            {/* ── LEFT PANEL ── */}
            <div style={{
              position: "absolute",
              left: "clamp(1.5rem, 5vw, 4rem)",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              maxWidth: 290,
            }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(263 84% 68%)", marginBottom: "0.6rem" }}>
                ◆ Active Hackathons
              </p>
              <h2 style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)",
                fontWeight: 900, color: "hsl(220 14% 97%)",
                lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: "1rem",
              }}>
                Compete.<br />
                <span style={{ background: "linear-gradient(135deg, hsl(263 84% 62%), hsl(310 80% 70%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Conquer.
                </span>
              </h2>
              <p style={{ fontSize: "0.8rem", color: "hsl(218 11% 44%)", lineHeight: 1.6, marginBottom: "2rem" }}>
                Scroll to navigate between hackathons.
              </p>

              {/* ── FOCUS SWITCHER (dot nav) ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {hackathons.map((h, i) => {
                  const sc = STATUS[h.status as keyof typeof STATUS];
                  const isActive = activeIdx === i;
                  return (
                    <button
                      key={h.id}
                      className="dot-btn"
                      onMouseEnter={() => setHoveredDot(i)}
                      onMouseLeave={() => setHoveredDot(null)}
                      onClick={() => {
                        const track = trackRef.current;
                        if (!track) return;
                        const scrollable = track.offsetHeight - window.innerHeight;
                        const targetP = i / (N - 1);
                        window.scrollTo({ top: track.offsetTop + targetP * scrollable, behavior: "smooth" });
                      }}
                      style={{
                        display: "flex", alignItems: "center",
                        background: "none", border: "none",
                        cursor: "pointer", padding: 0, textAlign: "left",
                      }}
                    >
                      {/* pill indicator */}
                      <div style={{
                        width: isActive ? 30 : 8,
                        height: 8,
                        borderRadius: 9999,
                        background: isActive ? sc.card : "hsl(217 33% 26%)",
                        flexShrink: 0,
                        boxShadow: isActive ? `0 0 10px 1px ${sc.glow}` : "none",
                        transition: "width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.3s, box-shadow 0.3s",
                      }} />

                      {/* expand-on-hover name label */}
                      <span
                        className="dot-label"
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? sc.card : (hoveredDot === i ? "hsl(220 14% 80%)" : "hsl(218 11% 40%)"),
                        }}
                      >
                        {h.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* scroll hint */}
              <div style={{ marginTop: "2.5rem", display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.4 }}>
                <svg width="14" height="22" viewBox="0 0 14 22" fill="none" style={{ flexShrink: 0 }}>
                  <rect x="1" y="1" width="12" height="20" rx="6" stroke="hsl(218 11% 55%)" strokeWidth="1.5" />
                  <rect x="6" y="4" width="2" height="5" rx="1" fill="hsl(218 11% 55%)" style={{ animation: "scrollHint 1.6s ease-in-out infinite" }} />
                </svg>
                <span style={{ fontSize: "0.65rem", color: "hsl(218 11% 50%)", letterSpacing: "0.1em" }}>SCROLL</span>
              </div>
            </div>

            {/* ── CARD RAIL ── */}
            <div style={{
              marginLeft: "clamp(280px, 36vw, 420px)",
              padding: "4rem 0",
              marginTop: "-4rem",
              overflow: "hidden",
              maskImage: "linear-gradient(90deg, black 0%, black 90%, transparent 100%)",
            }}>
              <div ref={railRef} style={{
                display: "flex",
                gap: "2rem",
                paddingRight: "clamp(2rem, 5vw, 6rem)",
                willChange: "transform",
                perspective: "1000px",
              }}>
                {hackathons.map((h, i) => (
                  <div
                    key={h.id}
                    style={{
                      width: "clamp(300px, 38vw, 480px)",
                      height: "clamp(280px, 46vh, 380px)",
                      flexShrink: 0,
                    }}
                  >
                    <ExplodingCard h={h} assembled={assembled[i]} active={activeIdx === i} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── PROGRESS BAR ── */}
            <div style={{
              position: "absolute", bottom: "-4rem",
              left: "clamp(1.5rem, 5vw, 4rem)",
              right: "clamp(1rem, 3vw, 3rem)",
              height: 2, background: "hsl(217 33% 18%)",
              borderRadius: 9999, overflow: "hidden",
            }}>
              <div ref={progressBarRef} style={{
                height: "100%", width: "0%", borderRadius: 9999,
                background: "linear-gradient(90deg, hsl(263 84% 58%), hsl(310 80% 68%))",
                transition: "width 0.08s linear",
              }} />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
