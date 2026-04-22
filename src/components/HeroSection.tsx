import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CurvedLoop from "./CurvedLoop";
import BlurText from "./BlurText";

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
  const scrollToHackathons = () => {
    navigate("/hackathons");
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center min-h-screen py-24 text-center">

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          className="max-w-[1200px] text-center"
          style={{
            marginTop: "4rem",
            fontSize: "clamp(2.5rem, 7vw, 92px)",
            lineHeight: "1.2",
            color: "#ffffff",
            textAlign: "center"
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
                src="/globe.png"
                alt=""
                style={{
                  display: 'inline-block',
                  height: '1.0em',
                  width: 'auto',
                  margin: '0 0.3em',
                  verticalAlign: 'middle',
                  marginTop: '-0.15em'
                }}
              />
              Ecosystems
            </span>
          </span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          style={{
            marginTop: "2.5rem",
            maxWidth: "800px"
          }}
        >
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
            color: "#a1a1aa",
            fontWeight: 400,
            fontStyle: "italic",
            lineHeight: "1.6",
            letterSpacing: "0.02em"
          }}>
            Are hackathons merely competitions?<br />
            <span style={{ color: "#7c3aed", fontWeight: 500 }}>
              That is precisely what we are here to change.
            </span>
          </p>
        </motion.div>

        <div className="flex items-center gap-4 pt-12">
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
              background: "#ffffff",
              color: "#000000",
              border: "none"
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
