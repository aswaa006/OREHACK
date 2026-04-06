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
      <div className="absolute inset-0 grid-bg opacity-30" />

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
            className="text-sm md:text-base text-muted-foreground/70 max-w-lg leading-relaxed"
          >
            Engineered by Oregent to process and validate competitive builds
            through structured intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
            className="pt-2"
          >
            <button
              onClick={scrollToHackathons}
              style={{ transition: "all 0.3s ease" }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm tracking-wide glow-primary hover:bg-[#9333ea] hover:text-white hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] hover:-translate-y-1"
            >
              View Active Hackathons
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </motion.div>
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
