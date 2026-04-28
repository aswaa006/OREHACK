import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What does OreHack specialize in?",
    answer: "OreHack specializes in bridging the gap between learning and execution. We build high-performance digital products, orchestrate high-impact hackathons, and provide automated evaluation infrastructure for institutions and enterprises.",
  },
  {
    question: "What is your development process like?",
    answer: "We follow a lean, end-to-end process: Design → Development → Testing → Deployment. We focus on clean code, scalable architecture, and agentic AI integration to ensure your product is ship-ready from day one.",
  },
  {
    question: "How long does a project take?",
    answer: "Timelines vary by complexity. A standard MVP typically takes 4–6 weeks, while more complex enterprise platforms or multi-stage hackathon integrations may require 8–12 weeks.",
  },
  {
    question: "Do you offer ongoing support after launch?",
    answer: "Yes. Beyond deployment, we offer maintenance packages, performance monitoring, and iterative feature development to ensure your platform scales seamlessly as your user base grows.",
  },
  {
    question: "What types of businesses do you work with?",
    answer: "We work with educational institutions, tech startups, and enterprises looking to foster innovation cultures. Whether you need a dedicated development team or a platform to run institutional hackathons, we have you covered.",
  },
  {
    question: "How do I get started?",
    answer: "The process is simple: book a discovery call via our Contact section. We'll discuss your goals, define the scope, and move directly into the ideation and strategy phase.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { isDayMode } = useTheme();

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const sectionBg = isDayMode ? "#ffffff" : "#000000";
  const headingColor = isDayMode ? "#000000" : "#ffffff";
  const questionColor = isDayMode ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.9)";
  const questionHoverColor = isDayMode ? "#000000" : "#ffffff";
  const answerColor = isDayMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)";
  const subtitleColor = isDayMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)";
  const borderColor = isDayMode ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)";
  const iconColor = isDayMode ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.3)";

  return (
    <section
      className="relative z-10 py-20 px-6 md:px-16 lg:px-32"
      style={{
        background: sectionBg,
        transition: "background 0.5s ease",
      }}
    >
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mb-20 text-center"
      >
        <p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-4 orehack-liquid-text"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          (TRUST THE BUILD)
        </p>
        <h2
          className="text-3xl md:text-5xl font-black m-0 uppercase flex flex-row items-baseline justify-center gap-4 md:gap-6 italic whitespace-nowrap"
          style={{
            fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
            letterSpacing: "-0.04em",
            textShadow: "0 0 60px rgba(124, 58, 237, 0.3)",
            color: headingColor,
            transition: "color 0.4s ease",
          }}
        >
          <span>YOUR</span>
          <span>QUESTIONS,</span>
          <span
            style={{
              fontFamily: '"Playfair Display", serif',
              color: "#7c3aed",
              letterSpacing: "0.02em",
              textShadow: "0 0 40px rgba(124, 58, 237, 0.8), 0 0 80px rgba(124, 58, 237, 0.4)",
            }}
          >
            ANSWERED
          </span>
        </h2>

        <div style={{ position: "relative", marginTop: "2.5rem", height: "2px" }}>
          <div style={{
            width: "100%",
            height: "1px",
            background: `linear-gradient(to right, transparent, rgba(124,58,237,0.6), ${isDayMode ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.3)"}, rgba(124,58,237,0.6), transparent)`,
          }} />
          <div style={{
            position: "absolute",
            top: "-12px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "60%",
            height: "24px",
            background: `radial-gradient(ellipse at center, rgba(124,58,237, ${isDayMode ? "0.2" : "0.35"}) 0%, transparent 70%)`,
            filter: isDayMode ? "blur(4px)" : "blur(6px)",
            pointerEvents: "none",
          }} />
        </div>

        <p 
          className="text-base max-w-xl mx-auto italic mt-8"
          style={{
            fontFamily: 'ui-serif, Georgia, serif',
            color: subtitleColor,
            transition: "color 0.4s ease",
          }}
        >
          Helping you understand our process and offerings at OreHack.
        </p>
      </motion.div>

      <div className="max-w-3xl mx-auto">
        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              style={{ borderBottom: `1px solid ${borderColor}`, transition: "border-color 0.4s ease" }}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full py-6 flex items-center justify-between text-left group transition-all duration-300"
              >
                <span 
                  className="text-lg md:text-xl font-medium transition-colors duration-300"
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    color: openIndex === index ? "#7c3aed" : questionColor,
                  }}
                  onMouseEnter={(e) => {
                    if (openIndex !== index) (e.currentTarget.style.color = questionHoverColor);
                  }}
                  onMouseLeave={(e) => {
                    if (openIndex !== index) (e.currentTarget.style.color = questionColor);
                  }}
                >
                  {faq.question}
                </span>
                <div
                  className="transition-transform duration-500 scale-125"
                  style={{
                    color: openIndex === index ? "#7c3aed" : iconColor,
                    transform: openIndex === index ? "rotate(180deg)" : "none",
                  }}
                >
                  {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p 
                      className="pb-6 text-base leading-relaxed italic max-w-2xl"
                      style={{
                        fontFamily: 'ui-serif, Georgia, serif',
                        color: answerColor,
                        transition: "color 0.4s ease",
                      }}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
