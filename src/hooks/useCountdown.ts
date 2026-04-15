import { useMemo } from "react";

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // ms remaining
  isOver: boolean;
}

/**
 * Pure derivation — no side-effects, no extra setInterval.
 * Pass currentTime and targetTime from EventContext (updated every second).
 */
export function useCountdown(currentTime: number, targetTime: number): CountdownParts {
  return useMemo(() => {
    const total = Math.max(0, targetTime - currentTime);
    const isOver = total === 0;

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds, total, isOver };
  }, [currentTime, targetTime]);
}
