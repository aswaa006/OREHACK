import { motion } from "framer-motion";

interface MenuCardProps {
  icon: string;
  title: string;
  description: string;
  onClick?: () => void;
  delay?: number;
}

export const MenuCard = ({ icon, title, description, onClick, delay = 0 }: MenuCardProps) => {
  return (
    <motion.div
      className="menu-card"
      tabIndex={0}
      role="button"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="menu-card-icon">{icon}</div>
      <h3 className="menu-card-title">{title}</h3>
      <p className="menu-card-description">{description}</p>
    </motion.div>
  );
};