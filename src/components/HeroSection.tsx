import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CurvedLoop from "./CurvedLoop";

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

        {/* ── Trusted by section ── */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          marginTop: "24px",
          fontFamily: "'Inter', sans-serif",
        }}>
          <span style={{
            fontSize: "12px",
            fontWeight: 400,
            color: "#ffffff",
            opacity: 0.9,
          }}>
            Trusted by hundreds
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ display: "flex", gap: "2px" }}>
              {[...Array(4)].map((_, i) => (
                <svg
                  key={i}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="#7c3aed"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span style={{
              fontSize: "12px",
              fontWeight: 400,
              color: "#ffffff",
              marginLeft: "4px"
            }}>
              4.0+
            </span>
          </div>
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
        padding: "18px 0",
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
