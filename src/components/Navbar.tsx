import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Shuffle from "./Shuffle";

const NAV_SECTIONS = [
  { id: "home",         label: "Home" },
  { id: "how-it-works", label: "How It Works" },
  { id: "about",        label: "About" },
  { id: "contact",      label: "Contact" },
];

const Navbar = () => {
  const [activeSection, setActiveSection] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const [adminSequence, setAdminSequence] = useState<string[]>([]);
  const CONTACT_ADMIN_TARGET = "12345678";
  const ORIGIN_ADMIN_TARGET  = "192421";
  const ORIGIN_ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

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
    <nav
      style={{
        position: "fixed",
        top: "10px",
        left: "100px",
        right: "100px",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        height: "60px",
        background: "transparent",
      }}
    >
      {/* ── LEFT: OREHACK wordmark ── */}
      <Link
        to="/"
        style={{
          textDecoration: "none",
          userSelect: "none",
          marginTop: "12px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <motion.div
          whileHover={{ 
            scale: 1.08,
            filter: "drop-shadow(0 0 10px rgba(124, 58, 237, 0.7))",
          }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 17 
          }}
          style={{ display: "inline-block" }}
        >
          <Shuffle
            text="Orehack"
            tag="span"
            className="text-2xl font-bold tracking-[0.05em] uppercase"
            style={{ 
              color: "#7c3aed", 
              fontFamily: "'Press Start 2P', monospace", 
              lineHeight: "2rem", 
              fontSize: "1.6rem" 
            }}
            duration={0.4}
            stagger={0.05}
            shuffleDirection="right"
            shuffleTimes={1}
            triggerOnHover={true}
            triggerOnce={false}
          />
        </motion.div>
      </Link>

      {/* ── RIGHT: Nav links ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
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
                fontSize: "0.75rem",    /* 12px */
                fontWeight: 500,
                lineHeight: "1.25rem",  /* 20px */
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
                    background: "#ffffff",
                    borderRadius: "1px",
                  }}
                />
              )}
            </button>
          );
        })}


      </div>
    </nav>
  );
};

export default Navbar;
