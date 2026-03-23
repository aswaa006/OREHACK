import { motion } from "framer-motion";

export const PortalRing = () => {
  return (
    <motion.div
      className="portal-ring"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ boxShadow: "0 0 40px rgba(0, 229, 255, 0.6)" }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          padding: "2px",
          background: "conic-gradient(from 0deg, #00E5FF, #7B61FF, #00E5FF)",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "subtract",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "subtract",
        }}
      />
    </motion.div>
  );
};