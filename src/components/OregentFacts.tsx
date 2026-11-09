import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

interface FactPillProps {
  icon: React.ReactNode;
  label: string;
}

const FactPill: React.FC<FactPillProps> = ({ icon, label }) => {
  return (
    <motion.span
      whileHover={{ scale: 1.05, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="inline-flex items-center gap-1.5 sm:gap-2 md:gap-2.5 bg-white text-black font-bold text-xs sm:text-base md:text-xl lg:text-2xl px-2.5 sm:px-4 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.35)] mx-1 sm:mx-1.5 my-1 align-middle transition-shadow duration-300 hover:shadow-[0_8px_25px_rgba(168,85,247,0.35)] cursor-default select-none border border-black/5"
    >
      <span className="flex items-center justify-center text-xs sm:text-base md:text-lg">
        {icon}
      </span>
      <span className="tracking-tight text-[#0a0518] whitespace-nowrap">
        {label}
      </span>
    </motion.span>
  );
};

export const OregentFacts: React.FC = () => {
  const { isDayMode } = useTheme();

  return (
    <section id="oregent-facts" className="relative w-full py-12 md:py-20 px-4 sm:px-6 lg:px-12 bg-black overflow-hidden">
      {/* ── Main Canvas Card Container ── */}
      <div className="relative max-w-6xl mx-auto rounded-[24px] sm:rounded-[32px] md:rounded-[40px] overflow-hidden border-[3px] sm:border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.25),0_20px_60px_rgba(0,0,0,0.85)] min-h-[380px] sm:min-h-[440px] md:min-h-[500px] flex items-center justify-center p-6 sm:p-10 md:p-16">
        
        {/* ═══ LAYER 1: Animated Flowing Fluid Gradients (Purple / Violet / Dark shades) ═══ */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Base deep background */}
          <div className="absolute inset-0 bg-[#06020c]" />

          {/* Flowing animated gradient orbs */}
          <div
            className="absolute -top-[30%] -left-[20%] w-[70%] h-[120%] rounded-full opacity-70 animate-facts-drift-1"
            style={{
              background: "radial-gradient(circle, #7c3aed 0%, #4c1d95 45%, transparent 75%)",
              filter: "blur(60px)",
            }}
          />
          <div
            className="absolute -bottom-[40%] -right-[15%] w-[80%] h-[130%] rounded-full opacity-65 animate-facts-drift-2"
            style={{
              background: "radial-gradient(circle, #9333ea 0%, #3b0764 50%, transparent 80%)",
              filter: "blur(70px)",
            }}
          />
          <div
            className="absolute top-[20%] left-[30%] w-[60%] h-[90%] rounded-full opacity-55 animate-facts-drift-3"
            style={{
              background: "radial-gradient(circle, #a855f7 0%, #2e1065 50%, #000000 85%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute -bottom-[20%] left-[10%] w-[55%] h-[80%] rounded-full opacity-60 animate-facts-drift-4"
            style={{
              background: "radial-gradient(circle, #6d28d9 0%, #1e0836 55%, transparent 75%)",
              filter: "blur(65px)",
            }}
          />
        </div>

        {/* ═══ LAYER 2: Frosted Geometric Architectural Glass Grid (Exact layout from video) ═══ */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-12 grid-rows-6 z-[1]">
          {/* Left Column Stack */}
          <div className="col-span-3 row-span-3 border-r border-b border-white/[0.08] bg-white/[0.02] backdrop-blur-[20px]" />
          <div className="col-span-3 row-span-3 border-r border-white/[0.08] bg-white/[0.04] backdrop-blur-[32px]" />

          {/* Center-Left Column with Distinctive Arch / Rounded Corner */}
          <div className="col-span-4 row-span-2 border-r border-b border-white/[0.08] bg-white/[0.015] backdrop-blur-[16px]" />
          <div className="col-span-4 row-span-4 border-r border-white/[0.08] bg-white/[0.035] backdrop-blur-[28px] rounded-tl-[100px] sm:rounded-tl-[140px] md:rounded-tl-[180px] border-t border-l border-white/[0.12] shadow-[inset_0_0_40px_rgba(255,255,255,0.03)]" />

          {/* Center-Right Vertical Block */}
          <div className="col-span-3 row-span-4 border-r border-b border-white/[0.08] bg-white/[0.03] backdrop-blur-[24px]" />
          <div className="col-span-3 row-span-2 border-r border-white/[0.08] bg-white/[0.05] backdrop-blur-[36px]" />

          {/* Right Column Stack */}
          <div className="col-span-2 row-span-3 border-b border-white/[0.08] bg-white/[0.025] backdrop-blur-[18px]" />
          <div className="col-span-2 row-span-3 bg-white/[0.04] backdrop-blur-[30px]" />
        </div>

        {/* ═══ LAYER 3: Glass Sheen & Dark Vignette Overlay ═══ */}
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.3) 100%)",
          }}
        />

        {/* ═══ LAYER 4: Centered Content with Embedded Interactive White Pills ═══ */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-2">
          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-white text-base sm:text-2xl md:text-4xl lg:text-[42px] font-medium tracking-tight select-none leading-[2.3] sm:leading-[2.4] md:leading-[2.5]"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <span className="text-white/95">Powering</span>
            <FactPill
              icon={
                <span className="text-[#7c3aed]">
                  <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </span>
              }
              label="160+ Projects"
            />
            <FactPill
              icon={
                <span className="text-[#9333ea]">
                  <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                </span>
              }
              label="Agentic AI"
            />
            <FactPill
              icon={
                <span className="text-[#6d28d9]">
                  <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" />
                    <circle cx="12" cy="11" r="2.5" fill="currentColor" />
                  </svg>
                </span>
              }
              label="OreHack Platform"
            />
            <span className="text-white/95">and</span>
            <FactPill
              icon={
                <span className="text-[#7c3aed]">
                  <svg className="w-3.5 h-3.5 sm:w-5 sm:h-5 fill-none stroke-current" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 8.41m5.96 5.96a14.926 14.926 0 01-5.84 2.58m-.12-8.54a4.5 4.5 0 11-6.364 6.364 4.5 4.5 0 016.364-6.364z" />
                  </svg>
                </span>
              }
              label="40+ Builders"
            />
            <span className="text-white/95">systems</span>{" "}
            <span className="text-white/90">engineered for teams who build without limits.</span>
          </motion.p>
        </div>

      </div>

      {/* ═══ Inline CSS for Smooth Fluid Motion Keyframes ═══ */}
      <style>{`
        @keyframes facts-drift-1 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(8%, 12%) scale(1.15);
          }
          66% {
            transform: translate(-6%, 8%) scale(0.92);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes facts-drift-2 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-10%, -8%) scale(1.12);
          }
          66% {
            transform: translate(8%, -12%) scale(0.95);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes facts-drift-3 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-12%, 14%) scale(1.22);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        @keyframes facts-drift-4 {
          0% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(14%, -10%) scale(1.18);
          }
          100% {
            transform: translate(0, 0) scale(1);
          }
        }
        .animate-facts-drift-1 {
          animation: facts-drift-1 12s ease-in-out infinite;
        }
        .animate-facts-drift-2 {
          animation: facts-drift-2 15s ease-in-out infinite;
        }
        .animate-facts-drift-3 {
          animation: facts-drift-3 18s ease-in-out infinite;
        }
        .animate-facts-drift-4 {
          animation: facts-drift-4 14s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default OregentFacts;
