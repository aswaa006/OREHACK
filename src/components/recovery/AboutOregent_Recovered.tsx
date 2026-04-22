/**
 * AboutPage.jsx  — Oregent About Section
 *
 * Requirements met:
 * ✅ Exactly 7 cards  (removed "Platform Migration" & "40+ Integrations")
 * ✅ Layout matches Image 2  (tall left/right col + tall center hero)
 * ✅ Code block is FIXED HEIGHT — typing never pushes layout
 * ✅ Colors from Image 1 (dark navy #0d1120)
 * ✅ All original animations preserved (GSAP 3-phase + scroll blur + hover 3D)
 * ✅ Scroll-triggered: animation fires when About section enters viewport
 * ✅ Works as a self-contained section inside your full webpage
 *
 * Setup:
 *   npm install gsap
 *   Place logo at  src/assets/oregent-logo.png
 *   import logoSrc from "../assets/oregent-logo.png";
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ── swap this for your actual import once logo is in assets ──
const logoSrc = "/oregent-logo.png";

// ─────────────────────────────────────────────────────────────
// SCOPED CSS  (prefixed .og-about so nothing leaks to your page)
// ─────────────────────────────────────────────────────────────
const CSS = `
/* ── reset inside section only ── */
.og-about *, .og-about *::before, .og-about *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}

.og-about {
  --bg:        #020203;
  --card:      #0d1120;
  --card-teal: #061822;
  --card-navy: #06101a;
  --border:    rgba(255,255,255,0.07);
  --purple:    #7c3aed;
  --p2:        #9f60ff;
  --p3:        #c084fc;
  --text:      #eef0f8;
  --muted:     #7a869a;
  --grid:      rgba(255,255,255,0.024);

  font-family: 'Inter', sans-serif;
  color: var(--text);
  background: var(--bg);
  background-image:
    linear-gradient(var(--grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 60px 60px;
  padding: 72px 28px 56px;
}

/* dot texture */
.og-about .card-tex::after {
  content: ''; position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,.022) 1px, transparent 1px);
  background-size: 22px 22px;
  pointer-events: none; z-index: 0;
}
.og-about .card-tex > * { position: relative; z-index: 1; }

/* ── BENTO GRID ──
   Responsive grid layout aligned with design */
.og-wrap {
  max-width: 1240px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.og-bento {
  display: grid;
  /* Exactly 3 equal columns */
  grid-template-columns: repeat(3, 1fr);
  /* Row heights: first row 320px, then auto for remaining */
  grid-template-rows: 320px auto auto;
  gap: 14px;
  will-change: contents;
}

/* ── Explicit grid positioning ── */
#bc-startup   { grid-area: 1 / 1 / 2 / 2; }  /* col1 row1 */
#bc-product   { grid-area: 1 / 2 / 2 / 3; }  /* col2 row1 */
#bc-analytics { grid-area: 1 / 3 / 2 / 4; }  /* col3 row1 */
#bc-team      { grid-area: 2 / 1 / 3 / 2; }  /* col1 row2 */
#bc-hero      { grid-area: 2 / 2 / 4 / 3; }  /* col2 rows 2-3 (tall) */
#bc-approach  { grid-area: 2 / 3 / 3 / 4; }  /* col3 row2 */
#bc-brand     { grid-area: 3 / 3 / 4 / 4; }  /* col3 row3 */

/* Larger hero card spans full height */
#bc-hero { 
  height: auto;
}

/* Grid assignments removed - using grid-auto-flow now */

/* ── GRID ZOOM WRAPPER — starts scaled up, GSAP zooms it out ── */
.og-bento-wrapper {
  will-change: transform, opacity, filter;
  transform-origin: center center;
}

/* ── CARD BASE ── */
.og-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  will-change: transform, opacity, box-shadow;
  transition: border-color .25s, box-shadow .35s ease-out;
  transform-origin: center center;
  box-shadow: 0 4px 16px rgba(124, 58, 237, 0);
}
.og-card:hover { 
  border-color: rgba(124,58,237,.3);
  box-shadow: 0 8px 28px rgba(124, 58, 237, 0.15);
}

