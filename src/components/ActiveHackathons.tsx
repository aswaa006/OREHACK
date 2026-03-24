import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/* ══════════════════════════════════════════════════════════
   DATA
═══════════════════════════════════════════════════════════ */
const hackathons = [
  { id: "origin-2k26", name: "Origin 2K26", status: "Live", participants: 128, deadline: "March 15, 2026" },
  { id: "buildcore-v3", name: "BuildCore v3", status: "Upcoming", participants: 0, deadline: "April 5, 2026" },
  { id: "devstrike-24", name: "DevStrike '24", status: "Completed", participants: 256, deadline: "Ended" },
];

const STATUS = {
  Live: { badge: "LIVE", card: "hsl(142 71% 45%)", glow: "hsl(142 71% 45% / 0.25)", bg: "hsl(142 71% 45% / 0.12)", border: "hsl(142 71% 45% / 0.40)", dot: true },
  Upcoming: { badge: "UPCOMING", card: "hsl(263 84% 68%)", glow: "hsl(263 84% 58% / 0.25)", bg: "hsl(263 84% 58% / 0.10)", border: "hsl(263 84% 58% / 0.35)", dot: false },
  Completed: { badge: "COMPLETED", card: "hsl(218 11% 65%)", glow: "transparent", bg: "hsl(217 33% 17% / 0.50)", border: "hsl(217 33% 22%)", dot: false },
};

/* ══════════════════════════════════════════════════════════
   FRAGMENT GEOMETRY (6 clip-paths that tile the full rect)
═══════════════════════════════════════════════════════════ */
const CLIPS = [
  "polygon(0% 0%, 55% 0%, 42% 50%, 0% 50%)",         // TL
  "polygon(45% 0%, 100% 0%, 100% 50%, 58% 50%)",      // TR
  "polygon(0% 50%, 42% 50%, 55% 100%, 0% 100%)",      // BL
  "polygon(58% 50%, 100% 50%, 100% 100%, 45% 100%)",  // BR
  "polygon(42% 50%, 58% 50%, 45% 100%, 55% 100%)",    // B-sliver
  "polygon(45% 0%, 55% 0%, 58% 50%, 42% 50%)",        // T-sliver
];
const ORIGINS: [number, number][] = [[-160, -130], [160, -130], [-160, 130], [160, 130], [0, 200], [0, -200]];

/* ══════════════════════════════════════════════════════════
   EXPLODING CARD
═══════════════════════════════════════════════════════════ */
interface CardProps { h: typeof hackathons[0]; assembled: boolean; active: boolean }

