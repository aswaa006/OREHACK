import { motion, AnimatePresence } from "framer-motion";
import styles from "./Navbar.module.css";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavClick: (id: string) => void;
}

const menuItems = [
  { id: "hackathons", label: "Live Hackathons" },
  { id: "how-it-works", label: "How It Works" },
  { id: "about", label: "About Oregent" },
];

export const MobileMenu = ({ isOpen, onClose, onNavClick }: MobileMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Navigation Menu */}
          <motion.nav
            id="main-menu"
            className={`${styles.mainNavigation} ${isOpen ? styles.isOpen : ""} md:hidden`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ul className={styles.navigationList}>
              {menuItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                >
                  <button
                    onClick={() => {
                      onNavClick(item.id);
                      onClose();
                    }}
                    className={styles.navigationLink}
                  >
                    {item.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};
