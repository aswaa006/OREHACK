import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./Navbar.module.css";

interface CenterSectionProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  progress: number;
}

export const CenterSection = ({
  theme,
  setTheme,
  progress,
}: CenterSectionProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const percentage = (scrollTop / scrollHeight) * 100;
      setScrollProgress(percentage);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex items-center justify-center gap-6 md:gap-10">

      {/* ===== Left Menu Icon (3 Lines) ===== */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => console.log('hamburger clicked')}
        aria-label="Menu"
        className="flex flex-col justify-between w-6 h-5 cursor-pointer"
      >
        <span className="h-0.5 w-full bg-foreground transition-all duration-300" />
        <span className="h-0.5 w-full bg-foreground transition-all duration-300" />
        <span className="h-0.5 w-full bg-foreground transition-all duration-300" />
      </motion.button>

      {/* ===== Theme Toggle ===== */}
      <motion.button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary/20 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M14.845 8.36965C14.7735 9.69243 14.3205 10.9662 13.5406 12.037C12.7607 13.1079 11.6874 13.9298 10.4503 14.4036C9.21321 14.8774 7.86538 14.9827 6.56972 14.7068C5.27407 14.431 4.08605 13.7857 3.14929 12.849C2.21253 11.9123 1.56714 10.7244 1.29113 9.42878C1.01511 8.13315 1.12029 6.78531 1.59395 5.54818C2.06762 4.31106 2.88948 3.23761 3.9602 2.45761C5.03092 1.67761 6.30465 1.22444 7.62741 1.1529C7.93599 1.13613 8.09752 1.50337 7.9337 1.7647C7.38581 2.64132 7.15121 3.67774 7.26818 4.70485C7.38515 5.73196 7.84679 6.6891 8.57776 7.42008C9.30873 8.15105 10.2659 8.61269 11.293 8.72966C12.3201 8.84662 13.3565 8.61203 14.2331 8.06413C14.4953 7.90033 14.8617 8.06108 14.845 8.36965Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 180 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <circle cx="10" cy="10" r="5" />
            </svg>
          </motion.div>
        )}
      </motion.button>

      {/* ===== Progress Indicator ===== */}
      <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
        <span className="text-xs font-semibold text-foreground tabular-nums">
          {Math.round(scrollProgress)}%
        </span>

        <div className="w-20 h-2 bg-secondary/20 rounded-full overflow-hidden">
          <motion.div
            className={styles.progressBar}
            animate={{ width: `${scrollProgress}%` }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};