import React, { memo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Phase, Problem } from "@/hooks/useControlState";

// ─── Spinner ─────────────────────────────────────────────────────────────────
const Spinner: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    style={{ animation: "spinRing 0.7s linear infinite", flexShrink: 0 }}
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />
    <path d="M8 2A6 6 0 0 1 14 8" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Slot Bar ─────────────────────────────────────────────────────────────────
const SlotBar: React.FC<{ slots: number; slotsTaken: number }> = memo(({ slots, slotsTaken }) => {
  const pct = slots > 0 ? Math.min(1, slotsTaken / slots) : 0;
  const isFull = slotsTaken >= slots;
  return (
    <div style={{ marginTop: "0.85rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: "0.62rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-mono)",
          }}
        >
          Slots
        </span>
        <span
          style={{
            fontSize: "0.72rem",
            fontFamily: "var(--font-mono)",
            color: isFull ? "rgba(251,113,133,0.85)" : "rgba(196,181,253,0.7)",
            fontWeight: 600,
          }}
        >
          {slotsTaken}/{slots}
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            height: "100%",
            borderRadius: 2,
            transformOrigin: "left",
            background: isFull
              ? "linear-gradient(90deg,#fb7185,#f43f5e)"
              : "linear-gradient(90deg,#7c3aed,#a855f7,#6366f1)",
          }}
        />
      </div>
    </div>
  );
});
SlotBar.displayName = "SlotBar";

// ─── Props ────────────────────────────────────────────────────────────────────
export interface ProblemCardProps {
  problem: Problem;
  phase: Phase;
  isActive: boolean;      // this is the currentProblemId match
  hasSelected: boolean;   // current team already locked in globally
  isMySelection: boolean; // team locked firmly into this specific card
  onSelect: (problemId: string) => Promise<void>;
  index: number;          // for staggered entrance
  onReject?: () => void;
}

