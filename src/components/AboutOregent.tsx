/**
 * AboutPage — Oregent About Section (Definitive Version)
 *
 * Grid: 3 columns, NO spanning
 *   Col1: A (50%) + D (50%)
 *   Col2: B (33%) + E (33%) + G (33%)
 *   Col3: C (50%) + F (50%)
 *
 * Animation sequence:
 *   1. Wrapper fades in
 *   2. Hero card (E) zooms out from scale(3.5) → center position over 2s
 *   3. Remaining cards pop up staggered center→outward with blur+scale+spring
 *   4. Animated rotating border glow sweep on each card
 *   5. Light sweep diagonal glint across each card
 *   6. Ambient purple glow pulses on hero card
 *   7. Sonar ping radial pulse on hero card
 *
 * Card layout (after all swaps):
 *   A = Startup Development (col1 top)
 *   B = Analytics & Growth (col2 top) — no orbit, text only
 *   C = Product & Strategy (col3 top) — search pill with shimmer
 *   D = Our Team (col1 bottom) — orbit animation around logo
 *   E = Hero / Everything in One Place (col2 center) — sonar ping
 *   F = Oregent Teach (col3 bottom) — counter ticker, hover-reverse scroll
 *   G = AI-Powered Insights (col2 bottom) — thinking dots, scrolling strip
 *
 * Features:
 *   - No emojis — all SVG icons and logo-based visuals
 *   - No "See More" links
 *   - Capitalized first letters in search queries
 *   - Thinking dots animation before each typed query
 *   - Counter ticker animating to 160+ on card G enter
 *   - Hover-reverse scroll on strip
 *   - 3D hover tilt on all cards
 */

import { useEffect, useRef, useState, useCallback } from "react";

const logoSrc = "/oregent-logo.png";

/* ═══════════════════════════════════════════
   CSS — all animation via keyframes
   ═══════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

.og-about *, .og-about *::before, .og-about *::after {
  box-sizing: border-box; margin: 0; padding: 0;
}
.og-about {
  --bg:     #000000;
  --card:   #0a0a0b;
  --border: rgba(255,255,255,0.08);
  --text:   #ffffff;
  --muted:  #9ca3af;
  --purple: #7c3aed;
  --blue:   #3b82f6;
  color: var(--text);
  background: var(--bg);
  padding: 80px 24px 60px;
  position: relative;
  overflow: hidden;
}
.og-about::before {
  content: '';
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
}
.og-wrap { max-width: 1200px; margin: 0 auto; position: relative; z-index: 1; }

/* ═══════════════════════════════════════
   ZOOM WRAPPER — Simple immediate fade
   ═══════════════════════════════════════ */
.og-zoom {
  opacity: 0;
  will-change: opacity;
}
.og-zoom.og-anim {
  animation: fastFade 0.2s forwards;
}
@keyframes fastFade {
  to { opacity: 1; }
}

/* ═══════════════════════════════════════
   BENTO GRID — 3 cols, 6-row trick
   Side cols: 2 cards × 3 rows each = 50%
   Center col: 3 cards × 2 rows each = 33%
   ═══════════════════════════════════════ */
.og-bento {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: repeat(6, 1fr);
  gap: 8px;
  height: 790px;
}

/* Col 1 — 50/50 */
.og-c-a { grid-column: 1; grid-row: 1 / 4; }
.og-c-d { grid-column: 1; grid-row: 4 / 7; }

/* Col 2 — 33/33/33 */
.og-c-b { grid-column: 2; grid-row: 1 / 3; }
.og-c-e { grid-column: 2; grid-row: 3 / 5; }
.og-c-g { grid-column: 2; grid-row: 5 / 7; }

/* Col 3 — 50/50 */
.og-c-c { grid-column: 3; grid-row: 1 / 4; }
.og-c-f { grid-column: 3; grid-row: 4 / 7; }

/* ═══════════════════════════════════════
   CARD BASE
   ═══════════════════════════════════════ */
.og-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  will-change: transform, opacity, filter;
  transition: border-color .3s;
}
.og-card:hover { border-color: rgba(255,255,255,.16); }

/* ═══════════════════════════════════════
   ANIMATED BORDER GLOW SWEEP
   Rotating conic gradient traces card edges
   ═══════════════════════════════════════ */
.og-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 21px;
  padding: 1px;
  background: conic-gradient(
    from var(--border-angle, 0deg),
    transparent 0%,
    transparent 25%,
    rgba(124, 58, 237, 0.5) 30%,
    rgba(59, 130, 246, 0.6) 35%,
    rgba(124, 58, 237, 0.5) 40%,
    transparent 45%,
    transparent 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  z-index: 10;
  pointer-events: none;
  transition: opacity 0.6s;
}
.og-anim .og-card::before {
  animation: borderSweep 4s linear infinite;
  opacity: 0;
}
.og-anim .og-card.og-card-visible::before {
  opacity: 1;
  transition: opacity 1s 0.3s;
}
@property --border-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@keyframes borderSweep {
  to { --border-angle: 360deg; }
}

