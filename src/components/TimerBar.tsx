import React, { memo, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Phase } from "@/hooks/useControlState";

interface TimerBarProps {
  phaseEndTime: string | null;
  phase: Phase;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return "00:00";
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const PHASE_BAR_COLORS: Record<Phase, string> = {
  VIEW: "linear-gradient(90deg,#fbbf24,#f59e0b)",
  SELECT: "linear-gradient(90deg,#7c3aed,#a855f7,#4ade80)",
  RESULT: "linear-gradient(90deg,#a855f7,#6366f1)",
};

export const TimerBar: React.FC<TimerBarProps> = memo(({ phaseEndTime, phase }) => {
  const [remaining, setRemaining] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const startRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!phaseEndTime) {
      setRemaining(0);
      setTotal(0);
      return;
    }

    const endMs = new Date(phaseEndTime).getTime();
    const nowMs = Date.now();
    const rem = Math.max(0, endMs - nowMs);
    setRemaining(rem);
    // Measure total from when we first saw this phaseEndTime
    startRef.current = nowMs;
    setTotal(rem);

    const interval = setInterval(() => {
      const r = Math.max(0, endMs - Date.now());
      setRemaining(r);
      if (r === 0) clearInterval(interval);
    }, 250);

    return () => clearInterval(interval);
  }, [phaseEndTime]);

  if (!phaseEndTime || total === 0) return null;

  const progress = Math.min(1, Math.max(0, remaining / total));
  const urgency = progress < 0.2;

  return (
    <div
      style={{
        marginBottom: "1.5rem",
        padding: "0.75rem 1.2rem",
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          Phase Timer
        </span>
        <motion.span
          key={Math.floor(remaining / 1000)}
          initial={{ opacity: 0.7, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.12 }}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.82rem",
            fontWeight: 700,
            color: urgency ? "rgba(251,113,133,0.9)" : "rgba(196,181,253,0.85)",
          }}
        >
          {formatRemaining(remaining)}
        </motion.span>
      </div>

      {/* Progress track */}
      <div
        style={{
          height: 5,
          borderRadius: 3,
          background: "rgba(255,255,255,0.07)",
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ scaleX: progress }}
          transition={{ duration: 0.25, ease: "linear" }}
          style={{
            height: "100%",
            borderRadius: 3,
            transformOrigin: "left",
            background: urgency
              ? "linear-gradient(90deg,#fb7185,#f43f5e)"
              : PHASE_BAR_COLORS[phase],
            boxShadow: urgency
              ? "0 0 8px rgba(251,113,133,0.6)"
              : "0 0 8px rgba(124,58,237,0.4)",
          }}
        />
      </div>
    </div>
  );
});
TimerBar.displayName = "TimerBar";

export default TimerBar;
