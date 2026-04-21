import React from "react";
import { motion } from "framer-motion";

const QuoteSection = () => {
  return (
    <section className="relative py-32 px-6 md:px-16 lg:px-32 bg-black overflow-hidden flex items-center justify-center min-h-[60vh]">
      {/* Decorative gradient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] opacity-20 blur-[120px]"
          style={{
            background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
           viewport={{ once: true, margin: "-100px" }}
        >
          {/* Quote Mark */}
          <span 
            className="block text-6xl md:text-8xl text-[#7c3aed] opacity-50 mb-8 select-none"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            &ldquo;
          </span>

          <h2 
            className="text-3xl md:text-5xl lg:text-6xl font-light italic leading-tight text-zinc-100"
            style={{ 
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              letterSpacing: "-0.02em"
            }}
          >
            Innovation is not just about building something new; <br className="hidden md:block" />
            it’s about <span className="text-[#7c3aed] font-medium">redefining what’s possible</span>.
          </h2>

          <motion.div 
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            viewport={{ once: true }}
            className="h-px w-24 bg-gradient-to-r from-transparent via-[#7c3aed] to-transparent mx-auto mt-12 mb-8"
          />

          <p 
            className="text-sm md:text-base uppercase tracking-[0.3em] text-[#7c3aed] font-medium"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            The OreHack Philosophy
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default QuoteSection;
