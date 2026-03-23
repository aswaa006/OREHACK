import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const ActionButtons = () => {
  return (
    <div className="flex items-center gap-3 md:gap-4">
      {/* Get in Touch Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <a
          href="https://app.fourmula.ai/start"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 md:px-6 py-2 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <div className="relative inline-block overflow-hidden mask-image mask-position-center mask-no-repeat mask-size-cover">
            <motion.span
              initial={{ opacity: 1 }}
              whileHover={{ y: 0 }}
              className="inline-block"
            >
              Get in touch
            </motion.span>
          </div>
        </a>
      </motion.div>
    </div>
  );
};