// ─── ProblemCard ──────────────────────────────────────────────────────────────
export const ProblemCard: React.FC<ProblemCardProps> = memo(
  ({ problem, phase, isActive, hasSelected, isMySelection, onSelect, index, onReject }) => {
    const [selecting, setSelecting] = useState(false);
    const [selError, setSelError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [localRejected, setLocalRejected] = useState(false);

    const isFull = problem.slots_taken >= problem.slots;
    const canSelect =
      phase === "SELECT" &&
      isActive &&
      !hasSelected &&
      !localRejected &&
      !isFull &&
      !selecting;

    const dimmed = phase === "SELECT" && !isActive;

    const handleSelect = useCallback(async () => {
      if (!canSelect) return;
      setSelecting(true);
      setSelError(null);
      try {
        await onSelect(problem.id);
      } catch {
        setSelError("Failed. Try again.");
      } finally {
        setSelecting(false);
      }
    }, [canSelect, onSelect, problem.id]);

    // Active problem gets a pulsing glow ring + scale animation
    const activeAnimation =
      isActive && phase === "SELECT"
        ? { scale: [1, 1.03, 1] }
        : {};

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 28 }}
        animate={{
          opacity: dimmed ? 0.38 : 1,
          y: 0,
          scale: dimmed ? 0.96 : 1,
          ...activeAnimation,
        }}
        transition={
          isActive && phase === "SELECT"
            ? { scale: { repeat: Infinity, duration: 1.8, ease: "easeInOut" }, opacity: { duration: 0.4 }, y: { duration: 0.45, delay: index * 0.07 } }
            : { duration: 0.45, delay: index * 0.07 }
        }
        style={{
          position: "relative",
          borderRadius: 18,
          padding: "1.4rem 1.6rem",
          background: isActive && phase === "SELECT"
            ? "rgba(20,14,40,0.88)"
            : "rgba(15,12,28,0.75)",
          border: isActive && phase === "SELECT"
            ? "1px solid rgba(168,85,247,0.55)"
            : "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(22px)",
          boxShadow: isActive && phase === "SELECT"
            ? "0 0 0 1px rgba(168,85,247,0.2), 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(124,58,237,0.18)"
            : "0 12px 40px rgba(0,0,0,0.4)",
          cursor: "pointer",
          overflow: "hidden",
          transition: "box-shadow 300ms, border-color 300ms",
          willChange: "transform",
        }}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={
          phase !== "VIEW" && !dimmed
            ? { y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 0 30px rgba(124,58,237,0.15)" }
            : {}
        }
      >
        {/* Active glow overlay */}
        <AnimatePresence>
          {isActive && phase === "SELECT" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                pointerEvents: "none",
                position: "absolute",
                inset: 0,
                borderRadius: "inherit",
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 65%)",
              }}
            />
          )}
        </AnimatePresence>

        {/* Problem ID badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.9rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: isActive && phase === "SELECT"
                ? "rgba(196,181,253,0.8)"
                : "rgba(255,255,255,0.28)",
              background: isActive && phase === "SELECT"
                ? "rgba(168,85,247,0.12)"
                : "rgba(255,255,255,0.05)",
              padding: "3px 10px",
              borderRadius: 6,
              border: isActive && phase === "SELECT"
                ? "1px solid rgba(168,85,247,0.3)"
                : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {problem.id}
          </span>

          {/* Live / Full indicator */}
          {isFull && (
            <span
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(251,113,133,0.8)",
                fontWeight: 600,
              }}
            >
              FULL
            </span>
          )}
          {isActive && phase === "SELECT" && !isFull && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(74,222,128,0.85)",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#4ade80",
                  boxShadow: "0 0 8px rgba(74,222,128,0.8)",
                  animation: "pulseLive 1.8s ease-in-out infinite",
                }}
              />
              ACTIVE
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "rgba(255,255,255,0.92)",
            marginBottom: "0.55rem",
            lineHeight: 1.35,
          }}
        >
          {problem.title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.44)",
            lineHeight: 1.65,
            ...(isExpanded ? {} : {
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            })
          }}
        >
          {problem.description}
        </p>

        {/* Slot bar */}
        {typeof problem.slots === "number" && (
          <SlotBar slots={problem.slots} slotsTaken={problem.slots_taken ?? 0} />
        )}

        {/* Selection button — only rendered in SELECT phase */}
        <AnimatePresence>
          {phase === "SELECT" && isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: "1.1rem" }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.28 }}
            >
              <div style={{ display: "flex", gap: "0.8rem", width: "100%" }}>
                <motion.button
                  id={`select-btn-${problem.id}`}
                  whileHover={canSelect ? { scale: 1.03 } : {}}
                  whileTap={canSelect ? { scale: 0.97 } : {}}
                  onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSelect(); }}
                  disabled={!canSelect}
                  style={{
                    flex: 1,
                    padding: "0.72rem 1.5rem",
                    borderRadius: 12,
                    border: "none",
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.83rem",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    cursor: canSelect ? "pointer" : "not-allowed",
                    background: canSelect
                      ? "linear-gradient(135deg,#7c3aed 0%,#a855f7 55%,#6366f1 100%)"
                      : "rgba(255,255,255,0.06)",
                    color: canSelect ? "#fff" : "rgba(255,255,255,0.28)",
                    boxShadow: canSelect
                      ? "0 4px 24px rgba(124,58,237,0.45)"
                      : "none",
                    transition: "all 280ms",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {selecting && <Spinner />}
                  {hasSelected
                    ? isMySelection ? "Selection Locked ✓" : "Already Locked In ✕"
                    : localRejected
                      ? "Problem Rejected ✕"
                      : isFull
                        ? "No Slots Available"
                        : selecting
                          ? "Locking In…"
                          : "Select This Problem"}

                  {/* Shimmer on active */}
                  {canSelect && (
                    <motion.span
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(110deg,transparent 25%,rgba(255,255,255,0.25) 50%,transparent 75%)",
                        pointerEvents: "none",
                      }}
                      animate={{ x: ["-140%", "140%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </motion.button>
                
                {onReject && !hasSelected && !localRejected && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setLocalRejected(true);
                      if (onReject) onReject(); 
                    }}
                    style={{
                      padding: "0.72rem 1.5rem",
                      borderRadius: 12,
                      border: "1px solid rgba(251,113,133,0.3)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.83rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      cursor: "pointer",
                      background: "rgba(251,113,133,0.1)",
                      color: "rgba(251,113,133,0.9)",
                      transition: "all 280ms",
                    }}
                  >
                    Reject
                  </motion.button>
                )}
              </div>

              {/* Inline error */}
              {selError && (
                <p
                  style={{
                    marginTop: 8,
                    fontSize: "0.73rem",
                    color: "rgba(251,113,133,0.85)",
                    textAlign: "center",
                  }}
                >
                  {selError}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULT phase: greyed out selection done state */}
        {phase === "RESULT" && isMySelection && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.55rem 1rem",
              borderRadius: 10,
              background: "rgba(74,222,128,0.08)",
              border: "1px solid rgba(74,222,128,0.2)",
              fontSize: "0.75rem",
              color: "rgba(74,222,128,0.8)",
              textAlign: "center",
              fontWeight: 600,
              letterSpacing: "0.1em",
            }}
          >
            ✓ YOUR SELECTION
          </div>
        )}
      </motion.div>
    );
  }
);
ProblemCard.displayName = "ProblemCard";

export default ProblemCard;
