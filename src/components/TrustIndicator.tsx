import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import SplitText from "./SplitText";

const TrustIndicator = () => {
  const [key, setKey] = useState(0);

  // Loop the entire component every 4 seconds (to allow for the 2.5s train duration + 1.5s pause)
  // or exactly 3s as requested. Let's try 3.5s to avoid overlapping resets.
  useEffect(() => {
    const interval = setInterval(() => {
      setKey((prev) => prev + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        marginTop: "28px",
        fontFamily: "'Outfit', 'Inter', sans-serif",
        minHeight: "65px", // Prevent layout jump
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial="hidden"
          animate="visible"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {/* ── 1. Text: SplitText (GSAP Based) ── */}
          <SplitText
            text="Trusted by hundreds"
            className="text-[12px] font-normal"
            delay={50}
            duration={0.5}
            ease="power3.out"
            textAlign="center"
            style={{ color: "#ffffff", opacity: 0.9 }}
          />

          {/* ── Stars & Rating Row ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", gap: "2px" }}>
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: [0, 1],
                  }}
                  transition={{
                    duration: 1.2,
                    // Delay relative to the text animation (approx 0.5s after start)
                    delay: 0.5 + (i * 0.15), 
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="#7c3aed"
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(124, 58, 237, 0.4))"
                    }}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </motion.div>
              ))}
            </div>

            {/* ── 3. Rating Text ── */}
            <motion.span
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: 1.5,
                ease: "easeOut" 
              }}
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#ffffff",
                marginLeft: "4px",
                letterSpacing: "0.05em",
              }}
            >
              4.0+
            </motion.span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TrustIndicator;
