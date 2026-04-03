import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * BackgroundAnimation — "inside the sphere" world model.
 *
 * Three fixed layers:
 *  1. canvas  — full-screen radial gradient; THIS is the sphere's interior colour.
 *               GSAP moves --y upward so warm colours rise from below as user scrolls.
 *  2. vignette — radial mask that darkens corners, giving depth / curvature sense.
 *  3. ring     — a large transparent circle whose box-shadow creates the sphere edge.
 *               No fill. Only edges are visible.
 *
 * The user is inside the sphere. The sphere is the world.
 */
export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const ringRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ring   = ringRef.current;
    if (!canvas || !ring) return;

    const vH = window.innerHeight;

    // ── initial ring position: ring centre at viewport bottom → top arc visible ──
    gsap.set(ring, {
      xPercent: -50,
      yPercent: -50,
      left:     "50%",
      top:      vH,          // centre of ring = bottom of viewport
    });

    // ── proxy object GSAP will tween ──
    const cv = {
      y:      115,   // gradient-origin Y  (% of viewport, sent to --y)
      ringY:  vH,    // ring centre top (px)
    };

    const flush = () => {
      canvas.style.setProperty("--y", `${cv.y.toFixed(2)}%`);
      ring.style.top = `${cv.ringY.toFixed(1)}px`;
    };

    const tl = gsap.timeline({ defaults: { ease: "none" }, onUpdate: flush });

    // ── Phase 0 → 20%:  blue → red rises, ring climbs slightly ──
    tl.to(cv, { y: 82, ringY: vH * 0.83, duration: 0.20 }, 0)

    // ── Phase 20% → 40%: red matures, orange emerges ──
      .to(cv, { y: 64, ringY: vH * 0.68, duration: 0.20 }, 0.20)

    // ── Phase 40% → 60%: yellow core ignites ──
      .to(cv, { y: 47, ringY: vH * 0.60, duration: 0.20 }, 0.40)

    // ── Phase 60% → 75%: PEAK — yellow blazing, ring fully centred ──
      .to(cv, { y: 34, ringY: vH * 0.50, duration: 0.15 }, 0.60)

    // ── Phase 75% → 85%: yellow retreats ──
      .to(cv, { y: 52, ringY: vH * 0.60, duration: 0.10 }, 0.75)

    // ── Phase 85% → 95%: orange retreats ──
      .to(cv, { y: 72, ringY: vH * 0.76, duration: 0.10 }, 0.85)

    // ── Phase 95% → 100%: back to deep blue ──
      .to(cv, { y: 92, ringY: vH * 0.90, duration: 0.05 }, 0.95);

    ScrollTrigger.create({
      animation: tl,
      trigger:   document.documentElement,
      start:     "top top",
      end:       "bottom bottom",
      scrub:     1.8,
    });

    flush();

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((s) => s.kill());
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div aria-hidden="true">

      {/* ── 1. WORLD CANVAS — full-screen animated gradient ── */}
      <div ref={canvasRef} className="sph-canvas" />

      {/* ── 2. VIGNETTE — darkens corners so inner sphere feels brighter ── */}
      <div className="sph-vignette" />

      {/* ── 3. SPHERE RING — transparent circle; only shadows create the edge ── */}
      <div ref={ringRef} className="sph-ring">
        {/* Top specular arc — light reflecting off sphere surface */}
        <div className="sph-ring-specular" />
        {/* Bottom inner warm reflection */}
        <div className="sph-ring-warm-base" />
      </div>

    </div>
  );
}
