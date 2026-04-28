import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CurvedLoop from "./CurvedLoop";
import BlurText from "./BlurText";
import { useTheme } from "@/context/ThemeContext";

const FloatingOrb = ({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) => (
  <motion.div
    className={`absolute rounded-full ${color} blur-[120px] pointer-events-none`}
    style={{ width: size, height: size, left: x, top: y }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.15, 0.3, 0.15],
      x: [0, 30, -20, 0],
      y: [0, -20, 15, 0],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

const GridLine = ({ direction, position, delay }: { direction: "h" | "v"; position: string; delay: number }) => (
  <motion.div
    className={`absolute ${direction === "h" ? "h-px w-full left-0" : "w-px h-full top-0"} bg-gradient-to-r from-transparent via-primary/20 to-transparent`}
    style={direction === "h" ? { top: position } : { left: position }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 0.5, 0], scale: 1 }}
    transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const WordsLoop = () => {
  const words = ["Innovation", "Ideation", "Iteration", "Impact"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <span style={{
      position: 'relative',
      display: 'inline-block',
      minWidth: '9ch',
      textAlign: 'center',
      padding: '0 0.1em',
      verticalAlign: 'bottom',
      fontFamily: "'Instrument Serif', serif",
      fontStyle: "italic",
      fontWeight: 500,
      color: "#7c3aed"
    }}>
      <BlurText
        key={words[index]}
        text={words[index]}
        delay={150}
        animateBy="letters"
        direction="top"
        className="inline-block"
        stepDuration={0.8}
      />
    </span>
  );
};

const HeroSection = () => {
  const navigate = useNavigate();
  const { isDayMode } = useTheme();
  const scrollToHackathons = () => {
    navigate("/hackathons");
  };

  const sectionBg = isDayMode ? "#ffffff" : "#000000";
  const headingColor = isDayMode ? "#000000" : "#ffffff";
  const subTextColor = isDayMode ? "#555555" : "#a1a1aa";
  const ctaBg = isDayMode ? "#000000" : "#ffffff";
  const ctaText = isDayMode ? "#ffffff" : "#000000";
  const glowShadow = isDayMode 
    ? "0 0 60px rgba(124, 58, 237, 0.2), 0 0 120px rgba(124, 58, 237, 0.1)" 
    : "0 0 60px rgba(124, 58, 237, 0.45), 0 0 120px rgba(124, 58, 237, 0.2)";

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: sectionBg,
        transition: "background 0.5s ease",
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 grid-bg opacity-10" />
      <FloatingOrb delay={0} size={400} x="5%" y="15%" color="bg-primary/10" />
      <FloatingOrb delay={2} size={300} x="75%" y="55%" color="bg-pink-500/10" />
      <FloatingOrb delay={4} size={250} x="45%" y="5%" color="bg-blue-500/5" />
      
      <GridLine direction="h" position="20%" delay={0} />
      <GridLine direction="v" position="15%" delay={1} />

      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center min-h-screen py-24 text-center">

        {/* TRUST THE BUILD LABEL */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-xs font-bold uppercase tracking-[0.2em] mb-4 orehack-liquid-text"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          (TRUST THE BUILD)
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="max-w-[1200px] text-center"
          style={{
            marginTop: "1rem",
            fontSize: "clamp(2.5rem, 7vw, 92px)",
            lineHeight: "1.2",
            color: headingColor,
            textAlign: "center",
            textShadow: glowShadow,
            transition: "color 0.4s ease, text-shadow 0.4s ease",
          }}
        >
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            letterSpacing: "-0.05em",
            wordSpacing: "0.15em"
          }}>
            A New-Era
          </span>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            letterSpacing: "-0.05em",
            wordSpacing: "0.15em",
            marginLeft: "0.3em"
          }}>
            of
          </span>
          <span style={{ display: 'inline-block', margin: '0 0.3em' }}>
            <WordsLoop />
          </span>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            letterSpacing: "-0.05em",
            wordSpacing: "0.15em",
            marginLeft: "-0.1em",
            marginRight: "0.3em"
          }}>
            via
          </span>
          <br />
          <span style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: "italic",
            fontWeight: 400,
            wordSpacing: "0.15em"
          }}>
            <span className="orehack-liquid-text">
              OreHack
              <img
                src={isDayMode ? "/globeday.png" : "/globe.png"}
                alt=""
                style={{
                  display: 'inline-block',
                  height: '1.0em',
                  width: 'auto',
                  margin: '0 0.3em',
                  verticalAlign: 'middle',
                  marginTop: '-0.15em',
                }}
              />
              Ecosystems
            </span>
          </span>
        </motion.h1>

        {/* Glow divider */}
        <div style={{ position: "relative", marginTop: "2rem", height: "2px", width: "100%", maxWidth: "600px" }}>
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          style={{
            marginTop: "1.5rem",
            maxWidth: "800px"
          }}
        >
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
            color: subTextColor,
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: "1.6",
            letterSpacing: "0.02em",
            transition: "color 0.4s ease",
          }}>
            Are hackathons merely competitions?<br />
            <span style={{ color: "#7c3aed", fontWeight: 500 }}>
              That is precisely what we are here to change.
            </span>
          </p>
        </motion.div>

        <div className="flex items-center gap-4 pt-10">
          <button
            onClick={scrollToHackathons}
            className="group relative inline-flex items-center gap-3 px-8 py-3 rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
            style={{
              fontFamily: "'Outfit', 'Inter', sans-serif",
              fontSize: "0.875rem",
              fontWeight: 800,
              fontStyle: "normal",
              lineHeight: "1.25rem",
              letterSpacing: "normal",
              textTransform: "none",
              background: ctaBg,
              color: ctaText,
              border: "none",
              transition: "background 0.4s ease, color 0.4s ease",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              ENTER ARENA
              <svg
                className="w-4 h-4 transition-transform duration-300 -rotate-45 group-hover:rotate-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>


      </div>
      <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            @keyframes shimmerBtn {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}</style>

      {/* ── Marquee strip at bottom of hero fold ── */}
      <div style={{
        position: "absolute",
        bottom: "20px",
        left: 0,
        right: 0,
        padding: "18px 0px",
        background: "transparent",
        zIndex: 20,
      }}>
        <CurvedLoop
          marqueeText="Power fair and efficient hackathon evaluations ✦ Build a culture of innovation across institutions ✦ Enable colleges to run high-impact hackathons ✦ Drive students from learning to real execution ✦ "
          speed={1.2}
          curveAmount={0}
          direction="left"
          interactive={true}
        />
      </div>
    </section>
  );
};

export default HeroSection;
