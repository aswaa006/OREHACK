import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ScrollProgressProvider,
  ScrollProgress,
} from "./animate-ui/primitives/animate/scroll-progress";
import Shuffle from "./Shuffle";

const NAV_SECTIONS = [
  { id: "hackathons", label: "Live Hackathons" },
  { id: "how-it-works", label: "How It Works" },
  { id: "about", label: "About Oregent" },
  { id: "contact", label: "Contact" },
];

const Navbar = () => {
  const [activeSection, setActiveSection] = useState<string>("");
  const navigate = useNavigate();
  const [adminSequence, setAdminSequence] = useState<string[]>([]);
  const CONTACT_ADMIN_TARGET = "12345678";
  const ORIGIN_ADMIN_TARGET = "192421";
  const ORIGIN_ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

  useEffect(() => {
    const handleScroll = () => {
      // Active section detection
      const offsets = NAV_SECTIONS.map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return { id, top: Infinity };
        return { id, top: Math.abs(el.getBoundingClientRect().top - 80) };
      });
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

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <ScrollProgressProvider global>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed top-0 left-0 right-0 z-50 bg-transparent border-b border-transparent"
      >
        {/* Three-column grid: left | center | right */}
        <div className="w-full grid grid-cols-3 items-center py-3.5 px-8">

          {/* ── LEFT: Shuffle animated "Orehack" title ── */}
          <div className="flex items-center">
            <Link to="/" className="group">
              <Shuffle
                text="Orehack"
                tag="span"
                className="text-2xl font-bold tracking-tight text-foreground"
                duration={0.35}
                stagger={0.04}
                shuffleDirection="right"
                shuffleTimes={1}
                triggerOnHover={true}
                triggerOnce={false}
              />
            </Link>
          </div>

          {/* ── CENTER: Navigation buttons ── */}
          <div className="hidden md:flex items-center justify-center gap-1">
            {NAV_SECTIONS.map(({ id, label }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  style={{ transition: "all 0.3s ease" }}
                  className={`relative text-sm px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {/* Active background pill */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-lg bg-white/[0.06] border border-white/[0.08]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  {/* Active bottom accent */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-line"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              );
            })}
          </div>

          {/* ── RIGHT: Logo + "from Oregent" branding ── */}
          <div className="flex items-center justify-end">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/oregent-logo.png"
                alt="Oregent Logo"
                className="h-8 w-auto object-contain"
              />
              <div className="flex flex-col justify-center">
                <span className="text-[11px] text-muted-foreground font-medium leading-none uppercase tracking-wider">
                  from Oregent
                </span>
              </div>
            </Link>
          </div>

        </div>

        <ScrollProgress
          mode="width"
          className="h-[1px] bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
          style={{ position: "absolute", bottom: 0, left: 0 }}
        />
      </motion.nav>
    </ScrollProgressProvider>
  );
};

export default Navbar;
