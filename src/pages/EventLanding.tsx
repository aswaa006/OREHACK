import React, { useCallback } from "react";
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

  const resolvedName = eventId
    ? eventId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : eventName;

  const handleGoLive = useCallback(() => {}, []);

  const handleLogin = useCallback(() => {
    navigate(`/event/${eventId ?? state.eventId}/login`);
  }, [navigate, eventId, state.eventId]);

  return (
    <PageTransition>
      <div 
        className="relative min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        
        {/* Clean Soft Center Glow */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[120px]"
          />
        </div>
        
        {/* Premium Noise Overlay (Extremely Subtle) */}
        <div 
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.03] mix-blend-screen" 
          style={{ backgroundImage: "url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }} 
        />

        {/* Top Navbar */}
        <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-8 sm:px-12">
          <span 
            className="text-sm font-bold tracking-[0.2em] text-white uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            ORE<span className="text-purple-400">HACK</span>
          </span>
          <div className="flex items-center gap-3">
            <div className={`h-1.5 w-1.5 rounded-full ${isEventLive ? "bg-white" : "bg-purple-400"} animate-pulse`} />
            <span className="text-[0.65rem] font-bold tracking-[0.2em] text-white/80 uppercase">
              {isEventLive ? "LIVE" : "PRE-EVENT"}
            </span>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
          <AnimatePresence mode="wait">
            {isEventLive ? (
              <motion.div 
                key="live" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex w-full flex-col items-center text-center"
              >
                <div className="mb-8 flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
                  <span className="text-[0.65rem] font-bold tracking-[0.2em] text-purple-300 uppercase">Event is Live</span>
                </div>
                
                <h1 className="mb-6 text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl">
                  {resolvedName}
                </h1>
                
                <p className="mb-14 text-base tracking-widest text-white/40 uppercase">
                  Powered by <span className="text-white/80">Oregent</span>
                </p>

                <button
                  onClick={handleLogin}
                  className="group relative flex items-center justify-center gap-3 rounded-full bg-white px-10 py-4 text-sm font-bold text-black transition-all hover:bg-purple-50 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] active:scale-95 sm:px-12 sm:py-4"
                >
                  Enter Portal 
                  <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                
                <p className="mt-8 text-[0.65rem] font-medium tracking-[0.2em] text-white/30 uppercase">
                  Authenticate with your team credentials
                </p>
              </motion.div>
            ) : (
              <motion.div 
                key="countdown" 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex w-full flex-col items-center text-center"
              >
                <div className="mb-8 flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5">
                  <span className="text-[0.65rem] font-bold tracking-[0.2em] text-purple-300 uppercase">Event starts in</span>
                </div>
                
                <h1 className="mb-6 text-5xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl">
                  {resolvedName}
                </h1>
                
                <p className="mb-16 text-base tracking-widest text-white/40 uppercase">
                  Powered by <span className="text-white/80">Oregent</span>
                </p>

                <div className="mb-16 scale-110 sm:scale-125">
                  <CountdownTimer currentTime={currentTime} targetTime={eventStartTime} onComplete={handleGoLive} />
                </div>

                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-[0.65rem] font-bold tracking-[0.15em] text-white/30 uppercase">Login unlocks when event goes live</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 z-20 text-center">
          <p className="text-[10px] font-bold tracking-[0.3em] text-white/20 uppercase">
            OreHack by Oregent &copy; 2025
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default EventLanding;
