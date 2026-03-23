import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PortalRing } from "./PortalRing";
import { PortalBackground } from "./PortalBackground";

interface PortalMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (id: string) => void;
}

// panel definitions for radial layout (icon + title only)
const menuItems = [
  { id: "hackathons", icon: "⚡", title: "ACTIVE HACKATHONS", position: "top" },
  { id: "how-it-works", icon: "⚙️", title: "HOW IT WORKS", position: "left" },
  { id: "about", icon: "🌌", title: "WHO ARE WE", position: "right" },
];

export const PortalMenu = ({ isOpen, onClose, onNavigate }: PortalMenuProps) => {
  const menuRef = React.useRef<HTMLDivElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = React.useState(-1);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const panels = menuRef.current?.querySelectorAll('.portal-panel');
      if (panels) {
        const nextIndex = focusedIndex + 1 >= panels.length ? 0 : focusedIndex + 1;
        setFocusedIndex(nextIndex);
        (panels[nextIndex] as HTMLElement)?.focus();
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the overlay, not on the portal content
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      // Focus first card after animation
      setTimeout(() => {
        const firstPanel = menuRef.current?.querySelector('.portal-panel') as HTMLElement;
        if (firstPanel) {
          firstPanel.focus();
          setFocusedIndex(0);
        }
      }, 500);
    } else {
      document.body.style.overflow = "unset";
      setFocusedIndex(-1);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            className="portal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
          />

          {/* Portal Container */}
          <motion.div
            className="portal-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <PortalRing />
            <PortalBackground />

            {/* Radial panels inside portal */}
            <div ref={menuRef} className="portal-panels-container">
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={`portal-panel panel-${item.position}`}
                  tabIndex={0}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onNavigate(item.id);
                      onClose();
                    }
                  }}
                >
                  <div className="panel-icon">{item.icon}</div>
                  <div className="panel-title">{item.title}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};