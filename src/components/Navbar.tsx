import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Shuffle from "./Shuffle";
import { useTheme } from "@/context/ThemeContext";

const NAV_SECTIONS = [
  { id: "home", label: "Home" },
  { id: "how-it-works", label: "How It Works" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

const Navbar = () => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isDayMode, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const [adminSequence, setAdminSequence] = useState<string[]>([]);
  const CONTACT_ADMIN_TARGET = "12345678";
  const ORIGIN_ADMIN_TARGET = "192421";
  const ORIGIN_ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

  /* ── Smart scroll visibility logic ── */
  useEffect(() => {
    const handleScrollVisibility = () => {
      const currentScrollY = window.scrollY;
      const heroHeight = window.innerHeight - 100;

      if (currentScrollY <= heroHeight) {
        setIsVisible(true);
      } else {
        if (currentScrollY > lastScrollY) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScrollVisibility, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollVisibility);
  }, [lastScrollY]);

  /* ── Scroll-active section detection ── */
  useEffect(() => {
    const handleScroll = () => {
      const offsets = NAV_SECTIONS.map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return { id, top: Infinity };
        return { id, top: Math.abs(el.getBoundingClientRect().top - 80) };
      });
      if (offsets.length === 0) return;
      const closest = offsets.reduce((a, b) => (a.top < b.top ? a : b));
      setActiveSection(closest.id);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ── Hidden admin key sequence ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setAdminSequence((prev) => {
        const next = [...prev, e.key].slice(-8);
        const seq = next.join("");
        if (seq.endsWith(ORIGIN_ADMIN_TARGET)) {
          sessionStorage.removeItem(ORIGIN_ADMIN_SESSION_KEY);
          setTimeout(() => navigate("/orehackproject1924"), 100);
          return [];
        }
        if (seq.endsWith(CONTACT_ADMIN_TARGET)) {
          setTimeout(() => navigate("/admin/auth"), 100);
          return [];
        }
        return next;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const handleNavClick = (id: string) => {
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Day mode colours
  const navBg = isDayMode ? "#ffffff" : "#000000";
  const activeLinkColor = isDayMode ? "#000000" : "#ffffff";
  const inactiveLinkColor = isDayMode ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)";
  const inactiveLinkHover = isDayMode ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.85)";

  // JOIN US / CTA – night: white bg + black text; day: black bg + white text
  const ctaBg = isDayMode ? "#000000" : "#ffffff";
  const ctaText = isDayMode ? "#ffffff" : "#000000";

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 140px",
        height: "100px",
        background: navBg,
        transition: "background 0.4s ease",
      }}
    >
      {/* ── LEFT: OREHACK wordmark ── */}
      <Link
        to="/"
        style={{
          textDecoration: "none",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div style={{ display: "inline-block" }}>
          <span
            className="text-2xl font-bold tracking-[0.05em] orehack-liquid-text"
            style={{
              color: "#7c3aed",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              letterSpacing: "-0.05em",
              lineHeight: "2.4rem",
              fontSize: "2rem",
            }}
          >
            OREHACK ++
          </span>
        </div>
      </Link>

      {/* ── RIGHT: Nav links + theme toggle ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "48px",
        }}
      >
        {NAV_SECTIONS.map(({ id, label }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              onClick={() => handleNavClick(id)}
              style={{
                background: "none",
                border: "none",
                padding: "4px 0",
                cursor: "pointer",
                fontFamily: "'Outfit', 'Inter', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 550,
                lineHeight: "1.4rem",
                fontStyle: "normal",
                textTransform: "none",
                color: isActive ? activeLinkColor : inactiveLinkColor,
                position: "relative",
                transition: "color 0.2s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color = inactiveLinkHover;
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color = inactiveLinkColor;
              }}
            >
              {label}
              {/* Active underline */}
              {isActive && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "1.5px",
                    background: "#7c3aed",
                    borderRadius: "1px",
                  }}
                />
              )}
            </button>
          );
        })}

        {/* ── Theme Toggle Button ── */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={isDayMode ? "Switch to Night mode" : "Switch to Day mode"}
          style={{
            background: "none",
            border: isDayMode ? "1.5px solid rgba(0,0,0,0.18)" : "1.5px solid rgba(255,255,255,0.18)",
            borderRadius: "50px",
            padding: "6px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "7px",
            fontSize: "0.78rem",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            color: isDayMode ? "#000000" : "#ffffff",
            transition: "all 0.3s ease",
            letterSpacing: "0.04em",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isDayMode ? "sun" : "moon"}
              initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex", alignItems: "center" }}
            >
              {isDayMode ? (
                /* Sun icon */
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                /* Moon icon */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </motion.span>
          </AnimatePresence>
          {isDayMode ? "Day" : "Night"}
        </button>

        {/* JOIN US CTA Button */}
        <button
          className="group relative inline-flex items-center gap-2 px-5 py-1.5 rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.05] hover:shadow-lg active:scale-[0.98]"
          style={{
            background: ctaBg,
            color: ctaText,
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontSize: "0.85rem",
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            transition: "background 0.4s ease, color 0.4s ease",
          }}
        >
          <span className="relative z-10 flex items-center gap-1.5">
            JOIN US
            <svg
              className="w-3.5 h-3.5 transition-transform duration-300 -rotate-45 group-hover:rotate-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>
    </motion.nav>
  );
};
export default Navbar;
