import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ScrollProgressProvider,
  ScrollProgress,
} from "./animate-ui/primitives/animate/scroll-progress";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const [adminSequence, setAdminSequence] = useState<string[]>([]);
  const TARGET = ["1", "2", "3", "4", "5", "6", "7", "8"];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setAdminSequence((prev) => {
        const next = [...prev, e.key].slice(-8);
        if (next.join("") === TARGET.join("")) {
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "surface-elevated backdrop-blur-xl bg-card/80" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-foreground">
              Ore<span className="text-gradient-primary">hack</span>
            </span>
            <span className="text-xs text-muted-foreground font-medium mt-1">by Oregent</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("hackathons")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Live Hackathons
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              About Oregent
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
            >
              Contact
            </button>
          </div>
        </div>

        <ScrollProgress
          mode="width"
          className="h-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full"
          style={{ position: "absolute", bottom: 0, left: 0 }}
        />
      </motion.nav>
    </ScrollProgressProvider>
  );
};

export default Navbar;
