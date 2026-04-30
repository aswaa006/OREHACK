import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Phase, Problem } from "@/hooks/useControlState";

// ─── Slot Bar ─────────────────────────────────────────────────────────────────
const SlotBar: React.FC<{ slots: number; slotsTaken: number }> = memo(({ slots, slotsTaken }) => {
  const pct = slots > 0 ? Math.min(1, slotsTaken / slots) : 0;
  const isFull = slotsTaken >= slots;
  
  let bgGradient = "linear-gradient(90deg, #3b82f6, #8b5cf6)"; // Neutral Blue/Purple for 0-50%
  if (pct >= 1) {
    bgGradient = "linear-gradient(90deg, #ef4444, #dc2626)"; // Solid Red for 100%
  } else if (pct >= 0.5) {
    bgGradient = "linear-gradient(90deg, #f59e0b, #ea580c)"; // Warning Orange for 50-90%
  }

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
            color: isFull ? "rgba(239,68,68,0.85)" : "rgba(196,181,253,0.7)",
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
            background: bgGradient,
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
  isActive: boolean;
  isMySelection: boolean;
  index: number;
  onClick: () => void;
}

// ─── ProblemCard ──────────────────────────────────────────────────────────────
export const ProblemCard: React.FC<ProblemCardProps> = memo(
  ({ problem, phase, isActive, isMySelection, index, onClick }) => {
    const isFull = problem.slots_taken >= problem.slots;
    const dimmed = phase === "SELECT" && !isActive;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 28 }}
        animate={{
          opacity: dimmed ? 0.38 : 1,
          y: 0,
          scale: dimmed ? 0.96 : 1,
        }}
        transition={{ duration: 0.45, delay: index * 0.07 }}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignSelf: "start",
          minHeight: 220,
          borderRadius: 18,
          padding: "1.4rem 1.6rem",
          background: isActive && phase === "SELECT"
            ? "rgba(20,14,40,0.88)"
            : "rgba(15,12,28,0.75)",
          border: isActive && phase === "SELECT"
            ? "1px solid rgba(168,85,247,0.55)"
            : "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(22px)",
          cursor: "pointer",
          overflow: "hidden",
          transition: "border-color 300ms",
          willChange: "transform",
        }}
        onClick={onClick}
        whileHover={
          dimmed ? {} : { 
            y: -2, 
            borderColor: "rgba(168,85,247,0.4)",
          }
        }
      >
        {/* Active border overlay instead of glow */}
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
                border: "1px solid rgba(168,85,247,0.8)",
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
          {isFull ? (
            <span
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#fca5a5",
                background: "rgba(239,68,68,0.15)",
                padding: "3px 10px",
                borderRadius: 999,
                fontWeight: 700,
                border: "1px solid rgba(239,68,68,0.3)"
              }}
            >
              FULL
            </span>
          ) : isActive && phase === "SELECT" ? (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#86efac",
                background: "rgba(34,197,94,0.12)",
                padding: "3px 10px",
                borderRadius: 999,
                fontWeight: 700,
                border: "1px solid rgba(34,197,94,0.3)"
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#4ade80",
                }}
              />
              ACTIVE
            </span>
          ) : (
            <span
              style={{
                fontSize: "0.6rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#93c5fd",
                background: "rgba(59,130,246,0.12)",
                padding: "3px 10px",
                borderRadius: 999,
                fontWeight: 700,
                border: "1px solid rgba(59,130,246,0.25)"
              }}
            >
              OPEN
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            letterSpacing: "-0.01em",
            color: "rgba(255,255,255,0.95)",
            marginBottom: "0.55rem",
            lineHeight: 1.35,
          }}
        >
          {problem.title}
        </h3>

        {/* Description (Always Clamped) */}
        <p
          style={{
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.75)",
            lineHeight: 1.65,
            flexGrow: 1,
            fontFamily: "'Inter', sans-serif",
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {problem.description}
        </p>

        {/* Slot bar */}
        {typeof problem.slots === "number" && (
          <SlotBar slots={problem.slots} slotsTaken={problem.slots_taken ?? 0} />
        )}

        {/* View Details Prompt */}
        <div style={{ marginTop: "1rem", textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(168,85,247,0.8)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                View Details →
            </span>
        </div>

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