/* ═══════════════════════════════════════
   HERO CARD ZOOM OUT
   Centre card covers 3/4 screen then zooms to position
   ═══════════════════════════════════════ */
.og-c-e {
  transform-origin: center center;
  z-index: 50;
  opacity: 0;
  overflow: visible !important;
}
.og-anim .og-c-e {
  animation: heroZoomOut 2.0s cubic-bezier(0.16, 1, 0.3, 1) both !important;
}
@keyframes heroZoomOut {
  0%   { transform: scale(3.5); opacity: 0; filter: blur(20px); box-shadow: 0 40px 100px rgba(0,0,0,0.8); }
  10%  { opacity: 1; }
  100% { transform: scale(1); opacity: 1; filter: blur(0px); box-shadow: none; }
}

/* ═══════════════════════════════════════
   OTHER CARDS POP UP — staggered after hero settles
   ═══════════════════════════════════════ */
.og-card:not(.og-c-e) {
  opacity: 0;
  transform: translateY(160px);
}
.og-anim .og-card:not(.og-c-e) {
  animation: cardSlowPop 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.og-anim .og-c-b { animation-delay: 1.0s !important; }
.og-anim .og-c-g { animation-delay: 1.15s !important; }
.og-anim .og-c-a { animation-delay: 1.3s !important; }
.og-anim .og-c-d { animation-delay: 1.45s !important; }
.og-anim .og-c-c { animation-delay: 1.6s !important; }
.og-anim .og-c-f { animation-delay: 1.75s !important; }

@keyframes cardSlowPop {
  0%   { transform: translateY(180px) scale(0.9); opacity: 0; filter: blur(14px); }
  100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0px); }
}

/* Flowchart Popup Animation */
@keyframes flowPop {
  0% { transform: translateY(-15px) scale(0.8); opacity: 0; filter: blur(4px); }
  100% { transform: translateY(0) scale(1); opacity: 1; filter: blur(0px); }
}
.og-flow-item {
  opacity: 0;
}
.og-anim .og-flow-item {
  animation: flowPop 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.og-anim .og-flow-item:nth-child(1) { animation-delay: 5.0s; }
.og-anim .og-flow-item:nth-child(2) { animation-delay: 5.2s; }
.og-anim .og-flow-item:nth-child(3) { animation-delay: 5.4s; }
.og-anim .og-flow-item:nth-child(4) { animation-delay: 5.6s; }
.og-anim .og-flow-item:nth-child(5) { animation-delay: 5.8s; }
.og-anim .og-flow-item:nth-child(6) { animation-delay: 6.0s; }
.og-anim .og-flow-item:nth-child(7) { animation-delay: 6.2s; }
  opacity: 1;
  transform: none;
}

/* Mouse-tracking glow */
.og-card-glow {
  position: absolute; inset: 0; border-radius: 20px;
  background: radial-gradient(500px circle at var(--gx,50%) var(--gy,50%),
    rgba(124,58,237,.08), transparent 40%);
  pointer-events: none; z-index: 0;
  opacity: 0; transition: opacity .4s;
}
.og-card:hover .og-card-glow { opacity: 1; }

