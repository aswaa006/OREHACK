import React, { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Phase } from "@/hooks/useControlState";

interface PhaseBannerProps {
  phase: Phase;
}

const PHASE_CONFIG: Record<
  Phase,
  { label: string; dot: string; color: string; bg: string; border: string; instruction: string }
> = {
  VIEW: {
    label: "VIEW PHASE",
    dot: "#fbbf24",
    color: "rgba(251,191,36,0.9)",
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.25)",
    instruction: "Study the problem statements. Selection will open soon.",
  },
  SELECT: {
    label: "SELECT PHASE",
    dot: "#4ade80",
    color: "rgba(74,222,128,0.9)",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.25)",
    instruction: "One problem is live. Click 'Select This Problem' to lock in your choice.",
  },
  RESULT: {
    label: "RESULT PHASE",
    dot: "#a855f7",
    color: "rgba(168,85,247,0.9)",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.25)",
    instruction: "Selection window has closed. Results are being finalised.",
  },
};

export const PhaseBanner: React.FC<PhaseBannerProps> = memo(({ phase }) => {
  const cfg = PHASE_CONFIG[phase];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.35 }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "0.75rem",
          padding: "0.9rem 1.4rem",
          borderRadius: 14,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          backdropFilter: "blur(12px)",
          marginBottom: "1.75rem",
        }}
      >
        {/* Phase pill */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Animated dot */}
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: cfg.dot,
              boxShadow: `0 0 8px ${cfg.dot}`,
              flexShrink: 0,
              animation:
                phase === "SELECT"
                  ? "pulseLive 1.8s ease-in-out infinite"
                  : phase === "VIEW"
                    ? "pulseWait 2.2s ease-in-out infinite"
                    : "none",
            }}
          />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.24em",
              color: cfg.color,
            }}
          >
            {cfg.label}
          </span>
        </div>

        {/* Instruction */}
        <span
          style={{
            fontSize: "0.78rem",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.5,
          }}
        >
          {cfg.instruction}
        </span>
      </motion.div>
    </AnimatePresence>
  );
});
PhaseBanner.displayName = "PhaseBanner";

export default PhaseBanner;
