import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * EnergySphere
 *
 * A scroll-driven section that animates a radial-gradient "energy sphere".
 * The animation follows:  blue → red enters → orange layer → yellow core →
 *                          yellow fades → orange fades → red fades → blue
 *
 * All colour and geometry is driven by CSS custom properties mutated by GSAP.
 */
export default function EnergySphere() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const glowRef   = useRef<HTMLDivElement>(null);
  const layerRedRef    = useRef<HTMLDivElement>(null);
  const layerOrangeRef = useRef<HTMLDivElement>(null);
  const layerYellowRef = useRef<HTMLDivElement>(null);
  const outerGlowRef   = useRef<HTMLDivElement>(null);
  const labelRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const sphere  = sphereRef.current;
    if (!section || !sphere) return;

    // ── proxy object that GSAP will tween; we copy values to CSS vars in onUpdate ──
    const vars = {
      y:          90,   // gradient origin Y  (% from top)
      redA:       0,    // red layer alpha
      orangeA:    0,    // orange layer alpha
      yellowA:    0,    // yellow core alpha
      redRadius:  0,    // red gradient stop (% of sphere)
      orangeRadius: 0,
      yellowRadius: 0,
      outerGlow:  0,    // outer box-shadow intensity (0-1)
      scale:      1,    // subtle scale pulse
    };

    const applyVars = () => {
      if (!sphere) return;
      sphere.style.setProperty("--gy", `${vars.y}%`);
      sphere.style.setProperty("--red-a",    vars.redA.toString());
      sphere.style.setProperty("--orange-a", vars.orangeA.toString());
      sphere.style.setProperty("--yellow-a", vars.yellowA.toString());
      sphere.style.setProperty("--red-r",    `${vars.redRadius}%`);
      sphere.style.setProperty("--orange-r", `${vars.orangeRadius}%`);
      sphere.style.setProperty("--yellow-r", `${vars.yellowRadius}%`);

      // outer glow
      if (outerGlowRef.current) {
        const g = vars.outerGlow;
        outerGlowRef.current.style.opacity = g.toString();
        outerGlowRef.current.style.transform = `scale(${vars.scale})`;
      }
      // sphere scale (elastic breath)
      sphere.style.transform = `scale(${vars.scale})`;
    };

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end:   "bottom bottom",
        scrub: 1.4,
        pin:   false,
      },
      onUpdate: applyVars,
      defaults: { ease: "none" },
    });

    // ── Phase 1: Red wave rises from bottom (0% → 20% of timeline) ──
    tl.to(vars, {
      y:          60,
      redA:       0.85,
      redRadius:  55,
      outerGlow:  0.35,
      duration: 0.2,
    })

    // ── Phase 2: Orange layer emerges inside red (20% → 40%) ──
    .to(vars, {
      y:           45,
      orangeA:     0.9,
      orangeRadius: 38,
      outerGlow:   0.6,
      scale:       1.03,
      duration: 0.2,
    })

    // ── Phase 3: Yellow core ignites (40% → 60%) — peak energy ──
    .to(vars, {
      y:            30,
      yellowA:      1,
      yellowRadius: 22,
      orangeRadius: 42,
      redRadius:    62,
      outerGlow:    1,
      scale:        1.06,
      ease:         "power2.out",
      duration: 0.2,
    })

    // ── Phase 3b: Elastic micro-pulse (slight contract) ──
    .to(vars, {
      scale:  0.97,
      yellowRadius: 18,
      duration: 0.04,
      ease: "power1.inOut",
    })
    .to(vars, {
      scale: 1.08,
      yellowRadius: 24,
      duration: 0.04,
      ease: "power1.inOut",
    })
    .to(vars, {
      scale: 1.05,
      duration: 0.02,
    })

    // ── Phase 4: Yellow fades → orange (62% → 75%) ──
    .to(vars, {
      y:           45,
      yellowA:     0,
      yellowRadius: 0,
      orangeRadius: 30,
      outerGlow:   0.6,
      scale:       1.02,
      duration: 0.15,
    })

    // ── Phase 5: Orange fades → red (75% → 88%) ──
    .to(vars, {
      y:           65,
      orangeA:     0,
      orangeRadius: 0,
      redRadius:   40,
      outerGlow:   0.25,
      scale:       1,
      duration: 0.13,
    })

    // ── Phase 6: Red fades → deep blue (88% → 100%) ──
    .to(vars, {
      y:         90,
      redA:      0,
      redRadius: 0,
      outerGlow: 0,
      scale:     1,
      duration: 0.12,
    });

    // ── Animate the text label separately ──
    if (labelRef.current) {
      gsap.fromTo(
        labelRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="energy-sphere"
      className="energy-sphere-section"
    >
      {/* ── Sticky viewport so the sphere stays centred while the section scrolls ── */}
      <div className="energy-sphere-sticky">

        {/* ambient background glow that bleeds outside the sphere */}
        <div ref={outerGlowRef} className="energy-outer-glow" />

        {/* ── THE SPHERE ── */}
        <div ref={sphereRef} className="energy-sphere">

          {/* Deep blue base layer — always present */}
          <div className="energy-layer energy-layer-base" />

          {/* Red wave */}
          <div ref={layerRedRef} className="energy-layer energy-layer-red" />

          {/* Orange mid */}
          <div ref={layerOrangeRef} className="energy-layer energy-layer-orange" />

          {/* Yellow core */}
          <div ref={layerYellowRef} className="energy-layer energy-layer-yellow" />

          {/* Glass rim highlight */}
          <div className="energy-sphere-rim" />

          {/* Inner specular catch-light */}
          <div className="energy-specular" />
        </div>

        {/* ── Label ── */}
        <div ref={labelRef} className="energy-label">
          <span className="energy-label-eyebrow">SCROLL TO IGNITE</span>
          <p className="energy-label-title">Energy Flow</p>
          <p className="energy-label-sub">
            Witness energy rising from the core — scroll through the full cycle.
          </p>
        </div>
      </div>
    </section>
  );
}
