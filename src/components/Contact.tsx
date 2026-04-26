import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useTheme } from "@/context/ThemeContext";

// ✅ Fill in your EmailJS credentials below
const EMAILJS_SERVICE_ID = "service_2ao7hsi";   // e.g. "service_abc123"
const EMAILJS_TEMPLATE_ID = "template_l985p37"; // e.g. "template_xyz456"
const EMAILJS_PUBLIC_KEY = "ccunBjaPy6mtyvnqO";   // e.g. "user_XXXXXXXXXX"


const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -15 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 15 },
  },
};

const FloatingOrb = ({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) => (
  <motion.div
    className={`absolute rounded-full ${color} blur-[120px] pointer-events-none`}
    style={{ width: size, height: size, left: x, top: y }}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.15, 0.3, 0.15],
      x: [0, 30, -20, 0],
      y: [0, -20, 15, 0],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  />
);

const GridLine = ({ vertical = false, color = "bg-primary/5", isHidden = false }) => {
  if (isHidden) return null;
  return (
    <div
      className={`absolute ${vertical ? "w-px h-full" : "h-px w-full"} ${color}`}
      style={{
        left: vertical ? `${Math.random() * 100}%` : 0,
        top: vertical ? 0 : `${Math.random() * 100}%`,
      }}
    />
  );
};

