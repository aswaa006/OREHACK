import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export const LogoSection = () => {
  return (
    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
      <motion.div
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-12 h-12 flex items-center"
      >
        <img
          src="/white oregent logo.png"
          alt="Oregent AI Logo"
          className="w-full h-full object-contain"
        />
      </motion.div>
      <div className="hidden sm:flex flex-col leading-tight">
        <span className="text-sm font-semibold text-foreground">Innovation Hub</span>
        <span className="text-xs text-muted-foreground">by Oregent AI</span>
      </div>
    </Link>
  );
};
