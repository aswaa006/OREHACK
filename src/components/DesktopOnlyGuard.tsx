import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────────────*/
const DESKTOP_THRESHOLD = 1024; // px — anything below is restricted

/* ─────────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────────────*/

/** Floating ambient orb (matches HeroSection / Contact style) */
const FloatingOrb = ({
  delay,
  size,
  x,
  y,
  color,
}: {
  delay: number;
  size: number;
  x: string;
  y: string;
  color: string;
}) => (
  <motion.div
    className={`absolute rounded-full ${color} pointer-events-none`}
    style={{ width: size, height: size, left: x, top: y, filter: "blur(100px)" }}
    animate={{
      scale: [1, 1.25, 1],
      opacity: [0.18, 0.35, 0.18],
      x: [0, 28, -18, 0],
      y: [0, -22, 14, 0],
    }}
    transition={{ duration: 9, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

/** Animated laptop / desktop SVG illustration */
const DesktopIllustration = () => (
  <motion.div
    className="relative flex items-center justify-center"
    initial={{ opacity: 0, scale: 0.6, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
  >
    {/* Outer glow rings */}
    {[180, 220, 260].map((size, i) => (
      <motion.div
        key={size}
        className="absolute rounded-full border border-purple-500/20"
        style={{ width: size, height: size }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.15, 0.4] }}
        transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
      />
    ))}

    {/* Pulsing sonar ring */}
    <motion.div
      className="absolute rounded-full border border-purple-400/30"
      style={{ width: 160, height: 160 }}
      animate={{ scale: [0.8, 1.6], opacity: [0.6, 0] }}
      transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
    />

    {/* Icon container */}
    <motion.div
      className="relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(59,130,246,0.08))",
        border: "1px solid rgba(124,58,237,0.35)",
        boxShadow: "0 0 40px rgba(124,58,237,0.25), 0 0 80px rgba(124,58,237,0.1)",
        backdropFilter: "blur(16px)",
      }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Desktop monitor SVG */}
      <svg
        width="52"
        height="52"
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Screen */}
        <rect x="4" y="4" width="44" height="30" rx="4" stroke="url(#desktopGrad)" strokeWidth="2.2" fill="none" />
        {/* Inner screen glow */}
        <rect x="8" y="8" width="36" height="22" rx="2" fill="rgba(124,58,237,0.12)" />
        {/* Cursor blink on screen */}
        <motion.rect
          x="18" y="14" width="2" height="10"
          rx="1"
          fill="#7c3aed"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: "steps(2)" }}
        />
        {/* Code lines on screen */}
        <rect x="22" y="16" width="12" height="1.5" rx="0.75" fill="rgba(124,58,237,0.5)" />
        <rect x="22" y="20" width="8" height="1.5" rx="0.75" fill="rgba(59,130,246,0.4)" />
        <rect x="22" y="24" width="14" height="1.5" rx="0.75" fill="rgba(124,58,237,0.3)" />
        {/* Stand */}
        <path d="M22 34 L22 41 L30 41 L30 34" stroke="url(#desktopGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Base */}
        <rect x="16" y="41" width="20" height="3" rx="1.5" stroke="url(#desktopGrad)" strokeWidth="2.2" fill="none" />
        <defs>
          <linearGradient id="desktopGrad" x1="4" y1="4" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  </motion.div>
);

/** Animated grid background */
const GridBackground = () => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage:
        "linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)",
      backgroundSize: "60px 60px",
    }}
  />
);

/** Shimmer border sweep on the glass card */
const ShimmerBorder = () => (
  <motion.div
    className="absolute inset-0 rounded-3xl pointer-events-none"
    style={{
      background:
        "linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.5) 45%, rgba(59,130,246,0.6) 50%, rgba(124,58,237,0.5) 55%, transparent 100%)",
      backgroundSize: "200% 100%",
      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      maskComposite: "exclude",
      WebkitMaskComposite: "xor",
      padding: "1px",
    }}
    animate={{ backgroundPosition: ["200% 0%", "-200% 0%"] }}
    transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
  />
);

