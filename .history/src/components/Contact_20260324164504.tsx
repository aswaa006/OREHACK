import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const socialLinks = [
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/oregent",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/50",
    glow: "group-hover:shadow-blue-500/20",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/oregent",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
      </svg>
    ),
    color: "from-pink-500 via-purple-500 to-orange-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/20",
    hoverBorder: "hover:border-pink-500/50",
    glow: "group-hover:shadow-pink-500/20",
  },
  {
    name: "X (Twitter)",
    href: "https://x.com/oregent",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "from-gray-300 to-white",
    bg: "bg-white/10",
    border: "border-white/20",
    hoverBorder: "hover:border-white/50",
    glow: "group-hover:shadow-white/10",
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/oregent",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    color: "from-green-400 to-green-600",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    hoverBorder: "hover:border-green-500/50",
    glow: "group-hover:shadow-green-500/20",
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@oregent",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    color: "from-red-500 to-red-700",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    hoverBorder: "hover:border-red-500/50",
    glow: "group-hover:shadow-red-500/20",
  },
  {
    name: "Email",
    href: "mailto:contact@oregent.com",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    color: "from-emerald-400 to-teal-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/50",
    glow: "group-hover:shadow-emerald-500/20",
  },
];

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

const GridLine = ({ direction, position, delay }: { direction: "h" | "v"; position: string; delay: number }) => (
  <motion.div
    className={`absolute ${direction === "h" ? "h-px w-full left-0" : "w-px h-full top-0"} bg-gradient-to-r from-transparent via-primary/20 to-transparent`}
    style={direction === "h" ? { top: position } : { left: position }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 0.5, 0], scale: 1 }}
    transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const Contact = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormState({ name: "", email: "", message: "" });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-32 overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 grid-bg opacity-20" />
      <FloatingOrb delay={0} size={400} x="10%" y="20%" color="bg-primary/20" />
      <FloatingOrb delay={2} size={300} x="70%" y="60%" color="bg-pink-500/15" />
      <FloatingOrb delay={4} size={250} x="50%" y="10%" color="bg-blue-500/10" />
      <FloatingOrb delay={3} size={200} x="80%" y="15%" color="bg-indigo-500/10" />

      {/* Animated grid lines */}
      <GridLine direction="h" position="15%" delay={0} />
      <GridLine direction="h" position="85%" delay={2} />
      <GridLine direction="v" position="10%" delay={1} />
      <GridLine direction="v" position="90%" delay={3} />

      {/* Perspective container for 3D feel */}
      <div className="relative z-10 container mx-auto px-6" style={{ perspective: "1200px" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 150 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Let's Connect
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl md:text-6xl font-bold text-foreground mb-4"
          >
            Get in{" "}
            <span className="relative">
              <span className="text-gradient-primary">Touch</span>
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-pink-500 to-orange-400 rounded-full"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.8 }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Have a question, idea, or want to collaborate? Reach out — we'd love to hear from you.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
          {/* Contact Form - 3D Card */}
          <motion.div
            initial={{ opacity: 0, x: -60, rotateY: 15 }}
            animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative group"
          >
            {/* Glow behind the card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-pink-500/10 to-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="relative surface-elevated rounded-2xl p-8 md:p-10 border border-border/50 hover:border-primary/30 transition-all duration-500">
              <h3 className="text-2xl font-bold text-foreground mb-2">Send a Message</h3>
              <p className="text-muted-foreground text-sm mb-8">We'll get back to you within 24 hours.</p>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 ring-2 ring-primary/30"
                    >
                      <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <motion.path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        />
                      </svg>
                    </motion.div>
                    <h4 className="text-xl font-bold text-foreground mb-2">Message Sent!</h4>
                    <p className="text-muted-foreground text-sm">We'll be in touch soon.</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[
                      { id: "name", label: "Name", type: "text", placeholder: "Your name" },
                      { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
                    ].map((field, i) => (
                      <motion.div
                        key={field.id}
                        initial={{ opacity: 0, x: -30 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                        className="relative"
                      >
                        <label htmlFor={field.id} className="block text-sm font-medium text-foreground mb-2">
                          {field.label}
                        </label>
                        <div className="relative">
                          <input
                            id={field.id}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={formState[field.id as keyof typeof formState]}
                            onChange={(e) => setFormState({ ...formState, [field.id]: e.target.value })}
                            onFocus={() => setFocused(field.id)}
                            onBlur={() => setFocused(null)}
                            required
                            className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all duration-300"
                          />
                          <motion.div
                            className="absolute inset-0 rounded-xl border-2 border-primary/50 pointer-events-none"
                            initial={{ opacity: 0, scale: 1.02 }}
                            animate={focused === field.id ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          />
                        </div>
                      </motion.div>
                    ))}

                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                        Message
                      </label>
                      <div className="relative">
                        <textarea
                          id="message"
                          rows={5}
                          placeholder="Tell us about your project..."
                          value={formState.message}
                          onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                          onFocus={() => setFocused("message")}
                          onBlur={() => setFocused(null)}
                          required
                          className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-all duration-300 resize-none"
                        />
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-primary/50 pointer-events-none"
                          initial={{ opacity: 0, scale: 1.02 }}
                          animate={focused === "message" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </motion.div>

                    <motion.button
                      type="submit"
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: 0.8 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative w-full py-4 rounded-xl font-semibold text-primary-foreground overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-600 to-pink-600 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]" />
                      </div>
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        Send Message
                        <motion.svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          whileHover={{ x: 5, rotate: -45 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </motion.svg>
                      </span>
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right Side: Social + Info */}
          <motion.div
            initial={{ opacity: 0, x: 60, rotateY: -15 }}
            animate={isInView ? { opacity: 1, x: 0, rotateY: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-8"
          >
            {/* Info cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  ),
                  label: "Location",
                  value: "India",
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                  label: "Response Time",
                  value: "Within 24h",
                },
              ].map((info, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="surface-elevated rounded-xl p-5 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                      {info.icon}
                    </div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{info.label}</span>
                  </div>
                  <p className="text-foreground font-semibold pl-12">{info.value}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Social links */}
            <div>
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-lg font-semibold text-foreground mb-4"
              >
                Connect with us
              </motion.h3>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={itemVariants}
                    whileHover={{
                      y: -6,
                      scale: 1.05,
                      rotateX: -5,
                      rotateY: 5,
                    }}
                    whileTap={{ scale: 0.95 }}
                    className={`group relative flex flex-col items-center gap-3 p-5 rounded-xl border ${social.border} ${social.bg} ${social.hoverBorder} transition-all duration-300 shadow-lg shadow-transparent ${social.glow}`}
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    {/* Animated shine */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
                        whileHover={{ translateX: "100%" }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>

                    <div className={`relative z-10 w-10 h-10 rounded-lg bg-gradient-to-br ${social.color} p-[1px]`}>
                      <div className="w-full h-full rounded-xl bg-card flex items-center justify-center text-foreground group-hover:bg-transparent group-hover:text-white transition-all duration-300">
                        {social.icon}
                      </div>
                    </div>

                    <span className="relative z-10 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {social.name}
                    </span>
                  </motion.a>
                ))}
              </motion.div>
            </div>

            {/* CTA Banner */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.9 }}
              whileHover={{ scale: 1.01 }}
              className="relative overflow-hidden rounded-2xl p-6 md:p-8 border border-primary/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-card to-pink-500/5" />
              <motion.div
                className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[60px]"
                animate={{ scale: [1, 1.3, 1], rotate: [0, 90, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
              />
              <div className="relative z-10">
                <h4 className="text-xl font-bold text-foreground mb-2">
                  Ready to build something{" "}
                  <span className="text-gradient-primary">extraordinary</span>?
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Join hackers worldwide competing on Orehack — powered by Oregent's intelligent evaluation system.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
