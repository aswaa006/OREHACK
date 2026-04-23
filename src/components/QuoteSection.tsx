import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const QuoteSection = () => {
  const { isDayMode } = useTheme();

  const sectionBg = isDayMode ? "#ffffff" : "#000000";
  const quoteColor = isDayMode ? "#222222" : "#e4e4e7";

  return (
    <section
      className="relative pt-12 pb-28 px-6 md:px-16 lg:px-32 overflow-hidden flex items-center justify-center min-h-[60vh]"
      style={{
        background: sectionBg,
        transition: "background 0.5s ease",
      }}
    >
      {/* Decorative gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-20 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           viewport={{ once: true, margin: "-100px" }}
        >
          {/* Quote Mark */}
          <span 
            className="block text-6xl md:text-8xl text-[#7c3aed] opacity-50 mb-8 select-none"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            &ldquo;
          </span>

          <h2 
            className="text-3xl md:text-5xl lg:text-6xl font-light italic leading-tight"
            style={{ 
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              letterSpacing: "-0.02em",
              color: quoteColor,
              transition: "color 0.4s ease",
            }}
          >
            Innovation is not just about building something new; <br className="hidden md:block" />
            it's about <span className="text-[#7c3aed] font-medium">redefining what's possible</span>.
          </h2>

          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            viewport={{ once: true }}
            className="h-px w-24 bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent mx-auto mt-12 mb-8"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", position: "relative" }}
          >
            {/* Outer glow bloom */}
            <div style={{
              position: "absolute",
              inset: "-20px",
              borderRadius: "60px",
              background: "radial-gradient(ellipse at center, rgba(124,58,237,0.25) 0%, transparent 70%)",
              filter: "blur(12px)",
              pointerEvents: "none",
              animation: "philosophyGlow 3s ease-in-out infinite alternate",
            }} />

            {/* Badge pill */}
            <div style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 24px",
              borderRadius: "50px",
              background: isDayMode ? "rgba(240, 235, 255, 0.8)" : "rgba(10, 0, 20, 0.7)",
              border: "1px solid rgba(124,58,237,0.45)",
              backdropFilter: "blur(16px)",
              boxShadow: "0 0 24px rgba(124,58,237,0.2), inset 0 0 16px rgba(124,58,237,0.06)",
              overflow: "hidden",
              transition: "background 0.4s ease",
            }}>
              {/* Shimmer sweep */}
              <div style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50px",
                background: "linear-gradient(90deg, transparent 0%, transparent 30%, rgba(124,58,237,0.35) 48%, rgba(255,255,255,0.15) 50%, rgba(124,58,237,0.35) 52%, transparent 70%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "philosophyShimmer 3s linear infinite",
                pointerEvents: "none",
              }} />

              {/* Dot indicator */}
              <span style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: "#7c3aed",
                flexShrink: 0,
                boxShadow: "0 0 8px rgba(124,58,237,0.9)",
                animation: "philosophyPulse 2s ease-in-out infinite",
              }} />

              <p
                className="text-sm md:text-base uppercase tracking-[0.3em] text-[#7c3aed] font-semibold m-0"
                style={{ fontFamily: "'Outfit', sans-serif", position: "relative", zIndex: 1 }}
              >
                The OreHack Philosophy
              </p>
            </div>

            <style>{`
              @keyframes philosophyGlow {
                0%   { opacity: 0.6; transform: scale(1); }
                100% { opacity: 1;   transform: scale(1.08); }
              }
              @keyframes philosophyShimmer {
                0%   { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
              @keyframes philosophyPulse {
                0%, 100% { opacity: 1;   box-shadow: 0 0 8px rgba(124,58,237,0.9); }
                50%       { opacity: 0.4; box-shadow: 0 0 16px rgba(124,58,237,0.4); }
              }
            `}</style>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default QuoteSection;