const Contact = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formState, setFormState] = useState({ name: "", email: "", message: "", category: "I need something else" });
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>("");
  const { isDayMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: formState.name,
          email: formState.email,
          category: formState.category,
          message: formState.message,
          title: `New ${formState.category} from ${formState.name}`,
        },
        EMAILJS_PUBLIC_KEY
      );
      setSubmitted(true);
      setFormState({ name: "", email: "", message: "", category: "I need something else" });
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      console.error("EmailJS error:", err);
      setError("Failed to send message. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (val: string) => {
    if (!val) { setEmailError(""); return; }
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setEmailError(ok ? "" : "Please enter a valid email address.");
  };

  // Theme-aware colors
  const headingColor = isDayMode ? "#000000" : "#ffffff";
  const subtitleColor = isDayMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)";
  const cardBg = isDayMode ? "#ffffff" : "rgba(255, 255, 255, 0.03)";
  const cardBorder = isDayMode ? "1px solid rgba(0, 0, 0, 0.1)" : "1px solid rgba(255, 255, 255, 0.1)";
  const formHeadingColor = isDayMode ? "#000000" : "hsl(220 14% 96%)";
  const formSubtextColor = isDayMode ? "#666666" : "hsl(218 11% 65%)";
  const inputBg = isDayMode ? "rgba(245,245,245,0.8)" : "rgba(0,0,0,0.5)";
  const inputBorder = isDayMode ? "#e0e0e0" : "hsl(0 0% 10%)";
  const inputText = isDayMode ? "#000000" : "hsl(220 14% 96%)";
  const inputPlaceholder = isDayMode ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.3)";
  const labelColor = isDayMode ? "#333333" : "hsl(220 14% 96%)";
  const footerBorderColor = isDayMode ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.05)";
  const footerTextColor = isDayMode ? "#333333" : "hsl(220 14% 96%)";
  const footerMutedColor = isDayMode ? "#888888" : "hsl(218 11% 65%)";
  const footerLinkHover = isDayMode ? "#7c3aed" : "#c4b5fd";
  const socialCardBg = isDayMode ? "#ffffff" : "rgba(255, 255, 255, 0.03)";
  const socialCardBorder = isDayMode ? "1px solid rgba(0, 0, 0, 0.1)" : "1px solid rgba(255, 255, 255, 0.1)";
  const infoValueColor = isDayMode ? "#000000" : "hsl(220 14% 96%)";
  const infoLabelColor = isDayMode ? "#888888" : "hsl(218 11% 65%)";
  const ctaBannerBg = isDayMode ? "linear-gradient(135deg, rgba(124,58,237,0.05), rgba(245,245,245,0.9), rgba(236,72,153,0.03))" : undefined;
  const ctaTitleColor = isDayMode ? "#000000" : "hsl(220 14% 96%)";
  const iconColor = isDayMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.3)";
  const borderColor = isDayMode ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)";
  const ctaDescColor = isDayMode ? "#666666" : "hsl(218 11% 65%)";
  const connectTitleColor = isDayMode ? "#000000" : "hsl(220 14% 96%)";

  return (
    <section
      id="contact"
      ref={ref}
      className="relative pt-20 pb-0 overflow-hidden"
      style={{ transition: "background 0.5s ease" }}
    >
      {/* Animated background */}
      <FloatingOrb delay={0} size={400} x="10%" y="20%" color="bg-primary/20" />
      <FloatingOrb delay={2} size={300} x="70%" y="60%" color="bg-pink-500/15" />
      <FloatingOrb delay={4} size={250} x="50%" y="10%" color="bg-blue-500/10" />
      <FloatingOrb delay={3} size={200} x="80%" y="15%" color="bg-indigo-500/10" />
      {/* Grid lines decoration */}
      {/* Perspective container for 3D feel */}
      <div className="relative z-10 container mx-auto px-6 max-w-7xl" style={{ perspective: "1200px" }}>

        {/* TOP SECTION: Illustration + Main Header */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16 pt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center md:justify-start"
          >
            {/* Doodle-style Illustration */}
            <div className="relative w-full max-w-[450px]">
              <svg viewBox="0 0 500 400" className="w-full h-auto drop-shadow-2xl">
                <defs>
                  <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#db2777', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                {/* Laptop Body */}
                <rect x="100" y="200" width="300" height="180" rx="20" fill={isDayMode ? "#f3f4f6" : "#1f2937"} stroke="url(#purpleGrad)" strokeWidth="3" />
                <rect x="115" y="215" width="270" height="150" rx="10" fill={isDayMode ? "#fff" : "#0f172a"} />
                {/* Base */}
                <path d="M80 380 L420 380 L440 400 L60 400 Z" fill={isDayMode ? "#e5e7eb" : "#374151"} stroke="url(#purpleGrad)" strokeWidth="2" />

                {/* Flying Elements */}
                <motion.g animate={{ y: [0, -15, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                  <path d="M380 100 L440 120 L380 140 Z" fill="#7c3aed" opacity="0.8" /> {/* Paper Plane */}
                  <rect x="350" y="50" width="50" height="40" rx="5" fill="#db2777" opacity="0.6" /> {/* Email Icon */}
                  <path d="M350 50 L375 70 L400 50" fill="none" stroke="white" strokeWidth="2" />
                </motion.g>

                <motion.circle cx="80" cy="120" r="30" fill="url(#purpleGrad)" opacity="0.2" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 3, repeat: Infinity }} />
                <motion.path d="M50 150 L100 150" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" opacity="0.4" animate={{ x: [-10, 10, -10] }} transition={{ duration: 2.5, repeat: Infinity }} />

                {/* At Symbol in Screen */}
                <text x="250" y="300" textAnchor="middle" fontSize="60" fill="url(#purpleGrad)" style={{ fontFamily: "serif", fontWeight: "bold" }}>@</text>

                {/* Orbit Path */}
                <ellipse cx="250" cy="200" rx="220" ry="180" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="10 10" opacity="0.3" />
              </svg>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-left"
          >
            <h2
              className="text-5xl md:text-7xl font-black mb-6 leading-tight"
              style={{ color: headingColor, fontFamily: "ui-serif, Georgia, serif" }}
            >
              Have questions?<br />
              <span className="text-primary italic">Shoot us an email.</span>
            </h2>
            <p
              className="text-lg md:text-xl max-w-lg mb-8 leading-relaxed"
              style={{ color: subtitleColor }}
            >
              We are an industry-leading hackathon organization providing the best experience for builders. Have a question for us or feedback? Please click on the most appropriate category and fill out the form to reach us.
            </p>
          </motion.div>
        </div>

        {/* MAIN SECTION: List + Form */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* LEFT: How can we help? */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h3 className="text-2xl font-bold mb-8" style={{ color: headingColor }}>How can we help?</h3>
            <div className="space-y-3">
              {[
                "I want to sponsor OREHACK",
                "I'm a mentor or want to contribute",
                "I'm a current or former participant",
                "I want to volunteer for OREHACK",
                "I have a partnership proposal",
                "I want to report a bug in the portal",
                "Technical issue with registration",
                "I need something else"
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ x: 8 }}
                  onClick={() => setFormState({ ...formState, category: item })}
                  className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all duration-300 border border-transparent hover:border-primary/20"
                  style={{
                    background: formState.category === item ? "rgba(124, 58, 237, 0.1)" : "transparent"
                  }}
                >
                  <span className="text-base font-bold flex-1 uppercase tracking-wider" style={{ color: formState.category === item ? "#7c3aed" : subtitleColor }}>{item}</span>
                  <div className="flex items-center justify-center transition-all duration-300" style={{ color: formState.category === item ? "#7c3aed" : iconColor }}>
                    <motion.div
                      animate={{ rotate: formState.category === item ? 45 : 0 }}
                      className="transition-transform duration-500"
                    >
                      <Plus size={20} strokeWidth={2.5} />
                    </motion.div>
                  </div>
                  {formState.category === item && (
                    <motion.div
                      layoutId="categoryFly"
                      className="absolute inset-0 bg-primary/5 rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.div>
              ))}
            </div>

          </motion.div>

          {/* RIGHT: The Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div
              className="relative rounded-3xl p-8 md:p-12 shadow-2xl"
              style={{
                background: cardBg,
                backdropFilter: "blur(20px)",
                border: cardBorder
              }}
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-8 ring-4 ring-primary/10">
                      <svg className="w-12 h-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-3xl font-black mb-4 uppercase italic" style={{ color: headingColor }}>Success!</h3>
                    <p className="text-lg" style={{ color: subtitleColor }}>Thanks, <span className="text-primary font-bold">{formState.name}</span>. We've received your request.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                  >
                    {/* Selected Category Display */}
                    <div className="relative">
                      <label className="block text-sm font-bold uppercase tracking-wider mb-2 opacity-60" style={{ color: headingColor }}>Selected Category</label>
                      <motion.div 
                        layoutId="categoryFly" 
                        className="absolute inset-x-0 bottom-0 top-7 bg-primary/5 rounded-xl pointer-events-none -z-10" 
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                      <div
                        className="w-full px-5 py-4 rounded-xl transition-all duration-300 font-bold flex items-center uppercase tracking-wider"
                        style={{
                          background: inputBg,
                          border: `1px solid ${inputBorder}`,
                          color: "#7c3aed",
                          minHeight: "58px"
                        }}
                      >
                        {formState.category}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wider mb-2 opacity-60" style={{ color: headingColor }}>Your Name *</label>
                        <input
                          type="text"
                          required
                          value={formState.name}
                          onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                          className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                          style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputText }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold uppercase tracking-wider mb-2 opacity-60" style={{ color: headingColor }}>Your Email *</label>
                        <input
                          type="email"
                          required
                          value={formState.email}
                          onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                          className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300"
                          style={{ background: inputBg, border: `1px solid ${emailError ? "#ef4444" : inputBorder}`, color: inputText }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold uppercase tracking-wider mb-2 opacity-60" style={{ color: headingColor }}>Your Message *</label>
                      <textarea
                        required
                        rows={5}
                        value={formState.message}
                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                        className="w-full px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-300 resize-none"
                        style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: inputText }}
                      />
                    </div>


                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-white overflow-hidden relative group shadow-xl active:scale-[0.98] transition-all duration-300"
                      disabled={loading}
                      style={{
                        background: isDayMode ? "#000000" : "#7c3aed",
                        border: "none",
                      }}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? "Sending..." : "Shoot Us An Email"}
                        {!loading && (
                          <svg
                            className="w-4 h-4 transition-transform duration-300 -rotate-45 group-hover:rotate-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        )}
                      </span>
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Footer (embedded to avoid spacing gap) ─────────────────── */}
      <div
        className="relative z-10 mt-20 pt-16 pb-0 overflow-hidden"
        style={{
          borderTop: `1px solid ${footerBorderColor}`,
          color: footerTextColor,
          transition: "border-color 0.4s ease, color 0.4s ease",
        }}
      >
        <div className="container mx-auto px-6">
          {/* Top section: Navigation + Social */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
            {/* Navigation */}
            <div>
              <h4
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-6"
                style={{ color: footerMutedColor }}
              >
                Navigation
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Hackathons", id: "hackathons" },
                  { label: "How It Works", id: "how-it-works" },
                  { label: "About", id: "about" },
                  { label: "Contact", id: "contact" },
                ].map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => {
                        const el = document.getElementById(link.id);
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                      style={{
                        transition: "all 0.3s ease",
                        color: isDayMode ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)",
                      }}
                      className="text-base"
                      onMouseEnter={(e) => (e.currentTarget.style.color = footerLinkHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = isDayMode ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)")}
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-6"
                style={{ color: footerMutedColor }}
              >
                Social
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "LinkedIn", href: "https://www.linkedin.com/company/oregent" },
                  { label: "Instagram", href: "https://www.instagram.com/oregent" },
                  { label: "YouTube", href: "https://youtube.com/@oregent" },
                  { label: "WhatsApp", href: "https://wa.me/oregent" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        transition: "all 0.3s ease",
                        color: isDayMode ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)",
                      }}
                      className="text-base"
                      onMouseEnter={(e) => (e.currentTarget.style.color = footerLinkHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = isDayMode ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)")}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Branding column */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-xl font-bold tracking-tight" style={{ color: footerTextColor }}>
                  Ore<span className="text-gradient-primary">hack</span>
                </span>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: footerMutedColor }}>
                  A Controlled Technical Evaluation System — engineered by Oregent.
                </p>
              </div>
            </div>
          </div>

          {/* Divider + copyright bar */}
          <div
            className="py-6 flex flex-col md:flex-row items-center justify-between gap-4"
            style={{ borderTop: `1px solid ${footerBorderColor}` }}
          >
            <p className="text-sm" style={{ color: footerMutedColor }}>
              © {new Date().getFullYear()} Oregent. All rights reserved.
            </p>
            <a
              href="mailto:srisayee.oregent@gmail.com"
              className="text-sm text-primary hover:text-primary/80 transition-colors duration-300"
            >
              contact@oregent.com
            </a>
          </div>
        </div>

        {/* Giant brand text */}
        <div className="relative mt-12 flex items-end justify-center overflow-hidden select-none pointer-events-none pb-0 mb-0 w-full">
          <h2
            className="font-black tracking-tighter text-center"
            style={{
              fontSize: "21.5vw",
              lineHeight: 0.8,
              background: "linear-gradient(180deg, hsl(263 84% 58%) 0%, hsl(263 84% 38%) 50%, transparent 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              margin: 0,
              padding: 0,
              whiteSpace: "nowrap",
              transform: "translate(-0.5vw, 15%)",
              width: "100%",
              display: "block",
            }}
          >
            OREHACK
          </h2>
        </div>
      </div>
    </section>
  );
};

export default Contact;
