import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCountdown } from "@/hooks/useCountdown";

interface CountdownTimerProps {
  currentTime: number;
  targetTime: number;
  onComplete?: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

const CounterUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const digits = pad(value).split("");

  return (
    <div className="flex flex-col items-center justify-center gap-1 sm:gap-2">
      <div className="flex">
        {digits.map((digit, idx) => (
          <div key={idx} className="relative h-14 w-9 sm:h-20 sm:w-12 overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              <motion.span
                key={digit}
                initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.2, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-5xl sm:text-[5rem] font-bold text-white tracking-tight tabular-nums"
                style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1 }}
              >
                {digit}
              </motion.span>
            </AnimatePresence>
          </div>
        ))}
      </div>
      <span className="text-sm sm:text-lg font-normal text-white/90" style={{ fontFamily: "'Inter', sans-serif" }}>
        {label}
      </span>
    </div>
  );
};

const Divider = () => (
  <div 
    className="h-16 sm:h-24 w-px bg-white/40" 
    style={{ 
      maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)',
      WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
    }} 
  />
);

const CountdownTimer: React.FC<CountdownTimerProps> = React.memo(
  ({ currentTime, targetTime, onComplete }) => {
    const { days, hours, minutes, seconds, isOver } = useCountdown(currentTime, targetTime);

    useEffect(() => {
      if (isOver) onComplete?.();
    }, [isOver, onComplete]);

    if (isOver) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-center gap-6 sm:gap-12 md:gap-16"
        role="timer"
      >
        <CounterUnit value={days} label="Days" />
        <Divider />
        <CounterUnit value={hours} label="Hours" />
        <Divider />
        <CounterUnit value={minutes} label="Minutes" />
        <Divider />
        <CounterUnit value={seconds} label="Seconds" />
      </motion.div>
    );
  }
);

CountdownTimer.displayName = "CountdownTimer";
export default CountdownTimer;
