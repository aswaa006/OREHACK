import React from "react";
import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const variants = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -40 },
};

const PageTransition: React.FC<PageTransitionProps> = ({ children, className }) => (
  <motion.div
    variants={variants}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    className={className}
    style={{ minHeight: "100vh", width: "100%" }}
  >
    {children}
  </motion.div>
);

export default PageTransition;