function ExplodingCard({ h, assembled, active }: CardProps) {
  const navigate = useNavigate();
  const [locked, setLocked] = useState(false);
  const prevAssembled = useRef(false);

  // fire lock-flash when assembled transitions false→true
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

  const sc = STATUS[h.status as keyof typeof STATUS];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "1rem",
        transform: active ? "scale(1)" : "scale(0.96)",
        transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* ── background fragments ── */}
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
              background: `linear-gradient(135deg, hsl(220 33% 12%), hsl(220 33% 9%))`,
              border: "1px solid hsl(217 33% 18%)",
              borderRadius: "1rem",
              transform: assembled
                ? "translate(0,0) scale(1)"
                : `translate(${ox}px,${oy}px) scale(0.80)`,
              opacity: assembled ? 1 : 0,
              transition: assembled
                ? `transform ${0.55 + fi * 0.045}s cubic-bezier(0.22,1,0.36,1) ${fi * 30}ms,
                   opacity   0.3s ease ${fi * 30}ms`
                : "none",
            }}
          />
        );
      })}

      {/* ── lock-flash (reduced) ── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "1rem",
          pointerEvents: "none",
          boxShadow: locked ? `0 0 0 0 transparent` : `0 0 20px 2px ${sc.glow}, inset 0 0 10px 1px ${sc.bg}`,
          border: locked ? `1px solid ${sc.border}` : "1px solid transparent",
          transition: "box-shadow 0.7s ease, border-color 0.5s ease",
        }}
      />

      {/* ── active card highlight ── */}
      {active && locked && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: "1.05rem",
            pointerEvents: "none",
            boxShadow: `0 4px 20px -5px ${sc.glow}`,
            border: `1px solid ${sc.border}`,
            transition: "opacity 0.4s",
          }}
        />
      )}

      {/* ── seam lines at join ── */}
      {assembled && !locked && (
        <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
          <line x1="42%" y1="0%" x2="55%" y2="50%" stroke={sc.card} strokeWidth="1" strokeOpacity="0.4" />
          <line x1="58%" y1="50%" x2="45%" y2="100%" stroke={sc.card} strokeWidth="1" strokeOpacity="0.4" />
        </svg>
      )}

      {/* ── CARD CONTENT ── */}
      <div
        onClick={() => {
          if (h.status === "Live" && assembled) {
            window.dispatchEvent(new Event('logoTurbo'));
            navigate(`/hackathon/${h.id}/login`);
          }
        }}
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          padding: "2rem 2rem 1.75rem",
          borderRadius: "1rem",
          cursor: h.status === "Live" ? "pointer" : "default",
          opacity: assembled ? 1 : 0,
          transition: "opacity 0.35s ease 0.55s",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
        }}
      >
        {/* top: name + badge */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "hsl(220 14% 97%)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
            {h.name}
          </h3>
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.65rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "0.3rem 0.85rem",
            borderRadius: "9999px",
            border: `1px solid ${sc.border}`,
            color: sc.card,
            background: sc.bg,
            flexShrink: 0,
            marginTop: "0.2rem",
          }}>
            {sc.dot && (
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.card, display: "inline-block", animation: "pulse 1.5s infinite" }} />
            )}
            {sc.badge}
          </span>
        </div>

        {/* divider */}
        <div style={{ height: 1, background: `linear-gradient(90deg, ${sc.border}, transparent)` }} />

        {/* stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem", flex: 1 }}>
          <StatRow label="Participants" value={h.participants.toLocaleString()} color={sc.card} />
          <StatRow label="Deadline" value={h.deadline} color={sc.card} />
        </div>

        {/* CTA */}
        {h.status === "Live" && (
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            color: sc.card,
            padding: "0.65rem 1.25rem",
            borderRadius: "0.6rem",
            border: `1px solid ${sc.border}`,
            background: sc.bg,
            width: "fit-content",
            transition: "box-shadow 0.3s, transform 0.2s",
          }}
            className="hackathon-cta"
          >
            Enter Portal
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: "0.82rem", color: "hsl(218 11% 52%)", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "hsl(220 14% 90%)" }}>{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN SECTION — PIN SCROLL
═══════════════════════════════════════════════════════════ */
const N = hackathons.length;
// Track height: N×100vh → N-1 "transitions" of 100vh each
const TRACK_VH = N;

export default function ActiveHackathons() {
  const trackRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Which cards have assembled
  const [assembled, setAssembled] = useState<boolean[]>([false, false, false]);
  // Active card index (for scale/glow)
  const [activeIdx, setActiveIdx] = useState(0);
  // Whether section is in sticky mode
  const [inView, setInView] = useState(false);

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
    const scrolledIn = Math.max(0, -rect.top);      // px scrolled past top of track
    const p = Math.min(1, scrolledIn / scrollable); // 0..1

    // Pin detection
    const isInView = rect.top <= 0 && rect.bottom >= window.innerHeight;
    setInView(isInView);

    // Card width from the rail's first child
    const firstCard = rail.firstElementChild as HTMLElement | null;
    const cw = firstCard ? firstCard.offsetWidth : 400;
    const GAP = 32;
    const maxOffset = (N - 1) * (cw + GAP);

    // Move rail (direct DOM — no re-render, buttery smooth)
    const tx = -p * maxOffset;
    rail.style.transform = `translateX(${tx}px)`;

    // Progress bar
    if (pBar) pBar.style.width = `${p * 100}%`;

    // Active index
    const raw = p * (N - 1);
    const idx = Math.round(raw);
    setActiveIdx(Math.min(N - 1, idx));

    // Dynamic assembly: trigger if nearby in horizontal pin, and section is vertically in view
    const next = [...assembledRef.current];
    const isBelowScreen = rect.top > window.innerHeight - 150;
    const isAboveScreen = rect.bottom < 150;

    hackathons.forEach((_, i) => {
      if (isBelowScreen || isAboveScreen) {
        next[i] = false; // Disassemble if completely scrolled past vertically
      } else {
        const targetP = i / (N - 1);
        const dist = Math.abs(p - targetP);
        next[i] = dist < 0.85 / (N - 1); // Disassemble if horizontal distance is far
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
        .hackathon-cta:hover {
          box-shadow: 0 0 30px -4px hsl(142 71% 45% / 0.4);
          transform: translateY(-1px);
        }
        .dot-btn { transition: all 0.3s; }
        .dot-btn:hover { transform: scale(1.3); }
      `}</style>

      {/* ── SCROLL TRACK (pins the sticky) ── */}
      <div
        ref={trackRef}
        id="hackathons"
        style={{ height: `${TRACK_VH * 100}vh`, position: "relative" }}
      >
        {/* ── STICKY CONTAINER ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            background: "hsl(222 40% 7%)",
          }}
        >
          {/* subtle grid */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "linear-gradient(hsl(217 33% 17% / 0.25) 1px, transparent 1px),linear-gradient(90deg, hsl(217 33% 17% / 0.25) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
              pointerEvents: "none",
            }}
          />

          {/* ── INNER LAYOUT ── */}
          <div style={{ width: "100%", position: "relative", zIndex: 1 }}>

            {/* ── LEFT PANEL (heading + step tracker) ── */}
            <div style={{
              position: "absolute",
              left: "clamp(1.5rem, 5vw, 4rem)",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 20,
              maxWidth: 280,
            }}>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "hsl(263 84% 68%)", marginBottom: "0.6rem" }}>
                ◆ Active Hackathons
              </p>
              <h2 style={{
                fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)",
                fontWeight: 900,
                color: "hsl(220 14% 97%)",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                marginBottom: "1rem",
              }}>
                Compete.<br />
                <span style={{ background: "linear-gradient(135deg, hsl(263 84% 62%), hsl(310 80% 70%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Conquer.
                </span>
              </h2>
              <p style={{ fontSize: "0.82rem", color: "hsl(218 11% 48%)", lineHeight: 1.6, marginBottom: "2rem" }}>
                Scroll to navigate through hackathons.
              </p>

              {/* step indicators */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {hackathons.map((h, i) => (
                  <button
                    key={h.id}
                    className="dot-btn"
                    onClick={() => {
                      // Scroll to that card's scroll position
                      const track = trackRef.current;
                      if (!track) return;
                      const scrollable = track.offsetHeight - window.innerHeight;
                      const targetP = i / (N - 1);
                      const targetY = track.offsetTop + targetP * scrollable;
                      window.scrollTo({ top: targetY, behavior: "smooth" });
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textAlign: "left",
                    }}
                  >
                    <div style={{
                      width: activeIdx === i ? 28 : 8,
                      height: 8,
                      borderRadius: 9999,
                      background: activeIdx === i
                        ? STATUS[h.status as keyof typeof STATUS].card
                        : "hsl(217 33% 28%)",
                      transition: "width 0.4s cubic-bezier(0.22,1,0.36,1), background 0.3s",
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: "0.78rem",
                      fontWeight: activeIdx === i ? 700 : 400,
                      color: activeIdx === i ? "hsl(220 14% 90%)" : "hsl(218 11% 42%)",
                      transition: "color 0.3s, font-weight 0.3s",
                    }}>
                      {h.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* scroll hint */}
              <div style={{ marginTop: "2.5rem", display: "flex", alignItems: "center", gap: "0.5rem", opacity: 0.45 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 18, height: 2, borderRadius: 9999, background: "hsl(218 11% 60%)", opacity: i === 1 ? 1 : 0.4 }} />
                  ))}
                </div>
                <span style={{ fontSize: "0.7rem", color: "hsl(218 11% 55%)", letterSpacing: "0.05em" }}>SCROLL</span>
              </div>
            </div>

            {/* ── CARD RAIL (overflow hidden window) ── */}
            <div
              style={{
                marginLeft: "clamp(280px, 36vw, 420px)",
                padding: "3.5rem 0",     // Add vertical padding so outer glows aren't clipped
                marginTop: "-3.5rem",    // Offset to maintain vertical centering
                overflow: "hidden",
                // Gradient mask. Fades ONLY on the extreme right, ensuring the first card is 100% visible initially.
                maskImage: "linear-gradient(90deg, black 0%, black 92%, transparent 100%)",
              }}
            >
              <div
                ref={railRef}
                style={{
                  display: "flex",
                  gap: "2rem",
                  paddingRight: "clamp(2rem, 5vw, 6rem)", // padding so last card can scroll past edge
                  willChange: "transform",
                  // No CSS transition — scroll handler drives it directly
                }}
              >
                {hackathons.map((h, i) => (
                  <div
                    key={h.id}
                    style={{
                      width: "clamp(300px, 38vw, 480px)",
                      height: "clamp(260px, 42vh, 340px)",
                      flexShrink: 0,
                    }}
                  >
                    <ExplodingCard
                      h={h}
                      assembled={assembled[i]}
                      active={activeIdx === i}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ── BOTTOM PROGRESS BAR ── */}
            <div style={{
              position: "absolute",
              bottom: "-4rem",
              left: "clamp(1.5rem, 5vw, 4rem)",
              right: "clamp(1rem, 3vw, 3rem)",
              height: 2,
              background: "hsl(217 33% 20%)",
              borderRadius: 9999,
              overflow: "hidden",
            }}>
              <div
                ref={progressBarRef}
                style={{
                  height: "100%",
                  width: "0%",
                  borderRadius: 9999,
                  background: "linear-gradient(90deg, hsl(263 84% 58%), hsl(310 80% 68%))",
                  transition: "width 0.08s linear",
                }}
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
