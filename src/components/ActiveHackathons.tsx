import { useRef, useEffect, Suspense, lazy } from "react";
import { Canvas } from "@react-three/fiber";

const OregentLogo3D = lazy(() => import("./OregentLogo3D"));

/* ══════════════════════════════════════════════════════════
   MAIN SECTION — scroll-driven 3D logo slide-in from left

   Layout:
   • trackRef  – tall scroll-space div (SCROLL_VH * 100vh)
                 gives us the scroll budget for the animation
   • sticky    – pinned 100vh viewport inside the track
   • canvasWrap – absolutely positioned inside the sticky;
                  translated left → right by scroll progress

   Fix notes:
   • trackRef has NO overflow:hidden — we let the sticky child
     handle clipping so getBoundingClientRect stays accurate
   • The entire track gets a solid white bg so the hero never
     shows through after the sticky unpin
   • Progress uses window.scrollY + el.offsetTop for accuracy
     with Lenis smooth-scroll (avoids rect.top lag)
   • No useState → direct DOM mutation to avoid React re-renders
     competing with the ScrollStack RAF loop in HowItWorks
═══════════════════════════════════════════════════════════ */

const SCROLL_VH = 3.5; // Viewport heights of scroll budget (entry + seated dwell + exit)

export default function ActiveHackathons() {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cachedOffsetTop = 0;

    const updateCache = () => {
      if (trackRef.current) {
        cachedOffsetTop = trackRef.current.offsetTop;
      }
    };

    const onScroll = () => {
      const el = trackRef.current;
      const wrap = canvasWrapRef.current;
      if (!el || !wrap) return;

      // Use cached offsetTop to prevent layout thrashing
      const scrolled = window.scrollY - cachedOffsetTop;
      const trackHeight = el.offsetHeight - window.innerHeight;

      const p = Math.max(0, Math.min(1, scrolled / trackHeight));
      const vw = window.innerWidth;

      const easeInOut = (t: number) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

      const eased = easeInOut(p);
      const tx = (-1.3 + eased * 2.7) * vw;

      wrap.style.transform = `translateY(-50%) translateX(${tx}px)`;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateCache);

    // Initial sync
    updateCache();
    const t = setTimeout(() => {
      updateCache();
      onScroll();
    }, 100);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateCache);
      clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      id="hackathons"
      style={{
        height: `${SCROLL_VH * 100}vh`,
        position: "relative",
        // No background here — keeping it transparent lets the sticky child's
        // backdrop-filter blur see the dark hero behind it (restores blur effect).
        // The gap-filler div below covers the scroll-buffer area instead.
      }}
    >
      {/* ── Sticky viewport (clips the sliding canvas) ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",   // clips the canvas while it's off-screen
          zIndex: 2,            // must be above the gap-filler div (zIndex:0) that follows in DOM
        }}
      >
        {/* Hero→White gradient at the very top of this sticky panel */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.15) 12px, rgba(255,255,255,0.65) 36px, #ffffff 56px, #ffffff 100%)",
            zIndex: 0,
          }}
        />

        {/* Subtle violet grid overlay */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(hsl(263 70% 70% / 0.08) 1px, transparent 1px)," +
              "linear-gradient(90deg, hsl(263 70% 70% / 0.08) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Stepped blur at the top edge (hero→white transition) */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "80px",
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", maskImage: "linear-gradient(to bottom, black 0%, transparent 25%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 25%)" }} />
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", maskImage: "linear-gradient(to bottom, transparent 10%, black 25%, black 45%, transparent 60%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 10%, black 25%, black 45%, transparent 60%)" }} />
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maskImage: "linear-gradient(to bottom, transparent 40%, black 55%, black 75%, transparent 85%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 40%, black 55%, black 75%, transparent 85%)" }} />
          <div style={{ position: "absolute", inset: 0, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", maskImage: "linear-gradient(to bottom, transparent 70%, black 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 70%, black 100%)", background: "linear-gradient(to bottom, transparent 70%, rgba(255,255,255,0.3) 85%, #ffffff 100%)" }} />
        </div>

        {/* ── Scroll-driven 3D canvas ──
            • Resting position : left:48vw (right half of page)
            • Start transform  : translateX(-130vw) → fully off-screen left
            • End transform    : translateX(0)      → seated on right
            • Scroll handler updates this via ref (no React re-render)      */}
        <div
          ref={canvasWrapRef}
          style={{
            position: "absolute",
            top: "50%",
            left: "48vw",
            transform: "translateY(-50%) translateX(-130vw)",
            width: "48vw",
            height: "55vh",
            maxWidth: "600px",
            zIndex: 10,
            willChange: "transform",
            cursor: "grab",
          }}
        >
          <Suspense
            fallback={
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 32, height: 32, border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            }
          >
            <Canvas
              camera={{ position: [0, 0, 6], fov: 42 }}
              dpr={[1, 1.5]}
              style={{ background: "transparent", width: "100%", height: "100%" }}
            >
              <OregentLogo3D />
            </Canvas>
          </Suspense>
        </div>
      </div>

      {/* ── Gap-filler: white background for the scroll-buffer portion ──
          The sticky child is 100vh. The track is SCROLL_VH * 100vh.
          The remaining (SCROLL_VH - 1) * 100vh is transparent → hero bleeds through.
          This absolute div covers exactly that gap with solid white.          */}
      <div
        style={{
          position: "absolute",
          top: "100vh",
          left: 0,
          right: 0,
          height: `${(SCROLL_VH - 1) * 100}vh`,
          background: "#ffffff",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
