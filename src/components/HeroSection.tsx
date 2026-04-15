import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import Shuffle from "./Shuffle";

const OregentLogo3D = lazy(() => import("./OregentLogo3D"));

const HeroSection = () => {
  const scrollToHackathons = () => {
    const el = document.getElementById("hackathons");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
      <div
        className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/8 blur-[100px] animate-pulse-glow"
        style={{ animationDelay: "1.5s" }}
      />

      <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-screen py-24">
        {/* Left — Text Content */}
        <div className="flex flex-col items-start justify-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <Shuffle
              text="Orehack"
              tag="h1"
              className="text-5xl md:text-7xl font-bold tracking-tight mb-4"
              duration={0.4}
              stagger={0.05}
              shuffleDirection="right"
              shuffleTimes={1}
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="text-lg md:text-xl text-muted-foreground font-medium tracking-wide"
          >
            A Controlled Technical Evaluation System.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="text-sm md:text-base text-muted-foreground/70 max-w-lg leading-relaxed font-mono tracking-tight"
          >
            Engineered by Oregent to process and validate competitive builds
            through structured intelligence.
          </motion.p>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={scrollToHackathons}
                className="group relative inline-flex items-center gap-3 px-7 py-3.5 rounded-xl font-semibold text-sm tracking-wide overflow-hidden"
                style={{ transition: "all 0.35s cubic-bezier(0.22,1,0.36,1)" }}
              >
                {/* Animated conic border */}
                <span
                  className="pointer-events-none absolute -inset-[1px] rounded-xl"
                  style={{
                    background: "conic-gradient(from 0deg, #7c3aed, #a855f7, #ec4899, #7c3aed)",
                    animation: "spin 3s linear infinite",
                    opacity: 0.85,
                  }}
                />
                {/* Inner fill */}
                <span className="absolute inset-[1.5px] rounded-[10px] bg-[#0b0713]" style={{ transition: "background 0.3s ease" }} />
                {/* Shimmer sweep */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
                  style={{
                    background: "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.12) 50%, transparent 80%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmerBtn 1.4s ease infinite",
                    transition: "opacity 0.3s ease",
                  }}
                />
                {/* Text & icon */}
                <span className="relative z-10 text-white flex items-center gap-2">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
                    style={{ boxShadow: "0 0 6px rgba(52,211,153,0.9)", animation: "pulse 1.8s ease-in-out infinite" }}
                  />
                  View Active Hackathons
                  <svg
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
            </div>
            <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
              @keyframes shimmerBtn {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
        </div>

        {/* Right — 3D Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-[420px] lg:h-[580px] cursor-grab active:cursor-grabbing"
          style={{ pointerEvents: "auto" }}
        >
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            }
          >
            <Canvas
              camera={{ position: [0, 0, 6], fov: 42 }}
              dpr={[1, 2]}
              style={{ background: "transparent" }}
            >
              <OregentLogo3D />
            </Canvas>
          </Suspense>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
