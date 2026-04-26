import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const items = [
  {
    num: "01",
    title: "Build a Culture of Innovation\nAcross Institutions",
    desc: "OreHack enables institutions to move beyond traditional learning and foster continuous innovation. Innovation is not an event — it is a culture. Students are encouraged to think critically, experiment, and build consistently, transforming campuses into environments where ideas evolve into real solutions.",
    img: "/Wwd1.png",
  },
  {
    num: "02",
    title: "Enable High-Impact\nHackathons",
    desc: "OreHack provides end-to-end infrastructure to design and execute hackathons with precision and scale. Execution defines the experience. From participant management to evaluation, every stage is handled seamlessly, enabling institutions to deliver impactful and structured innovation experiences.",
    img: "/Wwd2.png",
  },
  {
    num: "03",
    title: "Drive Students from Learning\nto Real Execution",
    desc: "OreHack bridges the gap between academic learning and real-world application. Learning matters only when it leads to execution. Through structured pathways from ideation to implementation, students gain hands-on experience and evolve into confident builders ready for real challenges.",
    img: "/www4.jpg",
  },
  {
    num: "04",
    title: "Hackathon-as-a-Service\n(HaaS)",
    desc: "OreHack delivers a complete, ready-to-deploy innovation ecosystem for institutions. Innovation, delivered as a service. By integrating training, execution, and evaluation into a unified platform, institutions can seamlessly adopt and scale innovation programs with confidence.",
    img: "/www5.jpg",
  },
  {
    num: "05",
    title: "Power Fair & Efficient\nHackathon Evaluations",
    desc: "OreHack ensures every submission is assessed with precision, consistency, and complete transparency. Fairness is not optional — it is engineered. By standardizing evaluation frameworks and eliminating bias, the platform delivers accurate and timely outcomes.",
    img: "/www6.jpg",
  },
];