/* Dot texture */
.og-tex::after {
  content: ''; position: absolute; inset: 0;
  background-image: radial-gradient(rgba(255,255,255,.018) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none; border-radius: 20px; z-index: 0;
}

/* ═══ TEXT ═══ */
.og-inner { padding: 28px; position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; }
.og-title { font-size: 1.1rem; font-weight: 700; letter-spacing: -.02em; margin-bottom: 10px; line-height: 1.25; }
.og-desc  { font-size: 0.95rem; color: var(--muted); line-height: 1.7; }

/* ═══ DEV — code block (Card A) ═══ */
.og-c-a { display: flex; flex-direction: column; }
.og-c-a .og-inner { padding-bottom: 14px; flex-shrink: 0; border-bottom: 1px solid var(--border); height: auto; }
.og-code-area { flex: 1; position: relative; overflow: hidden; }
.og-code-border {
  position: absolute; inset: 10px;
  border: 1px solid rgba(86,156,214,.15);
  border-radius: 8px; background: rgba(86,156,214,.02);
  pointer-events: none;
}
pre.og-code {
  position: absolute; inset: 10px;
  font-family: 'Space Mono', monospace;
  font-size: .6rem; line-height: 1.8; color: #5a6a7a;
  white-space: pre; padding: 12px 14px;
  overflow: hidden; pointer-events: none;
}
.kw  { color: #c586c0; }
.tag { color: #569cd6; }
.atr { color: #9cdcfe; }
.str { color: #ce9178; }
.cm  { color: #4a6a4a; }
.pn  { color: #d4d4d4; }
.og-cur {
  display: inline-block; width: 2px; height: 10px;
  background: #569cd6; vertical-align: middle; margin-left: 1px;
  animation: blink .85s step-end infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

/* ═══ Search pill (Card C — Product & Strategy) ═══ */
.og-search-wrap { margin-top: auto; padding-top: 28px; position: relative; z-index: 1; }
.og-search-glow {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
  width: 280px; height: 60px; border-radius: 50%;
  background: radial-gradient(circle, rgba(124,58,237,.3) 0%, transparent 70%);
  filter: blur(18px); pointer-events: none;
}
.og-search {
  display: flex; align-items: center; gap: 10px;
  background: rgba(10,10,20,.9);
  border: 1px solid rgba(124,58,237,.25);
  border-radius: 50px; padding: 10px 16px;
  position: relative; z-index: 1;
  box-shadow: 0 0 20px rgba(124,58,237,.12), inset 0 0 16px rgba(124,58,237,.08);
  overflow: hidden;
}
/* Shimmer sweep across search pill border */
.og-search::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 50px;
  padding: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 30%,
    rgba(124,58,237,0.6) 45%,
    rgba(59,130,246,0.7) 50%,
    rgba(124,58,237,0.6) 55%,
    transparent 70%,
    transparent 100%
  );
  background-size: 200% 100%;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  animation: pillShimmer 2.5s linear infinite;
  pointer-events: none;
  z-index: 2;
}
@keyframes pillShimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.og-search-txt { font-size: .78rem; color: var(--muted); flex: 1; min-height: 1.2em; }
/* Thinking dots — 3 dots pulsing before next query */
.og-thinking-dots {
  display: inline-flex; gap: 3px; align-items: center;
}
.og-thinking-dots span {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--purple);
  animation: dotPulse 1.2s ease-in-out infinite;
}
.og-thinking-dots span:nth-child(2) { animation-delay: 0.2s; }
.og-thinking-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotPulse {
  0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1.3); }
}
.og-search-icons { display: flex; align-items: center; gap: 6px; }
.og-search-icon {
  width: 24px; height: 24px; border-radius: 6px;
  background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
  display: flex; align-items: center; justify-content: center;
  font-size: .6rem; color: #555;
}
.og-search-icon svg { width: 12px; height: 12px; stroke: #555; fill: none; }
.og-search-btn {
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1);
  display: flex; align-items: center; justify-content: center;
}
.og-search-btn svg { width: 14px; height: 14px; stroke: #888; fill: none; }

/* ═══ Orbit animation (Card D — Our Team) ═══ */
.og-orbit-scene {
  position: absolute; bottom: 0; left: 0; right: 0; top: 35%;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.og-orbit-center {
  width: 72px; height: 72px;
  display: flex; align-items: center; justify-content: center;
  position: relative; z-index: 3;
}
.og-orbit-center img { width: 40px; height: 40px; object-fit: contain; filter: brightness(0) invert(1); }
.og-orbit-ring {
  position: absolute; border-radius: 50%;
  border: 1px solid rgba(255,255,255,.06);
  top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none;
}
.og-orbit-ring-1 { width: 160px; height: 160px; }
.og-orbit-ring-2 { width: 260px; height: 260px; }
/* Data pulse ring — expanding ring for analytics feel */
.og-orbit-ring-1::after,
.og-orbit-ring-2::after {
  content: '';
  position: absolute; inset: -2px;
  border-radius: 50%;
  border: 1px solid rgba(124,58,237,0.3);
  animation: dataPulseRing 3s ease-out infinite;
  opacity: 0;
}
.og-orbit-ring-2::after { animation-delay: 1.5s; }
@keyframes dataPulseRing {
  0%   { transform: scale(0.95); opacity: 0.6; border-color: rgba(124,58,237,0.5); }
  50%  { opacity: 0.2; }
  100% { transform: scale(1.2); opacity: 0; border-color: rgba(59,130,246,0.1); }
}
/* Mini orbit icons — SVG-based */
.og-orbit-icon {
  position: absolute; border-radius: 50%;
  width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,.4); z-index: 2;
}
.og-orbit-icon svg { width: 16px; height: 16px; stroke: rgba(255,255,255,0.6); fill: none; }
/* Removed svgs for team card, added logo rotation keyframe */
@keyframes spinLogo { 100% { transform: rotate(360deg); } }
.og-orbit-center img { width: 40px; height: 40px; object-fit: contain; filter: brightness(0) invert(1); animation: spinLogo 8s linear infinite; }
.og-orbit-glow {
  position: absolute; width: 180px; height: 180px; border-radius: 50%;
  background: radial-gradient(circle, rgba(26,58,173,.35) 0%, transparent 70%);
  top: 50%; left: 50%; transform: translate(-50%,-50%);
  pointer-events: none; animation: pulse 4s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:.6;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.15)} }

/* ═══ HERO — center card (Card E) ═══ */
.og-c-e {
  background: linear-gradient(140deg,#0a1228,#060d1c 55%,#0d1420);
  border-color: rgba(124,58,237,.18);
  display: flex; align-items: center; justify-content: center;
  text-align: center; padding: 32px;
}
.og-c-e::after {
  content: ''; position: absolute; inset: 0; border-radius: 20px;
  background:
    linear-gradient(130deg,rgba(255,255,255,.04) 0%,transparent 38%),
    linear-gradient(230deg,rgba(255,255,255,.04) 0%,transparent 30%);
  pointer-events: none;
}

/* Hero ambient glow */
.og-hero-glow {
  position: absolute; inset: 0; border-radius: 20px;
  background: radial-gradient(ellipse at 50% 60%,
    rgba(124,58,237,.12) 0%,
    rgba(59,130,246,.06) 30%,
    transparent 70%);
  pointer-events: none; z-index: 0;
  animation: heroGlow 3.5s ease-in-out infinite;
}
@keyframes heroGlow {
  0%,100% { opacity: .5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.08); }
}

/* Hero orbit logo animation imported from LoadingScreen */
.og-ls-ring {
  position: absolute; border-radius: 50%;
  border: 1px solid rgba(124,58,237,0.2);
  top: 50%; left: 50%;
  transform: translate(-50%,-50%);
  pointer-events: none;
}
.og-ls-ring-1 { width: 180px; height: 180px; animation: pulseRing 2s ease-out infinite; }
.og-ls-ring-2 { width: 200px; height: 200px; animation: pulseRing 2s ease-out infinite 0.6s; border-color: rgba(59,130,246,0.2); }
.og-ls-ring-3 { width: 220px; height: 220px; animation: pulseRing 2s ease-out infinite 1.2s; border-color: rgba(124,58,237,0.1); }
@keyframes pulseRing {
  0% { transform: translate(-50%,-50%) scale(0.8); opacity: 0.8; border-width: 2px; }
  100% { transform: translate(-50%,-50%) scale(1.5); opacity: 0; border-width: 1px; }
}
.og-ls-word-orbit { position: absolute; inset: -30px; pointer-events: none; animation: spinLogo 30s linear infinite; }
.og-ls-logo { position: absolute; width: 250px; height: 250px; object-fit: contain; filter: brightness(0) invert(1); z-index: 1; animation: spinLogo 40s linear infinite; opacity: 0.08; }
.og-orbit-word { font-size: 13px; font-weight: 700; letter-spacing: 2px; color: #fff; opacity: 0.4; white-space: pre; }

.og-hero-inner { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.og-hero-badge { display: flex; align-items: center; gap: 7px; margin-bottom: 4px; }
.og-hero-badge img { width: 26px; height: 26px; object-fit: contain; filter: brightness(0) invert(1); opacity: .85; }
.og-hero-label { font-family: 'Space Mono', monospace; font-size: .8rem; font-weight: 700; color: #6a7080; }
.og-hero-title { font-size: clamp(1.2rem,1.8vw,1.7rem); font-weight: 700; letter-spacing: -.025em; line-height: 1.15; }

/* ═══ Oregent Teach (Card F) ═══ */
.og-brand-grid {
  display: grid; grid-template-columns: repeat(4,1fr);
  gap: 6px; margin-top: 20px;
}
.og-brand-item {
  aspect-ratio: 1; border-radius: 10px;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
  display: flex; align-items: center; justify-content: center;
  transition: transform .2s, border-color .2s;
  overflow: hidden;
}
.og-brand-item img {
  width: 22px; height: 22px; object-fit: contain;
  filter: brightness(0) invert(1); opacity: 0.5;
  transition: opacity .3s;
}
.og-brand-item svg {
  width: 18px; height: 18px;
  stroke: rgba(255,255,255,0.5); fill: none;
  transition: stroke .3s;
}
.og-brand-item:hover { transform: scale(1.05); border-color: rgba(124,58,237,.25); }
.og-brand-item:hover img { opacity: 0.8; }
.og-brand-item:hover svg { stroke: rgba(255,255,255,0.8); }

/* Counter ticker for Oregent Teach (Centered) */
.og-counter-wrap {
  display: flex; align-items: baseline; justify-content: center; gap: 6px; margin: 20px 0;
}
.og-counter-num {
  font-family: 'Space Mono', monospace;
  font-size: 3rem; font-weight: 800;
  background: linear-gradient(135deg, var(--purple), var(--blue));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.og-counter-label {
  font-size: .6rem; color: var(--muted); font-weight: 500;
  text-transform: uppercase; letter-spacing: .08em;
  line-height: 1;
}

/* ═══ Scrolling strip (Card G — AI-Powered Insights) ═══ */
.og-strip-wrap {
  overflow: hidden; height: 42px; margin-top: 18px;
  mask-image: linear-gradient(to right,transparent,black 12%,black 88%,transparent);
}
.og-strip-track { display: flex; gap: 6px; width: max-content; animation: sc 14s linear infinite; }
/* Hover reverse scroll */
.og-strip-wrap[data-hovered="true"] .og-strip-track {
  animation-direction: reverse;
}
.og-strip-chip {
  width: 46px; height: 36px; border-radius: 8px;
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.06);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.og-strip-chip svg {
  width: 16px; height: 16px; stroke: rgba(255,255,255,0.35); fill: none;
}
@keyframes sc { from{transform:translateX(0)} to{transform:translateX(-50%)} }

/* ═══ TICKER ═══ */
.og-ticker-wrap {
  overflow: hidden;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  padding: 10px 0; margin: 48px 0 0;
  mask-image: linear-gradient(to right,transparent,black 8%,black 92%,transparent);
}
.og-ticker-track { display: flex; gap: 40px; white-space: nowrap; animation: tk 22s linear infinite; width: max-content; }
.og-ticker-item {
  display: flex; align-items: center; gap: 8px;
  font-size: .68rem; font-weight: 500; letter-spacing: .1em;
  text-transform: uppercase; color: var(--muted);
}
.og-ticker-dot { width: 4px; height: 4px; background: var(--purple); border-radius: 50%; flex-shrink: 0; }
@keyframes tk { from{transform:translateX(0)} to{transform:translateX(-50%)} }

/* ═══ LIGHT SWEEP — diagonal glint across grid ═══ */
.og-light-sweep {
  position: absolute; inset: 0; pointer-events: none; z-index: 20;
  border-radius: 20px;
  overflow: hidden;
}
.og-light-sweep::after {
  content: '';
  position: absolute;
  top: 0; left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    105deg,
    transparent 0%,
    transparent 40%,
    rgba(255,255,255,.03) 45%,
    rgba(255,255,255,.06) 50%,
    rgba(255,255,255,.03) 55%,
    transparent 60%,
    transparent 100%
  );
  opacity: 0;
}
.og-anim .og-card.og-card-visible .og-light-sweep::after {
  animation: lightSweep 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}
.og-anim .og-c-e .og-light-sweep::after { animation-delay: 3.5s !important; }
.og-anim .og-c-b .og-light-sweep::after { animation-delay: 3.8s !important; }
.og-anim .og-c-g .og-light-sweep::after { animation-delay: 4.1s !important; }
.og-anim .og-c-a .og-light-sweep::after { animation-delay: 4.3s !important; }
.og-anim .og-c-d .og-light-sweep::after { animation-delay: 4.4s !important; }
.og-anim .og-c-c .og-light-sweep::after { animation-delay: 4.6s !important; }
.og-anim .og-c-f .og-light-sweep::after { animation-delay: 4.8s !important; }

@keyframes lightSweep {
  0%   { left: -100%; opacity: 1; }
  100% { left: 180%; opacity: 0; }
}

/* Responsive */
@media(max-width:860px){
  .og-bento {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    height: auto; gap: 8px;
  }
  .og-c-a,.og-c-b,.og-c-c,.og-c-d,.og-c-e,.og-c-f,.og-c-g {
    grid-column: 1 !important;
    grid-row: auto !important;
    min-height: 240px;
  }
}
`;

/* ═══ SVG ICONS — formal replacements for emojis ═══ */
const SvgIcons = {
  close: <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  mic: <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>,
  camera: <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  search: <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  chart: <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  bolt: <svg viewBox="0 0 24 24" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  link: <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  message: <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  code: <svg viewBox="0 0 24 24" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  pen: <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>,
  grid: <svg viewBox="0 0 24 24" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  cpu: <svg viewBox="0 0 24 24" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>,
  star: <svg viewBox="0 0 24 24" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  globe: <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  brain: <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4 4 4 0 0 1-1.2 2.85A5 5 0 0 1 17 13a5 5 0 0 1-2 4 3 3 0 0 1-3 5 3 3 0 0 1-3-5 5 5 0 0 1-2-4 5 5 0 0 1 2.2-4.15A4 4 0 0 1 8 6a4 4 0 0 1 4-4z"/><line x1="12" y1="2" x2="12" y2="22"/></svg>,
  shield: <svg viewBox="0 0 24 24" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  target: <svg viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  layers: <svg viewBox="0 0 24 24" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
};

/* ═══ CODE LINES (Card A typing animation) ═══ */
const CODE_LINES = [
  '<span class="cm">// Initialize Orehack Platform</span>',
  '<span class="kw">import</span> { <span class="tag">OrehackApp</span>, <span class="tag">AI</span>, <span class="tag">Evaluation</span> } <span class="kw">from</span> <span class="str">\'@orehack/core\'</span>;',
  '<span class="kw">import</span> { <span class="tag">BuilderTools</span> } <span class="kw">from</span> <span class="str">\'@orehack/engine\'</span>;',
  '',
  '<span class="kw">const</span> <span class="atr">startup</span> = <span class="kw">new</span> <span class="tag">OrehackApp</span>({',
  '  <span class="atr">name</span>: <span class="str">\'Orehack\'</span>,',
  '  <span class="atr">mission</span>: <span class="str">\'Automating hackathon eval with AI\'</span>,',
  '  <span class="atr">modules</span>: [',
  '    <span class="kw">new</span> <span class="tag">AI</span>({ <span class="atr">model</span>: <span class="str">\'agentic-evaluator-v1\'</span> }),',
  '    <span class="kw">new</span> <span class="tag">Evaluation</span>({ <span class="atr">realtime</span>: <span class="kw">true</span> }),',
  '    <span class="kw">new</span> <span class="tag">BuilderTools</span>({ <span class="atr">scalable</span>: <span class="kw">true</span> }),',
  '  ],',
  '});',
  '',
  '<span class="kw">await</span> <span class="atr">startup</span>.<span class="tag">deployToProduction</span>();',
  '<span class="tag">console</span>.<span class="tag">log</span>(<span class="str">\'Orehack Systems Online. Let us build.\'</span>);'
];

/* ═══ BENTO CARD WRAPPER ═══ */
function BentoCard({
  children, className = "", delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), (delay + 0.85) * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    el.style.transform = `perspective(800px) rotateX(${-dy * 5}deg) rotateY(${dx * 7}deg) scale(1.01)`;
    const g = el.querySelector(".og-card-glow") as HTMLElement;
    if (g) {
      g.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
      g.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
    }
  }, []);

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (el) el.style.transform = "";
  }, []);

  return (
    <div
      ref={ref}
      className={`og-card ${className}${visible ? " og-card-visible" : ""}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="og-light-sweep" />
      <div className="og-card-glow" />
      {children}
    </div>
  );
}

export default function AboutOregent() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const searchRef = useRef<HTMLSpanElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    let tid: ReturnType<typeof setTimeout>;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tid = setTimeout(() => setStarted(true), 100);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => {
      clearTimeout(tid);
      io.disconnect();
    };
  }, []);

  /* ── High-sensitivity Scroll Snap (Splash Effect) ── */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let isSnapping = false;
    let snapTimeout: ReturnType<typeof setTimeout>;

    const handleScrollSnap = (deltaY: number) => {
      if (isSnapping) return;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // If scrolling down AND the top of the section is coming into the viewport (bottom 60%)
      if (deltaY > 0 && rect.top <= windowHeight && rect.top > windowHeight * 0.15) {
        isSnapping = true;
        const absoluteTop = rect.top + window.scrollY;
        
        // Use smooth scrollTo to snap the view
        window.scrollTo({
          top: absoluteTop,
          behavior: 'smooth'
        });

        // 1.5s cooldown to let the smooth scroll finish
        snapTimeout = setTimeout(() => {
          isSnapping = false;
        }, 1200);
      }
    };

    const onWheel = (e: WheelEvent) => handleScrollSnap(e.deltaY);
    
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY; // positive = scrolling down
      handleScrollSnap(deltaY);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    return () => {
      clearTimeout(snapTimeout);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  /* ── Code block (Card A) - dynamic character typing ── */
  useEffect(() => {
    let alive = true;
    const el = codeRef.current;
    if (!el || !started) return;
    
    // Tokenize HTML versus pure characters to type smoothly over spans
    const fullHtml = CODE_LINES.join('\n');
    const tokens: string[] = [];
    let temp = "";
    let inTag = false;
    for (let i = 0; i < fullHtml.length; i++) {
      if (fullHtml[i] === '<') { inTag = true; temp += '<'; }
      else if (fullHtml[i] === '>') { inTag = false; temp += '>'; tokens.push(temp); temp = ""; }
      else if (inTag) { temp += fullHtml[i]; }
      else { tokens.push(fullHtml[i]); }
    }

    let idx = 0;
    const typeTokens = () => {
      if (!alive) return;
      if (idx >= tokens.length) {
        if (el) el.innerHTML = tokens.join('') + '<span class="og-cur"></span>';
        setTimeout(() => {
          if (alive) {
            idx = 0;
            if (el) el.innerHTML = '';
            typeTokens();
          }
        }, 3500); // Loop infinitely
        return;
      }
      idx++;
      if (el) el.innerHTML = tokens.slice(0, idx).join('') + '<span class="og-cur"></span>';
      
      const isTag = tokens[idx - 1] && tokens[idx - 1].startsWith('<');
      // If it’s an HTML tag, type it instantly (0ms), otherwise type like a fast keyboard
      setTimeout(typeTokens, isTag ? 0 : 20 + Math.random() * 30);
    };
    
    el.innerHTML = '';
    const startTimer = setTimeout(typeTokens, 600);
    return () => { alive = false; clearTimeout(startTimer); };
  }, [started]);

  /* ── Search typing with thinking dots (Card C) ── */
  useEffect(() => {
    if (!started) return;
    const el = searchRef.current;
    if (!el) return;
    const queries = ["Deploy Pipeline...", "Automate Testing Workflow...", "Product Roadmap Analysis..."];
    let qi = 0, ci = 0, del = false, thinking = false;
    let tid: ReturnType<typeof setTimeout>;
    const tick = () => {
      const q = queries[qi];
      if (thinking) {
        el.innerHTML = '<span class="og-thinking-dots"><span></span><span></span><span></span></span>';
        tid = setTimeout(() => {
          thinking = false;
          el.textContent = "";
          tick();
        }, 800);
        return;
      }
      if (!del) {
        if (ci < q.length) { el.textContent = q.slice(0, ++ci); tid = setTimeout(tick, 75 + Math.random() * 20); }
        else tid = setTimeout(() => { del = true; tick(); }, 2200);
      } else {
        if (ci > 0) { el.textContent = q.slice(0, --ci); tid = setTimeout(tick, 26); }
        else { del = false; qi = (qi + 1) % queries.length; thinking = true; tid = setTimeout(tick, 200); }
      }
    };
    tid = setTimeout(tick, 1600);
    return () => clearTimeout(tid);
  }, [started]);

  /* ── Counter ticker (Card F — Oregent Teach) ── */
  useEffect(() => {
    if (!started) return;
    const el = counterRef.current;
    if (!el) return;
    const target = 160;
    let current = 0;
    let alive = true;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    const interval = duration / steps;
    const countUp = () => {
      if (!alive) return;
      current += increment;
      if (current >= target) {
        el.textContent = "160+";
        return;
      }
      el.textContent = Math.floor(current).toString();
      setTimeout(countUp, interval);
    };
    const t = setTimeout(countUp, 1750);
    return () => { alive = false; clearTimeout(t); };
  }, [started]);

  /* ── Strip hover handlers (Card G) ── */
  const onStripEnter = useCallback(() => {
    if (stripRef.current) stripRef.current.setAttribute("data-hovered", "true");
  }, []);
  const onStripLeave = useCallback(() => {
    if (stripRef.current) stripRef.current.setAttribute("data-hovered", "false");
  }, []);

  /* ═══════════════════════════════════════════
     JSX
     ═══════════════════════════════════════════ */
  return (
    <div className="og-about" ref={sectionRef} id="about">
      <style>{CSS}</style>
      <div className="og-wrap">
        <div ref={triggerRef} style={{ position: 'absolute', top: '400px', left: 0, width: '1px', height: '1px' }} />

        <div className={`og-zoom${started ? " og-anim" : ""}`}>
          <div className="og-bento">

            {/* ═══ A — Startup Development (col1 top, 50%) ═══ */}
            <BentoCard className="og-c-a og-tex" delay={0.36}>
              <div className="og-inner">
                <div className="og-title">Startup Development</div>
                <div className="og-desc">Build scalable and high-performing products with clean code.</div>
              </div>
              <div className="og-code-area">
                <div className="og-code-border" />
                <pre className="og-code" ref={codeRef} />
              </div>
            </BentoCard>

            {/* ═══ B — Analytics & Growth (col2 top, 33%) ═══ */}
            <BentoCard className="og-c-b og-tex" delay={0.22}>
              <div className="og-inner">
                <div className="og-title">Analytics &amp; Growth</div>
                <div className="og-desc">Real-time dashboards built for decisions, not decoration. We build data science and AI analytics systems that surface what actually matters - grounded, explainable, and deployable. Connect your tools, surface insights, and ship faster without the noise.</div>
              </div>
            </BentoCard>

            {/* ═══ C — Oregent Teach (Swapped to col3 top) ═══ */}
            <BentoCard className="og-c-c og-tex" delay={0.44}>
              <div className="og-inner">
                <div className="og-title">Oregent Teach</div>
                <div className="og-desc">Oregent Teach (formerly EyeQ) - practical, project-based technical education, 40 active students.</div>
                
                <div className="og-counter-wrap" style={{ marginTop: 'auto', paddingBottom: '20px' }}>
                  <span className="og-counter-num" ref={counterRef}>0</span>
                  <span className="og-counter-label">+<br/>projects<br/>shipped</span>
                </div>
              </div>
            </BentoCard>

            {/* ═══ D — Our Team (col1 bottom, 50%) — orbit animation ═══ */}
            <BentoCard className="og-c-d og-tex" delay={0.36}>
              <div className="og-inner">
                <div className="og-title">Our Team</div>
                <div className="og-desc">Core engineering team with hands-on experience in full-stack, mobile, agentic AI, RAG, and cybersecurity. Built to ship.</div>
              </div>
              <div className="og-orbit-scene">
                <div className="og-orbit-glow" />
                <div className="og-orbit-ring og-orbit-ring-1" />
                <div className="og-orbit-ring og-orbit-ring-2" />
                <div className="og-orbit-center"><img src={logoSrc} alt="Oregent" /></div>
              </div>
            </BentoCard>

            {/* ═══ E — HERO (col2 center, 33%) — Loading Screen Logo animation ═══ */}
            <BentoCard className="og-c-e" delay={0.1}>
              <div className="og-hero-glow" />
              
              <div className="cl-word-orbit" style={{ position: 'absolute', inset: -50, pointerEvents: 'none', transform: 'scale(1.8)' }}>
                  <svg viewBox="0 0 400 400" className="cl-word-orbit-svg" width="100%" height="100%">
                      <defs>
                          <path
                              id="wordCircleReal"
                              d="M 200,200 m -160,0 a 160,160 0 1,1 320,0 a 160,160 0 1,1 -320,0"
                              fill="none"
                          />
                      </defs>
                      <g className="cl-word-orbit-spin" style={{ transformOrigin: '200px 200px', animation: 'spinLogo 20s linear infinite' }}>
                          {['INNOVATE', 'CREATE', 'BUILD', 'HACK', 'DESIGN', 'CODE', 'LAUNCH', 'DEPLOY'].map((word, i, arr) => {
                              const offset = `${(i / arr.length) * 100}%`;
                              return (
                                  <text key={word} className="cl-orbit-word" dy="-8" fill="rgba(255,255,255,0.5)" fontSize="13px" fontFamily="monospace" letterSpacing="0.22em" fontWeight="700">
                                      <textPath href="#wordCircleReal" startOffset={offset} textAnchor="middle">
                                          {word}
                                      </textPath>
                                  </text>
                              );
                          })}
                      </g>
                  </svg>
              </div>
              
              <img src={logoSrc} alt="Oregent BG Logo" className="og-ls-logo" />
              <div className="og-hero-inner">
                <div className="og-hero-badge">
                  <img src={logoSrc} alt="Oregent" />
                  <span className="og-hero-label">Oregent</span>
                </div>
                <div className="og-hero-title">Everything in<br />One Place</div>
              </div>
            </BentoCard>

            {/* ═══ F — Product & Strategy (Swapped to col3 bottom) ═══ */}
            <BentoCard className="og-c-f og-tex" delay={0.44}>
              <div className="og-inner">
                <div className="og-title">Product &amp; Strategy</div>
                <div className="og-desc" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span>AI-driven product development, automation, and deployment.</span>
                  <span style={{ marginTop: '8px' }}>We own end-to-end:</span>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginTop: '8px', fontWeight: 600, color: '#ececec', fontSize: '0.85rem' }}>
                    <span className="og-flow-item">Design</span>
                    <span className="og-flow-item" style={{ color: 'var(--purple)', fontSize: '16px', lineHeight: 1 }}>↓</span>
                    <span className="og-flow-item">Development</span>
                    <span className="og-flow-item" style={{ color: 'var(--purple)', fontSize: '16px', lineHeight: 1 }}>↓</span>
                    <span className="og-flow-item">Testing</span>
                    <span className="og-flow-item" style={{ color: 'var(--purple)', fontSize: '16px', lineHeight: 1 }}>↓</span>
                    <span className="og-flow-item">Deployment.</span>
                  </div>
                </div>
                <div className="og-search-wrap">
                  <div className="og-search-glow" />
                  <div className="og-search">
                    <span className="og-search-txt" ref={searchRef}>Deploy Pipeline...</span>
                    <div className="og-search-icons">
                      <div className="og-search-icon">{SvgIcons.close}</div>
                      <div className="og-search-icon">{SvgIcons.mic}</div>
                      <div className="og-search-icon">{SvgIcons.camera}</div>
                    </div>
                    <div className="og-search-btn">{SvgIcons.search}</div>
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* ═══ G — AI-Powered Insights (col2 bottom, 33%) — thinking dots + strip ═══ */}
            <BentoCard className="og-c-g og-tex" delay={0.28}>
              <div className="og-inner">
                <div className="og-title">AI-Powered Insights</div>
                <div className="og-desc">RAG-based intelligence platforms combining structured and unstructured data. Enabling explainable, context-aware AI insights at scale.</div>
                <div className="og-strip-wrap" ref={stripRef} data-hovered="false" onMouseEnter={onStripEnter} onMouseLeave={onStripLeave}>
                  <div className="og-strip-track">
                    {[SvgIcons.cpu, SvgIcons.brain, SvgIcons.target, SvgIcons.star, SvgIcons.shield, SvgIcons.globe, SvgIcons.layers,
                      SvgIcons.cpu, SvgIcons.brain, SvgIcons.target, SvgIcons.star, SvgIcons.shield, SvgIcons.globe, SvgIcons.layers].map((icon, i) => (
                      <div className="og-strip-chip" key={i}>{icon}</div>
                    ))}
                  </div>
                </div>
              </div>
            </BentoCard>

          </div>
        </div>

        {/* ═══ Ticker ═══ */}
        <div className="og-ticker-wrap">
          <div className="og-ticker-track">
            {[
              "Engineering Intelligence At Scale", "From Idea → Deployment", "Agentic AI", "RAG", "Automation", "DevSecOps", "Cybersecurity", "Engineering Real-World Systems", "Full-Stack", "AI", "Distributed Systems", "Security",
              "Engineering Intelligence At Scale", "From Idea → Deployment", "Agentic AI", "RAG", "Automation", "DevSecOps", "Cybersecurity", "Engineering Real-World Systems", "Full-Stack", "AI", "Distributed Systems", "Security",
            ].map((t, i) => (
              <div className="og-ticker-item" key={i}>
                <span className="og-ticker-dot" />{t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}