import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import "@/styles/animations.css";
import { useCountdown } from "@/hooks/useCountdown";

interface CountdownTimerProps {
  currentTime: number;
  targetTime: number;
  onComplete?: () => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

interface DigitProps {
  value: number;
  label: string;
}

const CounterUnit: React.FC<DigitProps> = ({ value, label }) => {
  const prevRef = useRef(value);
  const [ticking, setTicking] = useState(false);

  useEffect(() => {
    if (prevRef.current !== value) {
      setTicking(true);
      const t = setTimeout(() => setTicking(false), 160);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return (
    <div className="ore-countdown__unit">
      <div className="ore-countdown__box">
        <span
          className={`ore-countdown__digits${ticking ? " ore-countdown__digits--tick" : ""}`}
        >
          {pad(value)}
        </span>
      </div>
      <span className="ore-countdown__label">{label}</span>
    </div>
  );
};

const CountdownTimer: React.FC<CountdownTimerProps> = React.memo(
  ({ currentTime, targetTime, onComplete }) => {
    const { days, hours, minutes, seconds, isOver } = useCountdown(currentTime, targetTime);

    useEffect(() => {
      if (isOver) onComplete?.();
    }, [isOver, onComplete]);

    if (isOver) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="ore-countdown"
        role="timer"
        aria-live="polite"
        aria-label="Event countdown"
      >
        <CounterUnit value={days} label="Days" />
        <span className="ore-countdown__sep">:</span>
        <CounterUnit value={hours} label="Hours" />
        <span className="ore-countdown__sep">:</span>
        <CounterUnit value={minutes} label="Min" />
        <span className="ore-countdown__sep">:</span>
        <CounterUnit value={seconds} label="Sec" />
      </motion.div>
    );
  }
);

CountdownTimer.displayName = "CountdownTimer";
export default CountdownTimer;
