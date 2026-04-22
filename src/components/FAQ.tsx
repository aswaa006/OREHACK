import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative z-10 py-20 px-6 md:px-16 lg:px-32 bg-black">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-4 orehack-liquid-text"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            (FAQs)
          </p>
          <h2
            className="text-3xl md:text-5xl font-black text-white mb-4 uppercase italic"
            style={{
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              letterSpacing: "-0.04em",
              textShadow: "0 0 60px rgba(124, 58, 237, 0.3)",
            }}
          >
            Your Questions, <span className="text-[#7c3aed]">Answered</span>
          </h2>
          <p 
            className="text-white/60 text-base max-w-xl italic"
            style={{ fontFamily: 'ui-serif, Georgia, serif' }}
          >
            Helping you understand our process and offerings at OreHack.
          </p>
        </motion.div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="border-b border-white/10"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full py-6 flex items-center justify-between text-left group transition-all duration-300"
              >
                <span 
                  className={`text-lg md:text-xl font-medium transition-colors duration-300 ${
                    openIndex === index ? "text-[#7c3aed]" : "text-white/90 hover:text-white"
                  }`}
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {faq.question}
                </span>
                <div className={`transition-transform duration-500 scale-125 ${openIndex === index ? "rotate-180 text-[#7c3aed]" : "text-white/30"}`}>
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
                      className="pb-6 text-white/50 text-base leading-relaxed italic max-w-2xl"
                      style={{ fontFamily: 'ui-serif, Georgia, serif' }}
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
