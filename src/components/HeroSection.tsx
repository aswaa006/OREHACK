import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CurvedLoop from "./CurvedLoop";
import TrustIndicator from "./TrustIndicator";

const HeroSection = () => {
  const navigate = useNavigate();
  const scrollToHackathons = () => {
    navigate("/hackathons");
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">



      <div className="relative z-10 container mx-auto px-6 flex flex-col items-center justify-center min-h-screen py-24 text-center">

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
          className="text-sm md:text-base text-muted-foreground/70 max-w-lg leading-relaxed font-mono tracking-tight mt-2"
        >
          Engineered by Oregent to process and validate competitive builds
          through structured intelligence.
        </motion.p>

        <div className="flex items-center gap-4 pt-14">
          <button
            onClick={scrollToHackathons}
            className="cursor-target group relative inline-flex items-center gap-3 px-8 py-3 rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
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
              Enter Arena
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
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

        <TrustIndicator />
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
        padding: "18px 140px",
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