const WhatWeDo = () => {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const { isDayMode } = useTheme();

  const goNext = () => setActive((prev) => Math.min(prev + 1, items.length - 1));
  const goPrev = () => setActive((prev) => Math.max(prev - 1, 0));

  // Scroll-driven active item update
  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrolled = -rect.top / (sectionHeight - viewportHeight);
      const clamped = Math.max(0, Math.min(1, scrolled));

      const newIndex = Math.min(
        items.length - 1,
        Math.floor(clamped * items.length)
      );

      setActive((prev) => {
        if (prev !== newIndex) return newIndex;
        return prev;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sectionBg = isDayMode ? "#ffffff" : "#000000";
  const headingColor = isDayMode ? "#000000" : "#ffffff";
  const numColor = isDayMode ? "#000000" : "#ffffff";
  const descColor = isDayMode ? "#333333" : "#e4e4e7";
  const placeholderBg = isDayMode
    ? "linear-gradient(135deg, #f5f5f5 0%, #ececec 100%)"
    : "linear-gradient(135deg, #0d0d0d 0%, #111 100%)";
  const placeholderBorder = isDayMode ? "1px dashed #ccc" : "1px dashed #222";
  const placeholderTextColor = isDayMode ? "#bbb" : "#333";
  const dotInactiveBg = isDayMode ? "#ccc" : "#333";
  const arrowBorderClass = isDayMode
    ? "border-[#ccc] hover:border-[#7c3aed] hover:bg-[#7c3aed]/10"
    : "border-[#333] hover:border-[#7c3aed] hover:bg-[#7c3aed]/10";
  const arrowTextClass = isDayMode
    ? "text-[#999] group-hover:text-[#7c3aed]"
    : "text-[#888] group-hover:text-[#7c3aed]";

  return (
    <section
      ref={sectionRef}
      id="what-we-do"
      className="relative z-10"
      style={{
        background: sectionBg,
        height: `${items.length * 85}vh`,
        marginTop: "0px",
        transition: "background 0.5s ease",
      }}
    >
      {/* Sticky inner container */}
      <div
        className="sticky top-0 flex flex-col justify-start pt-24 pb-16 px-6 md:px-16 lg:px-32"
        style={{ minHeight: "100vh" }}
      >
        {/* ── Header: Eyebrow + WHAT WE DO ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full text-center mb-4"
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-4 orehack-liquid-text"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            (TRUST THE BUILD)
          </p>
          <h2
            className="text-4xl md:text-7xl font-black leading-none m-0 uppercase flex flex-row flex-wrap items-baseline justify-center gap-4 md:gap-6 italic"
            style={{
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              letterSpacing: "-0.04em",
              textShadow: "0 0 60px rgba(124, 58, 237, 0.45), 0 0 120px rgba(124, 58, 237, 0.2)",
              color: headingColor,
              transition: "color 0.4s ease",
            }}
          >
            <span>WHAT</span>
            <span>WE</span>
            <span
              style={{
                fontFamily: '"Playfair Display", serif',
                color: "#7c3aed",
                letterSpacing: "0.02em",
                textShadow: "0 0 40px rgba(124, 58, 237, 0.8), 0 0 80px rgba(124, 58, 237, 0.4)",
              }}
            >
              DO ?
            </span>
          </h2>

          {/* Glow divider */}
          <div style={{ position: "relative", marginTop: "2.5rem", height: "2px" }}>
            <div style={{
              width: "100%",
              height: "1px",
              background: `linear-gradient(to right, transparent, rgba(124,58,237,0.6), ${isDayMode ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.3)"}, rgba(124,58,237,0.6), transparent)`,
            }} />
            <div style={{
              position: "absolute",
              top: "-12px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "24px",
              background: `radial-gradient(ellipse at center, rgba(124,58,237, ${isDayMode ? "0.2" : "0.35"}) 0%, transparent 70%)`,
              filter: isDayMode ? "blur(4px)" : "blur(6px)",
              pointerEvents: "none",
            }} />
          </div>
        </motion.div>

        {/* ── Content Area: Left Text + Right Image Placeholder ── */}
        <div className="w-full flex flex-col lg:flex-row gap-12 lg:gap-20 flex-1">
          {/* Left Side — Title + Content */}
          <div className="flex-1 flex flex-col justify-between min-h-[360px]">
            <div className="relative min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  {/* Number */}
                  <span
                    className="block mb-4 italic"
                    style={{
                      fontFamily: '"Playfair Display", serif',
                      fontSize: "clamp(0.85rem, 1.2vw, 1rem)",
                      fontWeight: 400,
                      letterSpacing: "0.08em",
                    }}
                  >
                    <span style={{ color: numColor, transition: "color 0.4s ease" }}>{items[active].num}</span>
                    <span style={{ color: "#7c3aed" }}> / 0{items.length}</span>
                  </span>

                  {/* Title */}
                  <h3
                    className="italic uppercase mb-6"
                    style={{
                      fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                      fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
                      fontWeight: 500,
                      lineHeight: 1.15,
                      color: "#7c3aed",
                      letterSpacing: "-0.02em",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {items[active].title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                      fontSize: "clamp(0.8rem, 1.1vw, 0.98rem)",
                      fontWeight: 300,
                      fontStyle: "italic",
                      lineHeight: 1.8,
                      color: descColor,
                      letterSpacing: "0.01em",
                      maxWidth: "540px",
                      transition: "color 0.4s ease",
                    }}
                  >
                    {items[active].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Navigation Arrows ── */}
            <div className="flex items-center gap-6 mt-20">
              <button
                onClick={goPrev}
                aria-label="Previous item"
                className={`group flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 ${arrowBorderClass}`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-colors duration-300 ${arrowTextClass}`}
                >
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Dots indicator */}
              <div className="flex items-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Go to item ${i + 1}`}
                    className="transition-all duration-300"
                    style={{
                      width: i === active ? "24px" : "6px",
                      height: "6px",
                      borderRadius: "3px",
                      background: i === active ? "#7c3aed" : dotInactiveBg,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                aria-label="Next item"
                className={`group flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-300 ${arrowBorderClass}`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-colors duration-300 ${arrowTextClass}`}
                >
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Side — Image Column */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full rounded-2xl flex items-center justify-center overflow-hidden"
                style={{
                  background: items[active].img ? "transparent" : placeholderBg,
                  border: items[active].img ? "none" : placeholderBorder,
                  aspectRatio: "4 / 3",
                  maxHeight: "clamp(260px, 45vh, 520px)",
                }}
              >
                {items[active].img ? (
                  <img
                    src={items[active].img}
                    alt={items[active].title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: "0.8rem",
                      color: placeholderTextColor,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Image {items[active].num}
                  </span>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;
