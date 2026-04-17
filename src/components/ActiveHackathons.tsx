import { useRef } from "react";

/* ══════════════════════════════════════════════════════════
   MAIN SECTION — TRANSITION ONLY
═══════════════════════════════════════════════════════════ */
const TRACK_VH = 1.2; // Keep a small scroll space for the transition effect

export default function ActiveHackathons() {
  const trackRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={trackRef} id="hackathons" style={{ height: `${TRACK_VH * 100}vh`, position: "relative", background: "transparent" }}>
        <div style={{
          position: "sticky", top: 0, height: "100vh",
          overflow: "hidden", display: "flex", alignItems: "center", background: "transparent",
        }}>

          {/* Background layer — transparent at top to show hero behind transition, white below */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.1) 15px, rgba(255,255,255,0.6) 40px, #ffffff 60px, #ffffff 100%)",
            zIndex: 0
          }} />

          {/* subtle grid */}
          <div aria-hidden style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(hsl(263 70% 70% / 0.12) 1px, transparent 1px),linear-gradient(90deg, hsl(263 70% 70% / 0.12) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
            pointerEvents: "none",
            zIndex: 1
          }} />

          {/* Step-by-step gradual blur transition — 4 stages of increasing density */}
          <div aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: "80px", zIndex: 30, pointerEvents: "none" }}>
            {/* Stage 1: Soft blur */}
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", maskImage: "linear-gradient(to bottom, black 0%, transparent 25%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 25%)" }} />
            {/* Stage 2: Medium blur */}
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", maskImage: "linear-gradient(to bottom, transparent 10%, black 25%, black 45%, transparent 60%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 10%, black 25%, black 45%, transparent 60%)" }} />
            {/* Stage 3: Strong blur */}
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maskImage: "linear-gradient(to bottom, transparent 40%, black 55%, black 75%, transparent 85%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 40%, black 55%, black 75%, transparent 85%)" }} />
            {/* Stage 4: Max blur + white blend */}
            <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", maskImage: "linear-gradient(to bottom, transparent 70%, black 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 70%, black 100%)", background: "linear-gradient(to bottom, transparent 70%, rgba(255,255,255,0.3) 85%, #ffffff 100%)" }} />
          </div>

        </div>
      </div>
    </>
  );
}
