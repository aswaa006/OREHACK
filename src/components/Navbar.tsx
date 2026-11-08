import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Shuffle from "./Shuffle";
import { useTheme } from "@/context/ThemeContext";
import { Menu, X } from "lucide-react";

const NAV_SECTIONS = [
  { id: "home", label: "Home" },
  { id: "how-it-works", label: "Empower" },
  { id: "about", label: "About" },
];

const Navbar = () => {
  const [activeSection, setActiveSection] = useState<string>("");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDayMode } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();
  const [adminSequence, setAdminSequence] = useState<string[]>([]);
  const CONTACT_ADMIN_TARGET = "12345678";
  const ORIGIN_ADMIN_TARGET = "192421";
  const ORIGIN_ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

  /* ── Desktop scroll hide/reveal logic ── */
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
      if (location.pathname !== "/") {
        setActiveSection("");
        return;
      }
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
  }, [location.pathname]);

  /* ── Prevent background scroll when mobile menu is open ── */
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  /* ── Close mobile menu on route change ── */
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
    setIsMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    const isMobileViewport = window.innerWidth <= 768;
    if (el) el.scrollIntoView({ behavior: isMobileViewport ? "auto" : "smooth" });
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
    <>
    <header
      id="site-navbar"
      className={`site-header-nav ${!isVisible && !isMobileMenuOpen ? "desktop-hidden" : ""}`}
      style={{
        background: navBg,
      }}
    >
      {/* ── BRAND: Desktop Wordmark (Shown on desktop) ── */}
      <Link
        to="/"
        onClick={() => setIsMobileMenuOpen(false)}
        className="desktop-brand"
      >
        <span
          className="font-bold orehack-liquid-text nav-brand-text"
          style={{
            color: "#7c3aed",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.04em",
            fontSize: "1.32rem",
            lineHeight: "1.2",
            whiteSpace: "nowrap",
          }}
        >
          OREGENT .
        </span>
      </Link>

      {/* ── BRAND: Mobile Pill Logo image (Shown on mobile, as requested) ── */}
      <Link
        to="/"
        onClick={() => setIsMobileMenuOpen(false)}
        className="mobile-pill-brand"
        aria-label="Oregent Home"
      >
        <img
          src="/oregent-logo.png"
          alt="Oregent"
          className="mobile-pill-logo"
        />
      </Link>

      {/* ── RIGHT: Desktop Nav links + CTA (Hidden on mobile via CSS) ── */}
      <div className="desktop-nav-controls">
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

        {/* JOIN US CTA Button (Desktop) */}
        <button
          onClick={() => handleNavClick("contact")}
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

      {/* ── RIGHT: Mobile Pill Controls (JOIN US button + 2-bar menu button) ── */}
      <div className="mobile-nav-controls">
        <button
          type="button"
          onClick={() => handleNavClick("contact")}
          className="mobile-pill-join"
          style={{
            background: ctaBg,
            color: ctaText,
            border: "none",
            borderRadius: "9999px",
            fontFamily: "'Outfit', 'Inter', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 700,
            cursor: "pointer",
            padding: "6px 12px",
            letterSpacing: "0.02em",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            transition: "transform 0.2s ease, opacity 0.2s ease",
          }}
        >
          <span>JOIN US</span>
          <svg
            className="w-3 h-3 -rotate-45"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Menu Toggle Button (2-line hamburger matching user image / Close X) */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          style={{
            background: "none",
            border: "none",
            padding: "6px 2px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: isDayMode ? "#000000" : "#ffffff",
            cursor: "pointer",
          }}
        >
          {isMobileMenuOpen ? (
            <X size={22} strokeWidth={2.4} color={isDayMode ? "#000000" : "#ffffff"} />
          ) : (
            <div className="flex flex-col justify-center items-center gap-[5px] w-5 h-5">
              <span
                className="block h-[2px] w-5 rounded-full"
                style={{ background: isDayMode ? "#000000" : "#ffffff" }}
              />
              <span
                className="block h-[2px] w-5 rounded-full"
                style={{ background: isDayMode ? "#000000" : "#ffffff" }}
              />
            </div>
          )}
        </button>
      </div>
    </header>

    {/* ── Mobile Floating Menu Card & Backdrop (Matches pill design) ── */}
    <AnimatePresence>
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9990] md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Floating Dropdown Card */}
          <motion.div
            key="mobile-nav-panel"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mobile-nav-dropdown-card md:hidden"
            style={{
              background: isDayMode ? "#ffffff" : "#000000",
              borderColor: isDayMode ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.22)",
            }}
          >
            {/* Navigation links */}
            <div className="flex flex-col gap-1 py-1">
              {NAV_SECTIONS.map(({ id, label }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handleNavClick(id)}
                    className="w-full text-left py-3 px-3 rounded-xl flex items-center justify-between transition-colors"
                    style={{
                      background: isActive ? (isDayMode ? "rgba(0,0,0,0.04)" : "rgba(255,255,255,0.06)") : "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "'Outfit', 'Inter', sans-serif",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      color: isActive ? "#7c3aed" : (isDayMode ? "#000000" : "#ffffff"),
                    }}
                  >
                    <span>{label}</span>
                    {isActive && (
                      <span
                        style={{
                          width: "7px",
                          height: "7px",
                          borderRadius: "50%",
                          background: "#7c3aed",
                          boxShadow: "0 0 8px #7c3aed",
                        }}
                      />
                    )}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate("/hackathons");
                }}
                className="w-full text-left py-3 px-3 rounded-xl flex items-center justify-between transition-colors"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: isDayMode ? "#000000" : "#ffffff",
                }}
              >
                <span>Hackathons</span>
              </button>
            </div>

            {/* Bottom Full-Width Pill CTA Button */}
            <div
              className="w-full pt-3 mt-2 border-t"
              style={{ borderColor: isDayMode ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.08)" }}
            >
              <button
                type="button"
                onClick={() => handleNavClick("contact")}
                className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                style={{
                  background: ctaBg,
                  color: ctaText,
                  fontFamily: "'Outfit', 'Inter', sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: isDayMode ? "0 4px 16px rgba(0,0,0,0.12)" : "0 4px 20px rgba(124,58,237,0.25)",
                }}
              >
                <span>JOIN US</span>
                <svg
                  className="w-4 h-4 -rotate-45"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
};
export default Navbar;