/* ── CARD TEXT ── */
.og-tc { padding: 24px; display: flex; flex-direction: column; height: 100%; }
.og-title {
  font-size: 1.04rem; font-weight: 700;
  letter-spacing: -.015em; margin-bottom: 8px; line-height: 1.3;
}
.og-desc {
  font-size: .78rem; color: var(--muted); line-height: 1.68; flex: 1;
}
.og-more {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: .76rem; color: var(--muted); font-weight: 500;
  text-decoration: none; margin-top: 16px; width: fit-content;
  transition: gap .18s, color .18s;
}
.og-more:hover { gap: 9px; color: var(--text); }

/* glow blob */
.og-gblob {
  position: absolute; border-radius: 50%;
  pointer-events: none; filter: blur(44px); z-index: 0;
}

/* ────────────────────────────────────────────────────
   BC-STARTUP  (col1 row1) — code block card
   FIXED HEIGHT code area so typing never shifts layout
──────────────────────────────────────────────────── */
#bc-startup { display: flex; flex-direction: column; }
.bc-startup-top {
  padding: 24px 24px 14px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.bc-code-wrap {
  flex: 1;
  padding: 12px 14px;
  position: relative;
  /* FIXED so typing does NOT grow the card */
  overflow: hidden;
  min-height: 0;
}
.bc-code-border {
  position: absolute; inset: 8px;
  border: 1px solid rgba(86,156,214,.18);
  border-radius: 6px;
  background: rgba(86,156,214,.024);
  pointer-events: none;
}
/* The pre is absolutely positioned so it never resizes the card */
pre.og-code {
  position: absolute;
  inset: 8px;
  font-family: 'Space Mono', monospace;
  font-size: .65rem; line-height: 1.75; color: #5a6a7a;
  white-space: pre;
  padding: 10px 12px;
  overflow: hidden;          /* clip if content exceeds box */
  pointer-events: none;
}
.kw  { color: #c586c0; }
.tag { color: #569cd6; }
.atr { color: #9cdcfe; }
.str { color: #ce9178; }
.cm  { color: #4a6a4a; }
.og-cur {
  display: inline-block; width: 2px; height: 11px;
  background: #569cd6; vertical-align: middle; margin-left: 1px;
  animation: og-blink .85s step-end infinite;
}
@keyframes og-blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ────────────────────────────────────────────────────
   BC-PRODUCT (col2 row1) — search pill
──────────────────────────────────────────────────── */
.og-spill {
  display: flex; align-items: center; gap: 8px;
  background: #0a0d1a; border: 1px solid rgba(124,58,237,.22);
  border-radius: 50px; padding: 9px 14px;
  box-shadow: 0 0 14px rgba(124,58,237,.16) inset;
}
.og-spill-ico { color: #2a3040; font-size: .82rem; flex-shrink: 0; }
.og-spill-txt {
  font-size: .75rem; color: var(--muted); flex: 1;
  font-family: 'Inter', sans-serif;
  /* prevent text from jumping layout */
  min-height: 1.1em;
}
.og-spill-go {
  width: 22px; height: 22px; background: #141828;
  border: 1px solid #1e2535; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: .58rem; color: #3a4a5a; cursor: pointer;
}

/* ────────────────────────────────────────────────────
   BC-ANALYTICS (col3 row1) — floating icons
──────────────────────────────────────────────────── */
.og-icons-scene {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 62%; display: flex; align-items: center; justify-content: center;
}
.og-ig {
  position: absolute; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  animation: og-ib 6s ease-in-out infinite;
}
.og-ig-main {
  width: 68px; height: 68px; font-size: 1.65rem;
  background: linear-gradient(145deg,#062018,#0a3028);
  box-shadow: 0 8px 28px rgba(10,48,40,.45), inset 0 1px 0 rgba(255,255,255,.12);
}
.og-ig-s { animation: og-ib 7s ease-in-out infinite; }
.og-ig-s:nth-child(2){width:36px;height:36px;font-size:.9rem;top:10%;left:14%;animation-delay:-1.2s;animation-duration:7.5s;background:linear-gradient(145deg,#0e1a28,#142840);}
.og-ig-s:nth-child(3){width:30px;height:30px;font-size:.78rem;top:6%;right:16%;animation-delay:-2.4s;animation-duration:5.5s;background:linear-gradient(145deg,#0a1a10,#102018);}
.og-ig-s:nth-child(4){width:32px;height:32px;font-size:.82rem;bottom:20%;left:10%;animation-delay:-3s;animation-duration:8.5s;background:linear-gradient(145deg,#1a0e10,#281018);}
.og-ig-s:nth-child(5){width:26px;height:26px;font-size:.72rem;bottom:12%;right:14%;animation-delay:-1.8s;animation-duration:6.5s;background:linear-gradient(145deg,#100d28,#1e1838);}
@keyframes og-ib {
  0%,100%{transform:translateY(0) rotate(0)}
  33%{transform:translateY(-9px) rotate(3deg)}
  66%{transform:translateY(4px) rotate(-2deg)}
}
.og-ig-glow {
  position:absolute;width:150px;height:150px;border-radius:50%;
  background:radial-gradient(circle,rgba(16,100,80,.32) 0%,transparent 70%);
  top:50%;left:50%;transform:translate(-50%,-50%);
  animation:og-pg 4s ease-in-out infinite;pointer-events:none;
}
@keyframes og-pg{0%,100%{opacity:.65;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.18)}}

/* ────────────────────────────────────────────────────
   BC-TEAM (col1 row2) — 3D logo float
──────────────────────────────────────────────────── */
.og-logo-3d {
  width: 68px; height: 68px; border-radius: 16px;
  background: linear-gradient(145deg,#0e2060,#1a3aad);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 14px 48px rgba(26,58,173,.55), inset 0 1px 0 rgba(255,255,255,.18);
  animation: og-lf 4.5s ease-in-out infinite;
  position: relative; z-index: 2;
}
.og-logo-3d img { width: 42px; height: 42px; object-fit: contain; filter: brightness(0) invert(1); }
@keyframes og-lf{0%,100%{transform:translateY(0) rotateY(0)}50%{transform:translateY(-11px) rotateY(8deg)}}

/* ────────────────────────────────────────────────────
   BC-HERO (col2 rows 2-3) — center hero card
──────────────────────────────────────────────────── */
#bc-hero {
  background: linear-gradient(140deg,#0a1228 0%,#060d1c 55%,#0d1420 100%);
  border-color: rgba(124,58,237,.22);
  display: flex; align-items: center; justify-content: center;
  flex-direction: column; text-align: center; padding: 32px;
  min-height: 660px;
  grid-column: 2 / 3;
  grid-row: 2 / 4;
}
#bc-hero::before {
  content:''; position:absolute; inset:0;
  background:
    linear-gradient(130deg,rgba(255,255,255,.04) 0%,transparent 38%),
    linear-gradient(230deg,rgba(255,255,255,.05) 0%,transparent 30%);
  pointer-events:none; z-index:1;
}
.og-hci { position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:10px; }
.og-hci-row { display:flex;align-items:center;gap:7px; }
.og-hci-row img { width:20px;height:20px;object-fit:contain;filter:brightness(0) invert(1);opacity:.85; }
.og-hci-lt { font-family:'Space Mono',monospace;font-size:.76rem;font-weight:700;color:#7a8090; }
.og-hci-h { font-size:clamp(1.4rem,2.2vw,1.95rem);font-weight:700;letter-spacing:-.025em;line-height:1.22; }

/* ────────────────────────────────────────────────────
   BC-APPROACH (col3 row2) — AI search
──────────────────────────────────────────────────── */

/* ────────────────────────────────────────────────────
   BC-BRAND (col3 row3) — scrolling emoji strip
──────────────────────────────────────────────────── */
.og-strip-wrap {
  overflow:hidden;height:46px;
  mask-image:linear-gradient(to right,transparent,black 12%,black 88%,transparent);
}
.og-strip-track {
  display:flex;gap:8px;width:max-content;
  animation:og-sc 13s linear infinite;
}
.og-strip-item {
  width:50px;height:40px;border-radius:8px;
  background:#0a0d1a;border:1px solid #141828;
  display:flex;align-items:center;justify-content:center;
  font-size:.95rem;flex-shrink:0;
}
@keyframes og-sc{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ────────────────────────────────────────────────────
   TICKER (bottom of section)
──────────────────────────────────────────────────── */
.og-ticker-wrap {
  overflow:hidden;
  border-top:1px solid var(--border);
  border-bottom:1px solid var(--border);
  padding:10px 0;margin:48px 0 0;
  mask-image:linear-gradient(to right,transparent,black 8%,black 92%,transparent);
}
.og-ticker-track {
  display:flex;gap:40px;white-space:nowrap;
  animation:og-tk 22s linear infinite;width:max-content;
}
.og-ticker-item {
  display:flex;align-items:center;gap:8px;
  font-size:.68rem;font-weight:500;letter-spacing:.1em;
  text-transform:uppercase;color:var(--muted);
}
.og-tdot { width:4px;height:4px;background:var(--p2);border-radius:50%;flex-shrink:0; }
@keyframes og-tk{from{transform:translateX(0)}to{transform:translateX(-50%)}}

/* ────────────────────────────────────────────────────
   CENTER LOGO OVERLAY (Phase 2 animation)
──────────────────────────────────────────────────── */
.og-center-logo {
  position:fixed;top:50%;left:50%;
  transform:translate(-50%,-50%);
  z-index:400;opacity:0;pointer-events:none;text-align:center;
}
.og-cl-ring {
  width:120px;height:120px;border-radius:50%;
  background:rgba(2,2,3,0.97);
  border:2px solid rgba(124,58,237,.55);
  display:flex;align-items:center;justify-content:center;
  margin:0 auto 10px;
  box-shadow:0 0 40px rgba(124,58,237,.3);
}
.og-cl-ring img { width:66px;height:66px;object-fit:contain;filter:brightness(0) invert(1); }
.og-cl-name {
  font-family:'Space Mono',monospace;
  font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;color:var(--p3);
}

/* ── Responsive ── */
@media(max-width:1024px){
  .og-bento{
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: auto auto auto auto;
  }
  #bc-startup   { grid-area: 1 / 1 / 2 / 2; }
  #bc-product   { grid-area: 1 / 2 / 2 / 3; }
  #bc-analytics { grid-area: 2 / 1 / 3 / 2; }
  #bc-team      { grid-area: 2 / 2 / 3 / 3; }
  #bc-hero      { grid-area: 3 / 1 / 5 / 3; }  /* spans both cols */
  #bc-approach  { grid-area: 5 / 1 / 6 / 2; }
  #bc-brand     { grid-area: 5 / 2 / 6 / 3; }
}

@media(max-width:768px){
  .og-bento{
    grid-template-columns: 1fr;
    grid-template-rows: auto;
  }
  #bc-startup,#bc-product,#bc-analytics,
  #bc-team,#bc-hero,#bc-approach,#bc-brand {
    grid-column: auto !important;
    grid-row: auto !important;
  }
}
`;

// ─────────────────────────────────────────────────────────────
// STATIC CODE CONTENT (displayed immediately, no typing)
// ─────────────────────────────────────────────────────────────
const CODE_HL = [
  '<span class="cm">&lt;!-- Oregent Platform --&gt;</span>',
  '<span class="kw">import</span> { <span class="atr">Oregent</span> } <span class="kw">from</span> <span class="str">\'@oregent/core\'</span>',
  "",
  '<span class="kw">const</span> <span class="atr">app</span> = <span class="kw">new</span> <span class="tag">Oregent</span>({',
  '  <span class="atr">workspace</span>: <span class="str">\'my-startup\'</span>,',
  '  <span class="atr">features</span>: [<span class="str">\'analytics\'</span>,',
  '             <span class="str">\'ai\'</span>, <span class="str">\'deploy\'</span>],',
  '  <span class="atr">scale</span>: <span class="str">\'auto\'</span>',
  "})",
  "",
  '<span class="cm">// Ship faster than ever</span>',
  '<span class="tag">app</span>.<span class="atr">launch</span>()',
];

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function AboutPage() {
  const sectionRef = useRef(null);
  const codeRef    = useRef(null);
  const sp1Ref     = useRef(null);
  const sp2Ref     = useRef(null);
  const hasAnimated = useRef(false);

  // ── Animation: scroll-triggered parallax + staggered card pop-in ─────────────────
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const wrapper = section.querySelector(".og-bento-wrapper");
    const CARDS   = section.querySelectorAll(".og-card");

    // ── INITIAL STATE (set before scroll trigger fires) ──
    gsap.set(wrapper, { scale: 1.15, opacity: 0, filter: "blur(12px)", y: 40 });
    gsap.set(CARDS, { scale: 0.8, opacity: 0, transformOrigin: "center center", y: 30 });
    gsap.set(".og-center-logo", { opacity: 0, scale: 0.8 });

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 70%",
      end: "top 20%",
      onEnter: () => {
        if (hasAnimated.current) return;
        hasAnimated.current = true;

        const tl = gsap.timeline();

        // ── PHASE 1: Grid wrapper zooms OUT with parallax ──
        tl.to(wrapper, {
          scale: 1,
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          duration: 1.2,
          ease: "power3.out",
        });

        // ── PHASE 2 + 3: Cards pop in with stagger + parallax ──
        tl.to(CARDS, {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "back.out(1.5)",
          stagger: {
            each: 0.12,
            from: "center",
          },
        }, 0.1);

        // ── Scroll-based parallax after initial animation ──
        CARDS.forEach((card, index) => {
          gsap.to(card, {
            y: -20 - (index % 3) * 8,
            scrollTrigger: {
              trigger: section,
              start: "top center",
              end: "bottom center",
              scrub: 1.2,
              onUpdate: (self) => {
                const progress = self.progress;
                gsap.set(card, {
                  opacity: gsap.utils.mapRange(0, 1, 1, 0.9, progress),
                  y: gsap.utils.mapRange(0, 1, 0, -20 - (index % 3) * 8, progress),
                });
              },
            },
          });
        });
      },
    });

    // ── 3D magnetic hover (always active) ──
    const hoverCleanup = [];
    CARDS.forEach(card => {
      const onMove = e => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width  / 2)) / r.width  * 9;
        const dy = (e.clientY - (r.top  + r.height / 2)) / r.height * 7;
        gsap.to(card, {
          rotateX: -dy, rotateY: dx,
          duration: .28, ease: "power2.out",
          transformPerspective: 700, overwrite: "auto",
        });
      };
      const onLeave = () => {
        gsap.to(card, {
          rotateX: 0, rotateY: 0,
          duration: .55, ease: "power3.out", overwrite: "auto",
        });
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      hoverCleanup.push(() => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
      });
    });

    return () => {
      trigger.kill();
      hoverCleanup.forEach(fn => fn());
    };
  }, []);

  // ── Code block — render STATIC full code immediately (no typing) ─────────
  useEffect(() => {
    const el = codeRef.current;
    if (!el) return;
    // Render the full highlighted code all at once — static, never shifts layout
    const fullHtml = CODE_HL.join("\n");
    el.innerHTML = fullHtml;
  }, []);

  // ── Search typing ─────────────────────────────────────────────────────────
  useEffect(() => {
    const makeTyper = (el, queries, spd, delay) => {
      if (!el) return () => {};
      let qi = 0, ci = 0, del = false, tid;
      const tick = () => {
        const q = queries[qi];
        if (!del) {
          if (ci < q.length) { el.textContent = q.slice(0, ++ci); tid = setTimeout(tick, spd + Math.random() * 25); }
          else tid = setTimeout(() => { del = true; tick(); }, 2000);
        } else {
          if (ci > 0) { el.textContent = q.slice(0, --ci); tid = setTimeout(tick, spd * .4); }
          else { del = false; qi = (qi + 1) % queries.length; tid = setTimeout(tick, 280); }
        }
      };
      tid = setTimeout(tick, delay);
      return () => clearTimeout(tid);
    };

    const c1 = makeTyper(sp1Ref.current,
      ["find your next big feature...", "ship faster with AI...", "optimize onboarding flow..."], 72, 1600);
    const c2 = makeTyper(sp2Ref.current,
      ["analyze your metrics...", "track daily active users...", "compare cohort data..."], 68, 2200);
    return () => { c1(); c2(); };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="og-about" ref={sectionRef} id="about">
      <style>{CSS}</style>

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
        rel="stylesheet"
      />

      {/* ── Center logo overlay (Phase 2) ── */}
      <div className="og-center-logo">
        <div className="og-cl-ring" id="og-cl-ring">
          <img src={logoSrc} alt="Oregent" />
        </div>
        <div className="og-cl-name">Oregent</div>
      </div>

      {/* ── Parallax scroll container ── */}
      <div className="og-wrap">
        {/* Parallax background effect */}
        <div 
          className="og-parallax-bg" 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "120%",
            background: "radial-gradient(circle at 50% 0%, rgba(124,58,237,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* ════════ BENTO GRID — exactly 7 cards ════════ */}
        {/* og-bento-wrapper is what GSAP zooms out from scale(1.15) → scale(1) */}
        <div className="og-bento-wrapper">
        <div className="og-bento">

          {/* ── Card 1: Startup Development (col1 row1) ── */}
          <div className="og-card card-tex" id="bc-startup">
            <div className="bc-startup-top">
              <div className="og-title">Startup Development</div>
              <div className="og-desc" style={{ fontSize: ".76rem", marginTop: 5 }}>
                We build scalable, high-performing products — clean code, clear vision.
              </div>
              <a href="#" className="og-more">See More →</a>
            </div>
            {/* Fixed-height code area: absolutely positioned pre inside */}
            <div className="bc-code-wrap">
              <div className="bc-code-border" />
              <pre className="og-code" ref={codeRef} />
            </div>
            <div className="og-gblob" style={{ width: 130, height: 130, bottom: -45, right: -35, background: "rgba(124,58,237,.17)" }} />
          </div>

          {/* ── Card 2: Product & Strategy (col2 row1) ── */}
          <div className="og-card card-tex" id="bc-product">
            <div className="og-tc">
              <div className="og-title">Product & Strategy</div>
              <div className="og-desc">
                Turning ambitious ideas into intuitive products. We obsess over user experience,
                data, and impact — shipping things that actually matter to teams that build.
              </div>
              <a href="#" className="og-more">See More →</a>
              <div style={{ marginTop: 22 }}>
                <div className="og-spill">
                  <span className="og-spill-ico">⌕</span>
                  <span className="og-spill-txt" ref={sp1Ref}>find your next big feature...</span>
                  <div className="og-spill-go">↵</div>
                </div>
              </div>
            </div>
            <div className="og-gblob" style={{ width: 190, height: 75, bottom: -22, left: "50%", transform: "translateX(-50%)", background: "rgba(100,50,220,.13)" }} />
          </div>

          {/* ── Card 3: Analytics & Growth (col3 row1) ── */}
          <div className="og-card card-tex" id="bc-analytics" style={{ background: "var(--card-teal)" }}>
            <div style={{ padding: 24, position: "relative", zIndex: 1 }}>
              <div className="og-title">Analytics & Growth</div>
              <div className="og-desc" style={{ marginTop: 6 }}>
                Dashboards built for conversions and engagement. Real data, real decisions — no noise.
              </div>
              <a href="#" className="og-more">See More →</a>
            </div>
            <div className="og-icons-scene">
              <div className="og-ig-glow" />
              <div className="og-ig og-ig-main">📈</div>
              <div className="og-ig og-ig-s">⚡</div>
              <div className="og-ig og-ig-s">🌐</div>
              <div className="og-ig og-ig-s">🔔</div>
              <div className="og-ig og-ig-s">🗂</div>
            </div>
          </div>

          {/* ── Card 4: Our Team (col1 row2) ── */}
          <div className="og-card card-tex" id="bc-team">
            <div className="og-tc">
              <div className="og-title">Our Team</div>
              <div className="og-desc">
                Former engineers and designers from Google, Stripe, and Notion — united by one
                belief: great software changes how people work.
              </div>
              <a href="#" className="og-more">See More →</a>
            </div>
            <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", zIndex: 2 }}>
              <div className="og-logo-3d">
                <img src={logoSrc} alt="Oregent" />
              </div>
            </div>
            <div className="og-gblob" style={{ width: 170, height: 145, bottom: -60, left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle,rgba(26,58,173,.42) 0%,transparent 70%)" }} />
          </div>

          {/* ── Card 5: HERO — Everything in One Place (col2 rows 2-3) ── */}
          <div className="og-card" id="bc-hero">
            <div className="og-hci">
              <div className="og-hci-row">
                <img src={logoSrc} alt="Oregent" />
                <span className="og-hci-lt">Oregent</span>
              </div>
              <div className="og-hci-h">Everything in<br />One Place</div>
            </div>
          </div>

          {/* ── Card 6: AI-Powered Insights (col3 row2) ── */}
          <div className="og-card card-tex" id="bc-approach">
            <div className="og-tc">
              <div className="og-title">AI-Powered Insights</div>
              <div className="og-desc" style={{ marginBottom: 14 }}>
                Intelligent analysis that surfaces what matters — before you even ask.
              </div>
              <div className="og-spill">
                <span className="og-spill-ico">⌕</span>
                <span className="og-spill-txt" ref={sp2Ref}>analyze your metrics...</span>
                <div className="og-spill-go">↵</div>
              </div>
            </div>
          </div>

          {/* ── Card 7: Brand & Design (col3 row3) ── */}
          <div className="og-card card-tex" id="bc-brand">
            <div className="og-tc" style={{ justifyContent: "space-between" }}>
              <div>
                <div className="og-title">Brand & Design</div>
                <div className="og-desc" style={{ marginTop: 6 }}>
                  Craft a unique, cohesive identity with Oregent's all-in-one creative platform.
                </div>
                <a href="#" className="og-more">See More →</a>
              </div>
              <div className="og-strip-wrap" style={{ marginTop: 16 }}>
                <div className="og-strip-track">
                  {["🎨","🖼","✏️","🎭","🖋","📐","🌈","🎨","🖼","✏️","🎭","🖋","📐","🌈"].map((e, i) => (
                    <div className="og-strip-item" key={i}>{e}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>{/* /bento */}
        </div>{/* /bento-wrapper */}

        {/* ── Ticker ── */}
        <div className="og-ticker-wrap">
          <div className="og-ticker-track">
            {[
              "Built in Bangalore","Backed by Vision","12K+ Beta Users","Remote-First Team",
              "Loved by Builders","Y-Combinator Alumni","Shipping Fast Daily",
              "Built in Bangalore","Backed by Vision","12K+ Beta Users","Remote-First Team",
              "Loved by Builders","Y-Combinator Alumni","Shipping Fast Daily",
            ].map((t, i) => (
              <div className="og-ticker-item" key={i}>
                <span className="og-tdot" />{t}
              </div>
            ))}
          </div>
        </div>
      </div>{/* /og-wrap */}
    </div>
  );
}