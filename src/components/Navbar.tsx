import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Shuffle from "./Shuffle";

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
      const heroHeight = window.innerHeight - 100; // Buffer for hero section

      // Always visible at the top (Hero section)
      if (currentScrollY <= heroHeight) {
        setIsVisible(true);
      } else {
        // Scroll direction detection
        if (currentScrollY > lastScrollY) {
          // Scrolling down
          setIsVisible(false);
        } else {
          // Scrolling up
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

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] // Smooth transition
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
        background: "#000000",
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
        <div
          style={{ display: "inline-block" }}
        >
          <span
            className="text-2xl font-bold tracking-[0.05em] orehack-liquid-text"
            style={{
              color: "#7c3aed",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              letterSpacing: "-0.05em",
              lineHeight: "2.4rem",
              fontSize: "2rem"
            }}
          >
            OREHACK ++
          </span>
        </div>
      </Link>

      {/* ── RIGHT: Nav links ── */}
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
                color: isActive ? "#ffffff" : "rgba(255,255,255,0.5)",
                position: "relative",
                transition: "color 0.2s ease",
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(255,255,255,0.85)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "rgba(255,255,255,0.5)";
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
      </div>
    </motion.nav>
  );
};
export default Navbar;
