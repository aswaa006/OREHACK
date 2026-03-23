import { motion } from "framer-motion";

export const PortalBackground = () => {
  return (
    <motion.div
      className="portal-swirl"
      animate={{ rotate: -360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    />
  );
};