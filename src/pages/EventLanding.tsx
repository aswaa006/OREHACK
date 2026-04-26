import React, { useCallback, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEvent } from "@/context/EventContext";
import { useEventState } from "@/hooks/useEventState";
import CountdownTimer from "@/components/CountdownTimer";
import PageTransition from "@/components/PageTransition";

const EventLanding: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { state } = useEvent();
  const { isEventLive, currentTime, eventStartTime, eventName } = useEventState();

  // Track whether the countdown has expired (hit zero) locally
  const [countdownExpired, setCountdownExpired] = useState(false);

  // If the context flips isEventLive, also clear the local expired state
  useEffect(() => {
    if (isEventLive) setCountdownExpired(false);
  }, [isEventLive]);

  const resolvedName = eventId
    ? eventId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : eventName;

  // Called when CountdownTimer reaches 00:00
  const handleGoLive = useCallback(() => {
    setCountdownExpired(true);
  }, []);

  const handleLogin = useCallback(() => {
    navigate(`/event/${eventId ?? state.eventId}/login`);
  }, [navigate, eventId, state.eventId]);

  // True when we should show the "live" UI  — either the server says so OR countdown expired locally
  const showLive = isEventLive || countdownExpired;

  return (
    <PageTransition>
      <div
        className="relative min-h-screen text-white selection:bg-purple-500/30 overflow-hidden"
        style={{
          fontFamily: "'Inter', sans-serif",
          background: "linear-gradient(160deg, #0a0a0a 0%, #141414 40%, #1a1a1a 70%, #0d0d0d 100%)"
        }}
      >

        {/* Premium Radial Glows */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-[600px] w-[600px] rounded-full bg-purple-600/10 blur-[120px]"
          />
          <motion.div
            animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.2, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute h-[800px] w-[800px] rounded-full bg-indigo-600/10 blur-[150px]"
          />
        </div>

        {/* Premium Noise Overlay */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] mix-blend-screen"
          style={{ backgroundImage: "url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
        />

        {/* ── Top Navbar — fixed height so left & right share exact same vertical offset ── */}
        <div
          className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-8 sm:px-12"
          style={{ height: "64px" }}
        >
          {/* Logo — JetBrains Mono, white + purple ++ */}
          <span
            className="font-bold tracking-[0.2em] uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.875rem", lineHeight: 1 }}
          >
            OREHACK<span className="text-purple-500">++</span>
          </span>

          {/* Status pill — aligned to same 64px baseline as logo */}
          <div className="flex items-center gap-3" style={{ lineHeight: 1 }}>
            <div
              className={`h-1.5 w-1.5 rounded-full animate-pulse ${
                showLive ? "bg-white shadow-[0_0_10px_white]" : "bg-purple-500 shadow-[0_0_10px_#a855f7]"
              }`}
            />
            <span
              className="font-bold tracking-[0.2em] uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.85)" }}
            >
              {showLive ? "LIVE" : "PRE-EVENT"}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
          <AnimatePresence mode="wait">

            {/* ── LIVE / POST-COUNTDOWN state ── */}
            {showLive ? (
              <motion.div
                key="live"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex w-full flex-col items-center text-center"
              >
                {/* Fluid typography — scales from 2.5rem (mobile) to 6rem (desktop) */}
                <h1
                  className="mb-4 font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-2xl"
                  style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
                >
                  {resolvedName}
                </h1>

                {/* Improved contrast: /65 instead of /40 */}
                <p className="mb-8 tracking-widest uppercase" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)" }}>
                  Powered by <span className="text-purple-400 font-bold">OreHack</span>
                </p>

                {/* Countdown-expired / live CTA banner */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="mb-10 flex items-center gap-3 rounded-full px-6 py-2.5"
                  style={{
                    background: "rgba(74,222,128,0.08)",
                    border: "1px solid rgba(74,222,128,0.3)",
                  }}
                >
                  <motion.div
                    className="h-2 w-2 rounded-full bg-emerald-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />
                  <span
                    className="font-bold tracking-[0.18em] uppercase"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(74,222,128,0.9)" }}
                  >
                    The Event is Live!
                  </span>
                </motion.div>

                {/* Solid white CTA — maximum visual weight */}
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 48px rgba(168,85,247,0.55)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogin}
                  className="group relative flex items-center justify-center gap-3 rounded-full bg-white px-12 py-4 text-sm font-bold text-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                >
                  Enter Now — Get Your Problem
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>

                <p className="mt-6 tracking-[0.2em] font-medium uppercase" style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)" }}>
                  Authenticate with your team credentials
                </p>
              </motion.div>

            ) : (
              /* ── PRE-EVENT / COUNTDOWN state ── */
              <motion.div
                key="countdown"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex w-full flex-col items-center text-center"
              >
                {/* Fluid typography — clamp smoothly from mobile to desktop */}
                <h1
                  className="mb-4 font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 drop-shadow-2xl"
                  style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
                >
                  {resolvedName}
                </h1>

                {/* Improved contrast: /65 instead of /40 */}
                <p className="mb-10 tracking-widest uppercase" style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)" }}>
                  Powered by <span className="text-purple-400 font-bold">OreHack</span>
                </p>

                {/* "Event Starts In" label — improved contrast /80 instead of /60 */}
                <div className="mb-6">
                  <span
                    className="font-bold tracking-[0.2em] uppercase"
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.75)" }}
                  >
                    Event starts in
                  </span>
                </div>

                <div className="mb-14 scale-110 sm:scale-125 relative z-10">
                  <CountdownTimer currentTime={currentTime} targetTime={eventStartTime} onComplete={handleGoLive} />
                </div>

                {/* ── Early Login CTA — solid fill for primary visual weight ── */}
                <motion.button
                  whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(168,85,247,0.5)" }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLogin}
                  className="group relative flex items-center justify-center gap-3 rounded-full px-10 py-4 text-sm font-bold transition-all sm:px-12 sm:py-4"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #6366f1 100%)",
                    color: "#ffffff",
                    boxShadow: "0 4px 24px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                    border: "1px solid rgba(168,85,247,0.4)",
                  }}
                >
                  Early Login (Waiting Room)
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </motion.button>

                <p className="mt-6 tracking-[0.2em] font-medium uppercase" style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.45)" }}>
                  Registered teams only — you'll wait until the event starts
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
          <p className="font-bold tracking-[0.3em] uppercase" style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)" }}>
            OreHack © 2026
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default EventLanding;