/* ─────────────────────────────────────────────────────────────
   Restriction Screen
───────────────────────────────────────────────────────────────*/
const RestrictionScreen = () => {
  return (
    <motion.div
      key="restriction"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden"
      style={{ background: "#000000" }}
    >
      {/* Grid bg */}
      <GridBackground />

      {/* Floating orbs */}
      <FloatingOrb delay={0} size={500} x="-10%" y="-15%" color="bg-purple-600/15" />
      <FloatingOrb delay={2} size={400} x="70%" y="55%" color="bg-blue-500/10" />
      <FloatingOrb delay={4} size={350} x="40%" y="-5%" color="bg-purple-500/08" />
      <FloatingOrb delay={1.5} size={300} x="85%" y="10%" color="bg-indigo-500/10" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-lg w-full">

        {/* Illustration */}
        <DesktopIllustration />

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-10 w-full rounded-3xl overflow-hidden"
          style={{
            background: "rgba(10, 0, 20, 0.7)",
            border: "1px solid rgba(124,58,237,0.2)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 0 60px rgba(124,58,237,0.12), 0 30px 80px rgba(0,0,0,0.5)",
            padding: "40px 36px 44px",
          }}
        >
          <ShimmerBorder />

          {/* TRUST THE BUILD eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="text-[10px] font-bold uppercase tracking-[0.22em] mb-5 orehack-liquid-text"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            (TRUST THE BUILD)
          </motion.p>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            style={{
              fontFamily: 'ui-serif, Georgia, "Times New Roman", serif',
              fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              textShadow: "0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.2)",
              marginBottom: "1rem",
            }}
          >
            Desktop Access{" "}
            <span
              style={{
                fontFamily: '"Playfair Display", serif',
                fontStyle: "italic",
                color: "#7c3aed",
                textShadow: "0 0 30px rgba(124,58,237,0.9)",
              }}
            >
              Only
            </span>
          </motion.h1>

          {/* Glow divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="w-full mb-5"
            style={{ position: "relative", height: "1px" }}
          >
            <div
              style={{
                width: "100%",
                height: "1px",
                background:
                  "linear-gradient(to right, transparent, rgba(124,58,237,0.7), rgba(59,130,246,0.5), rgba(124,58,237,0.7), transparent)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "-10px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "60%",
                height: "20px",
                background: "radial-gradient(ellipse at center, rgba(124,58,237,0.35) 0%, transparent 70%)",
                filter: "blur(6px)",
                pointerEvents: "none",
              }}
            />
          </motion.div>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.05 }}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(0.85rem, 2vw, 0.95rem)",
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.7,
              marginBottom: "0.85rem",
            }}
          >
            To maintain{" "}
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>
              platform stability, secure interactions, and optimal usability
            </span>
            , desktop access is currently required.
          </motion.p>

          {/* Additional message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.15 }}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "clamp(0.78rem, 1.8vw, 0.85rem)",
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.6,
              marginBottom: "2.2rem",
            }}
          >
            Please return on a tablet or desktop environment to access the interface.
          </motion.p>

          {/* Device width badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 1.25 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 18px",
              borderRadius: "50px",
              background: "rgba(124,58,237,0.1)",
              border: "1px solid rgba(124,58,237,0.3)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Pulsing dot */}
            <motion.span
              animate={{ opacity: [1, 0.3, 1], scale: [1, 0.8, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#7c3aed",
                display: "block",
                boxShadow: "0 0 8px rgba(124,58,237,0.9)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#a78bfa",
              }}
            >
              Minimum 1024px required
            </span>
          </motion.div>
        </motion.div>

        {/* OREHACK wordmark at bottom */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="mt-8 text-xs font-bold tracking-[0.2em] uppercase orehack-liquid-text"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          OREHACK ++
        </motion.p>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main Guard Component
───────────────────────────────────────────────────────────────*/
interface DesktopOnlyGuardProps {
  children: React.ReactNode;
}

const DesktopOnlyGuard: React.FC<DesktopOnlyGuardProps> = ({ children }) => {
  const getIsDesktop = useCallback(
    () => typeof window !== "undefined" && window.innerWidth >= DESKTOP_THRESHOLD,
    []
  );

  const [isDesktop, setIsDesktop] = useState<boolean>(() => getIsDesktop());
  // Track whether the initial measurement has happened (avoids hydration flash)
  const measured = useRef(false);

  useEffect(() => {
    // First measurement on mount — update if SSR defaulted incorrectly
    setIsDesktop(getIsDesktop());
    measured.current = true;

    const onResize = () => setIsDesktop(getIsDesktop());

    // Debounced so rapid resize events don't hammer state
    let timer: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timer);
      timer = setTimeout(onResize, 120);
    };

    window.addEventListener("resize", debouncedResize, { passive: true });
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timer);
    };
  }, [getIsDesktop]);

  return (
    <>
      <AnimatePresence mode="wait">
        {!isDesktop && <RestrictionScreen key="restriction" />}
      </AnimatePresence>

      {/* Children always render in DOM but hidden on small screens — avoids flash */}
      <div
        style={{
          visibility: isDesktop ? "visible" : "hidden",
          pointerEvents: isDesktop ? "auto" : "none",
          // height collapse prevents any scrollable space leaking through
          height: isDesktop ? "auto" : 0,
          overflow: isDesktop ? "visible" : "hidden",
        }}
        aria-hidden={!isDesktop}
      >
        {children}
      </div>
    </>
  );
};

export default DesktopOnlyGuard;
