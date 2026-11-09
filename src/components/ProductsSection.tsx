import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { ArrowUpRight } from "lucide-react";

const ProductsSection: React.FC = () => {
  const { isDayMode } = useTheme();

  const sectionBg = isDayMode ? "#ffffff" : "#000000";
  const headingColor = isDayMode ? "text-black" : "text-white";

  return (
    <section
      id="products"
      className="relative z-10 py-10 md:py-14 px-4 sm:px-6 md:px-12 lg:px-20 overflow-hidden"
      style={{
        background: sectionBg,
        transition: "background 0.5s ease",
      }}
    >
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[280px] opacity-15 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="w-full text-center mb-10 md:mb-14"
        >
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2 orehack-liquid-text"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            (TRUST THE BUILD)
          </p>
          <h2
            className={`text-2xl sm:text-3xl md:text-5xl font-black leading-tight ${headingColor} m-0 uppercase flex flex-row flex-wrap items-baseline justify-center gap-2 md:gap-4 italic`}
            style={{
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              letterSpacing: "-0.04em",
              textShadow: isDayMode
                ? "none"
                : "0 0 50px rgba(124, 58, 237, 0.35)",
            }}
          >
            <span>BUILT</span>
            <span>FOR</span>
            <span
              style={{
                fontFamily: '"Playfair Display", serif',
                color: "#7c3aed",
                letterSpacing: "0.02em",
                textShadow:
                  "0 0 30px rgba(124, 58, 237, 0.8), 0 0 60px rgba(124, 58, 237, 0.4)",
              }}
            >
              SCALE
            </span>
          </h2>

          {/* Glow divider */}
          <div style={{ position: "relative", marginTop: "1.75rem", height: "2px" }}>
            <div
              style={{
                width: "100%",
                height: "1px",
                background: `linear-gradient(to right, transparent, rgba(124,58,237,0.6), ${
                  isDayMode ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.3)"
                }, rgba(124,58,237,0.6), transparent)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "-8px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "45%",
                height: "16px",
                background: `radial-gradient(ellipse at center, rgba(124,58,237, ${
                  isDayMode ? "0.2" : "0.35"
                }) 0%, transparent 70%)`,
                filter: isDayMode ? "blur(4px)" : "blur(6px)",
                pointerEvents: "none",
              }}
            />
          </div>
        </motion.div>

        {/* ── Main Product Card Container (Exact replication of reference design) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative rounded-[24px] md:rounded-[32px] p-2.5 sm:p-3.5 md:p-5 border border-white/10"
          style={{
            background: isDayMode ? "#f4f4f5" : "#0d0d0f",
            boxShadow: isDayMode
              ? "0 16px 40px rgba(0,0,0,0.06)"
              : "0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 md:gap-5 items-stretch">
            {/* ── Left Space: White Background with Purple Text ── */}
            <div
              className="md:col-span-5 lg:col-span-4 rounded-[18px] md:rounded-[24px] p-4 sm:p-6 lg:p-7 flex flex-col justify-between h-full"
              style={{
                background: "#ffffff",
                boxShadow: "0 10px 28px rgba(0,0,0,0.1)",
              }}
            >
              <div>
                {/* Product Logo / Monogram */}
                <div className="mb-3 sm:mb-4 flex items-center justify-center">
                  <img
                    src="/CH OREHACK Monogram Logo.png"
                    alt="CH OREHACK"
                    className="h-14 sm:h-16 md:h-20 w-auto object-contain object-center"
                  />
                </div>

                {/* Content description */}
                <p
                  className="text-[#4c1d95] text-xs sm:text-[0.85rem] lg:text-[0.88rem] leading-relaxed font-normal"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <strong className="font-extrabold text-[#7c3aed]">OREHACK</strong> is designed
                  to transform the way hackathons are orchestrated, operated and evaluated. From
                  event orchestration and workflow automation to repository-level code
                  intelligence, automated technical assessment, jury coordination and real-time
                  result generation, the platform brings the entire operational lifecycle into a
                  unified environment.
                </p>
              </div>

              {/* Metric / Highlight Block + CTA Button */}
              <div className="mt-4 pt-3.5 border-t border-[#7c3aed]/15">
                <div className="mb-3.5">
                  <div
                    className="text-2xl sm:text-3xl font-black text-[#7c3aed] tracking-tight leading-none"
                    style={{
                      fontFamily:
                        'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                    }}
                  >
                    ALL-IN-ONE
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#6b21a8]/80 mt-1">
                    Hackathon Infrastructure Platform
                  </div>
                </div>

                <a
                  href="/hackathons"
                  className="inline-flex items-center gap-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-5 py-2 rounded-full text-xs font-bold tracking-wide shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <span>Visit</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>

            {/* ── Right Space: Image Showcase (Full Height Flush) ── */}
            <div
              className="md:col-span-7 lg:col-span-8 rounded-[18px] md:rounded-[24px] overflow-hidden relative flex items-center justify-center h-full min-h-[280px] sm:min-h-[340px] md:min-h-full border border-white/5"
              style={{
                background: isDayMode ? "#e4e4e7" : "#050507",
              }}
            >
              <img
                src="/Neon Orehack Infrastructure Launch.png"
                alt="OreHack Infrastructure Launch"
                className="w-full h-full object-cover object-center rounded-[16px] md:rounded-[22px] transform transition-transform duration-700 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>

        {/* ── Running Website URL Marquee under the box (from box start to box end, running left to right) ── */}
        <div
          className="relative w-full overflow-hidden mt-5 md:mt-7 py-2.5 border-y border-white/10"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <style>{`
            @keyframes urlScrollLeftToRight {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .animate-url-scroll {
              display: flex;
              width: max-content;
              animation: urlScrollLeftToRight 22s linear infinite;
            }
            .animate-url-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="animate-url-scroll items-center gap-8 md:gap-12 whitespace-nowrap">
            {Array.from({ length: 12 }).map((_, i) => (
              <a
                key={i}
                href="https://orehack.oregent.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm md:text-base font-semibold tracking-wider transition-opacity duration-200 hover:opacity-100 opacity-90 group cursor-pointer"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#7c3aed] shadow-[0_0_8px_#7c3aed]" />
                <span className="text-[#a855f7] font-black group-hover:text-[#c084fc] transition-colors">
                  orehack
                </span>
                <span
                  className={
                    isDayMode
                      ? "text-black/80 font-bold"
                      : "text-white/95 font-bold"
                  }
                >
                  .oregent.in
                </span>
                <span className="text-[#7c3aed] text-xs opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ── Second Product Card Container: OREGENT EDGE (Same ratio and layout) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="relative rounded-[24px] md:rounded-[32px] p-2.5 sm:p-3.5 md:p-5 border border-white/10 mt-10 md:mt-14"
          style={{
            background: isDayMode ? "#f4f4f5" : "#0d0d0f",
            boxShadow: isDayMode
              ? "0 16px 40px rgba(0,0,0,0.06)"
              : "0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 md:gap-5 items-stretch">
            {/* ── Left Space: White Background with Blue Text ── */}
            <div
              className="md:col-span-5 lg:col-span-4 rounded-[18px] md:rounded-[24px] p-4 sm:p-6 lg:p-7 flex flex-col justify-between h-full"
              style={{
                background: "#ffffff",
                boxShadow: "0 10px 28px rgba(0,0,0,0.1)",
              }}
            >
              <div>
                {/* Product Logo / Monogram */}
                <div className="mb-3 sm:mb-4 flex items-center justify-center">
                  <img
                    src="/logofull.png"
                    alt="OREGENT EDGE"
                    className="h-14 sm:h-16 md:h-20 w-auto object-contain object-center"
                  />
                </div>

                {/* Content description */}
                <p
                  className="text-[#0a2540] text-xs sm:text-[0.85rem] lg:text-[0.88rem] leading-relaxed font-normal"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <strong className="font-extrabold text-[#024cfd]">OREGENT EDGE</strong> is
                  designed to transform how builders master technology. We don't just teach
                  technology—we cultivate thinkers who solve real-world problems and build
                  products that create impact via hackathons. A modern learning ecosystem
                  bridging ideas, industry, and technology to train and prepare builders for
                  hackathon excellence.
                </p>
              </div>

              {/* Metric / Highlight Block + CTA Button */}
              <div className="mt-4 pt-3.5 border-t border-[#024cfd]/15">
                <div className="mb-3.5">
                  <div
                    className="text-2xl sm:text-3xl font-black text-[#024cfd] tracking-tight leading-none"
                    style={{
                      fontFamily:
                        'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                    }}
                  >
                    HACKATHON-READY
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#024cfd]/80 mt-1">
                    Hands-On Learning Ecosystem
                  </div>
                </div>

                <a
                  href="https://edge.oregent.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#024cfd] hover:bg-[#013ed6] text-white px-5 py-2 rounded-full text-xs font-bold tracking-wide shadow-sm hover:shadow-md transition-all duration-300 group"
                >
                  <span>Visit</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>

            {/* ── Right Space: Image Showcase (Full Height Flush) ── */}
            <div
              className="md:col-span-7 lg:col-span-8 rounded-[18px] md:rounded-[24px] overflow-hidden relative flex items-center justify-center h-full min-h-[280px] sm:min-h-[340px] md:min-h-full border border-white/5"
              style={{
                background: isDayMode ? "#e4e4e7" : "#050507",
              }}
            >
              <img
                src="/Neon OREGENT EDGE Learning Poster.png"
                alt="OREGENT EDGE Learning Poster"
                className="w-full h-full object-cover object-center rounded-[16px] md:rounded-[22px] transform transition-transform duration-700 hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>

        {/* ── Running Website URL Marquee for Oregent Edge (edge.oregent.in) ── */}
        <div
          className="relative w-full overflow-hidden mt-5 md:mt-7 py-2.5 border-y border-white/10"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="animate-url-scroll items-center gap-8 md:gap-12 whitespace-nowrap">
            {Array.from({ length: 12 }).map((_, i) => (
              <a
                key={i}
                href="https://edge.oregent.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm md:text-base font-semibold tracking-wider transition-opacity duration-200 hover:opacity-100 opacity-90 group cursor-pointer"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#024cfd] shadow-[0_0_8px_#024cfd]" />
                <span className="text-[#024cfd] font-black group-hover:text-[#38bdf8] transition-colors">
                  edge
                </span>
                <span
                  className={
                    isDayMode
                      ? "text-black/80 font-bold"
                      : "text-white/95 font-bold"
                  }
                >
                  .oregent.in
                </span>
                <span className="text-[#024cfd] text-xs opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;

