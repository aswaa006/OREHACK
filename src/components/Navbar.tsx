import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ScrollProgressProvider,
  ScrollProgress,
} from "./animate-ui/primitives/animate/scroll-progress";
import Shuffle from "./Shuffle";

const NAV_SECTIONS = [
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
  const ORIGIN_ADMIN_TARGET = "192421";
  const ORIGIN_ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

  useEffect(() => {
    const handleScroll = () => {
      const offsets = NAV_SECTIONS.filter((s) => !("route" in s)).map(({ id }) => {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setAdminSequence((prev) => {
        const next = [...prev, e.key].slice(-8);
        const nextSequence = next.join("");

        if (nextSequence.endsWith(ORIGIN_ADMIN_TARGET)) {
          sessionStorage.removeItem(ORIGIN_ADMIN_SESSION_KEY);
          setTimeout(() => navigate("/orehackproject1924"), 100);
          return [];
        }

        if (nextSequence.endsWith(CONTACT_ADMIN_TARGET)) {
          setTimeout(() => navigate("/admin/auth"), 100);
          return [];
        }

        return next;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  const handleNavClick = (id: string, route?: string) => {
    if (route) {
      navigate(route);
      return;
    }
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const getIsActive = (id: string) => activeSection === id;

  return (
    <ScrollProgressProvider global>
      <motion.nav
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        style={{ padding: "24px 0" }}
      >
        {/* ── Floating pill container ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0",
            background: "rgba(14, 13, 20, 0.82)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "9999px",
            padding: "8px 16px 8px 20px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset",
            minWidth: "680px",
          }}
        >
          {/* ── LEFT: Logo + Orehack Shuffle text ── */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0"
            style={{ textDecoration: "none", marginRight: "28px" }}
          >
            <img
              src="/oregent-logo.png"
              alt="Orehack Logo"
              style={{ height: "26px", width: "auto", objectFit: "contain" }}
            />
            <Shuffle
              text="Orehack"
              tag="span"
              className="text-[15px] font-semibold tracking-tight text-white"
              duration={0.35}
              stagger={0.04}
              shuffleDirection="right"
              shuffleTimes={1}
              triggerOnHover={true}
              triggerOnce={false}
            />
          </Link>

          {/* ── CENTER: Nav links ── */}
          <div className="hidden md:flex items-center" style={{ gap: "2px" }}>
            {NAV_SECTIONS.map(({ id, label }) => {
              const isActive = getIsActive(id);
              return (
                <button
                  key={id}
                  onClick={() => handleNavClick(id)}
                  style={{ transition: "color 0.2s ease" }}
                  className={`relative text-[13px] font-medium px-3.5 py-1.5 rounded-full whitespace-nowrap outline-none ${
                    isActive
                      ? "text-white"
                      : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-full"
                      style={{ background: "rgba(255,255,255,0.07)" }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Divider ── */}
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "rgba(255,255,255,0.1)",
              margin: "0 12px",
              flexShrink: 0,
            }}
          />

          {/* ── RIGHT: Live Hackathons pill button ── */}
          <button
            onClick={() => navigate("/hackathons")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#ffffff",
              color: "#0a0a0f",
              border: "none",
              borderRadius: "9999px",
              padding: "6px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "background 0.2s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#e8e8f0";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#ffffff";
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            }}
          >
            {/* Live pulse dot */}
            <span
              style={{
                display: "inline-block",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#22c55e",
                boxShadow: "0 0 6px rgba(34,197,94,0.9)",
                animation: "navPulse 1.8s ease-in-out infinite",
                flexShrink: 0,
              }}
            />
            Live Hackathons
          </button>
        </div>

        {/* Scroll progress bar at very bottom of viewport edge */}
        <ScrollProgress
          mode="width"
          className="h-[1.5px] bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
          style={{ position: "fixed", bottom: 0, left: 0 }}
        />

        <style>{`
          @keyframes navPulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(0.85); }
          }
        `}</style>
      </motion.nav>
    </ScrollProgressProvider>
  );
};

export default Navbar;
