import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Problem, Phase } from "@/hooks/useControlState";

// ─── Spinner ─────────────────────────────────────────────────────────────────
const Spinner: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spinRing 0.7s linear infinite", flexShrink: 0 }}>
    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
    <path d="M8 2A6 6 0 0 1 14 8" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export interface ProblemDrawerProps {
  problem: Problem | null;
  isOpen: boolean;
  onClose: () => void;
  phase: Phase | "OVERVIEW";
  isActive?: boolean;
  hasSelected?: boolean;
  isMySelection?: boolean;
  onSelect?: (problemId: string) => Promise<void>;
  onReject?: () => void;
}

const ProblemDrawer: React.FC<ProblemDrawerProps> = ({
  problem,
  isOpen,
  onClose,
  phase,
  isActive = false,
  hasSelected = false,
  isMySelection = false,
  onSelect,
  onReject,
}) => {
  const [selecting, setSelecting] = useState(false);
  const [selError, setSelError] = useState<string | null>(null);
  const [localRejected, setLocalRejected] = useState(false);

  // Reset local state when problem changes
  React.useEffect(() => {
    setSelError(null);
    setSelecting(false);
    setLocalRejected(false);
  }, [problem?.id]);

  if (!problem) return null;

  const isFull = problem.slots_taken >= problem.slots;
  const canSelect = phase === "SELECT" && isActive && !hasSelected && !localRejected && !isFull && !selecting && onSelect;

  const handleSelect = async () => {
    if (!canSelect || !onSelect) return;
    setSelecting(true);
    setSelError(null);
    try {
      await onSelect(problem.id);
      // Close drawer on successful selection (optional)
      setTimeout(onClose, 800);
    } catch {
      setSelError("Failed. Try again.");
    } finally {
      setSelecting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              zIndex: 40,
              cursor: "pointer",
            }}
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              maxWidth: 500,
              background: "rgba(12,9,20,0.95)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-10px 0 40px rgba(0,0,0,0.5)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              padding: "2rem",
              overflowY: "auto",
            }}
          >
            {/* Header: ID and Close */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  color: "rgba(196,181,253,0.9)",
                  background: "rgba(168,85,247,0.15)",
                  padding: "4px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(168,85,247,0.3)",
                }}
              >
                {problem.id}
              </span>
              
              <button
                onClick={onClose}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Title */}
            <h2 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: "1.5rem", letterSpacing: "-0.02em" }}>
              {problem.title}
            </h2>

            {/* Domain & Status Tags */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2rem", flexWrap: "wrap" }}>
              {problem.domain && (
                <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#93c5fd", background: "rgba(59,130,246,0.12)", padding: "4px 12px", borderRadius: 999, fontWeight: 700, border: "1px solid rgba(59,130,246,0.25)" }}>
                  {problem.domain}
                </span>
              )}
              {isFull ? (
                <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#fca5a5", background: "rgba(239,68,68,0.15)", padding: "4px 12px", borderRadius: 999, fontWeight: 700, border: "1px solid rgba(239,68,68,0.3)" }}>
                  FULL
                </span>
              ) : isActive && phase === "SELECT" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#86efac", background: "rgba(34,197,94,0.12)", padding: "4px 12px", borderRadius: 999, fontWeight: 700, border: "1px solid rgba(34,197,94,0.3)" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80" }} /> ACTIVE
                </span>
              ) : null}
            </div>

            {/* Description */}
            <div style={{ flexGrow: 1 }}>
              <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", marginBottom: "0.75rem", fontFamily: "var(--font-mono)" }}>
                Problem Overview
              </h4>
              <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
                {problem.description}
              </p>
            </div>

            {/* Slots Info */}
            <div style={{ marginTop: "3rem", padding: "1.25rem", background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>
                  Capacity
                </span>
                <span style={{ fontSize: "0.9rem", fontFamily: "var(--font-mono)", color: isFull ? "rgba(239,68,68,0.9)" : "rgba(196,181,253,0.9)", fontWeight: 700 }}>
                  {problem.slots_taken} / {problem.slots} Slots Taken
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (problem.slots_taken / problem.slots) * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    background: isFull ? "linear-gradient(90deg, #ef4444, #dc2626)" : "linear-gradient(90deg, #8b5cf6, #c084fc)",
                  }}
                />
              </div>
            </div>

            {/* Action Buttons (Only in SELECT phase) */}
            {phase === "SELECT" && (
              <div style={{ marginTop: "1.5rem" }}>
                {isMySelection && (
                  <div style={{ padding: "1rem", borderRadius: 12, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", color: "#86efac", textAlign: "center", fontWeight: 700, letterSpacing: "0.1em" }}>
                    ✓ YOUR LOCKED SELECTION
                  </div>
                )}

                {isActive && !isMySelection && (
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <motion.button
                      whileHover={canSelect ? { scale: 1.02 } : {}}
                      whileTap={canSelect ? { scale: 0.98 } : {}}
                      onClick={handleSelect}
                      disabled={!canSelect}
                      style={{
                        flex: 1,
                        padding: "1rem 1.5rem",
                        borderRadius: 14,
                        border: "none",
                        fontSize: "0.95rem",
                        fontWeight: 800,
                        letterSpacing: "0.05em",
                        cursor: canSelect ? "pointer" : "not-allowed",
                        background: canSelect ? "linear-gradient(135deg,#7c3aed 0%,#a855f7 55%,#6366f1 100%)" : "rgba(255,255,255,0.06)",
                        color: canSelect ? "#fff" : "rgba(255,255,255,0.28)",
                        boxShadow: canSelect ? "0 4px 24px rgba(124,58,237,0.45)" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        position: "relative",
                        overflow: "hidden",
                        transition: "all 0.3s",
                      }}
                    >
                      {selecting && <Spinner />}
                      {hasSelected ? "Already Locked In" : localRejected ? "Problem Rejected" : isFull ? "No Slots Available" : selecting ? "Locking In…" : "LOCK IN SELECTION"}
                      
                      {canSelect && (
                        <motion.span
                          style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg,transparent 25%,rgba(255,255,255,0.25) 50%,transparent 75%)", pointerEvents: "none" }}
                          animate={{ x: ["-140%", "140%"] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                    </motion.button>
                    
                    {onReject && !hasSelected && !localRejected && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setLocalRejected(true); onReject(); }}
                        style={{
                          padding: "1rem 1.5rem",
                          borderRadius: 14,
                          border: "1px solid rgba(251,113,133,0.3)",
                          fontSize: "0.95rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          background: "rgba(251,113,133,0.1)",
                          color: "rgba(251,113,133,0.9)",
                          transition: "all 0.3s",
                        }}
                      >
                        REJECT
                      </motion.button>
                    )}
                  </div>
                )}
                
                {selError && (
                  <p style={{ marginTop: 12, fontSize: "0.85rem", color: "rgba(251,113,133,0.9)", textAlign: "center", fontWeight: 600 }}>
                    {selError}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProblemDrawer;
