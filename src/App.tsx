import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HackathonLogin from "./pages/HackathonLogin";
import SubmissionPage from "./pages/SubmissionPage";
import Leaderboard from "./pages/Leaderboard";
import AdminAuth from "./pages/AdminAuth";
import HackathonAdminUnderDevelopment from "./pages/HackathonAdminUnderDevelopment";
import DeveloperAdminDashboard from "./pages/DeveloperAdminDashboard";
import CreateHackathon from "./pages/CreateHackathon";
import OriginAdmin from "./pages/OriginAdmin";
import { LoadingScreen } from "./components/LoadingScreen";

const queryClient = new QueryClient();

/**
 * The permanent background watermark, always present behind the site content.
 */
function LogoBackgroundWatermark({ imgRef }: { imgRef: React.RefObject<HTMLImageElement> }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <img
      ref={imgRef}
      src="/oregent-logo.png"
      aria-hidden="true"
      className="site-logo-bg"
      alt=""
    />,
    document.body
  );
}

const App = () => {
  // `isRevealed` becomes true when the loading screen blast animation reaches the point
  // where the site content should start fading/scaling in.
  const [isRevealed, setIsRevealed] = useState(false);

  // Ref for the background watermark — lets us toggle fast-spin without re-render
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      lerp: 0.07,
      syncTouch: true,
      syncTouchLerp: 0.06,
    });

    lenis.on('scroll', (e: any) => {
      const el = logoRef.current;
      if (el) {
        // Calculate how far we are from the bottom of the page
        const scrollHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        const maxScroll = scrollHeight - windowHeight;
        const currentScroll = typeof e.scroll === 'number' ? e.scroll : window.scrollY;
        
        const distanceToBottom = maxScroll - currentScroll;
        
        // Define the threshold (e.g., last 900px) when opacity starts rapidly increasing
        const rampStart = 900;
        let targetOpacity = 0.04;
        
        if (distanceToBottom < rampStart && distanceToBottom >= 0) {
          // Normalize the progress within the last 900px (0 to 1)
          const t = 1 - (distanceToBottom / rampStart);
          const clampedT = Math.max(0, Math.min(1, t));
          // Scale rapidly from 0.04 up to 0.80
          targetOpacity = 0.04 + (0.76 * clampedT);
        } else if (distanceToBottom < 0) {
          targetOpacity = 0.8;
        }

        el.style.opacity = targetOpacity.toString();

        // Stop spinning only when reaching the absolute bottom (full opacity)
        const isFullOpacity = distanceToBottom <= 15;

        if (isFullOpacity && !el.classList.contains('site-logo-bg--footer')) {
          // Capture the current rotation from the running animation
          const computedStyle = window.getComputedStyle(el);
          const matrix = computedStyle.transform;
          let angle = 0;
          if (matrix && matrix !== 'none') {
            const values = matrix.split('(')[1]?.split(')')[0]?.split(',');
            if (values && values.length >= 2) {
              const a = parseFloat(values[0]);
              const b = parseFloat(values[1]);
              angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
            }
          }

          // Pause the CSS animation and transition smoothly from current angle
          el.style.animationPlayState = 'paused';
          el.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
          el.classList.add('site-logo-bg--footer');
        } else if (!isFullOpacity && el.classList.contains('site-logo-bg--footer')) {
          // Resume spinning from current position
          el.classList.remove('site-logo-bg--footer');
          el.style.transform = '';
          el.style.animationPlayState = '';
        }
      }
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, [isRevealed]);

  // Listen for the "Enter Portal" turbo event fired from ActiveHackathons
  useEffect(() => {
    let resetTimer: ReturnType<typeof setTimeout>;
    const onTurbo = () => {
      if (!logoRef.current) return;
      logoRef.current.classList.add('site-logo-bg--turbo');
      clearTimeout(resetTimer);
      // Revert to slow spin after 4 s (enough time to navigate away)
      resetTimer = setTimeout(() => {
        logoRef.current?.classList.remove('site-logo-bg--turbo');
      }, 4000);
    };
    window.addEventListener('logoTurbo', onTurbo);
    return () => {
      window.removeEventListener('logoTurbo', onTurbo);
      clearTimeout(resetTimer);
    };
  }, []);

  // Listen for the "Enter Portal" turbo event fired from ActiveHackathons
  useEffect(() => {
    let resetTimer: ReturnType<typeof setTimeout>;
    const onTurbo = () => {
      if (!logoRef.current) return;
      logoRef.current.classList.add('site-logo-bg--turbo');
      clearTimeout(resetTimer);
      // Revert to slow spin after 4 s (enough time to navigate away)
      resetTimer = setTimeout(() => {
        logoRef.current?.classList.remove('site-logo-bg--turbo');
      }, 4000);
    };
    window.addEventListener('logoTurbo', onTurbo);
    return () => {
      window.removeEventListener('logoTurbo', onTurbo);
      clearTimeout(resetTimer);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* The permanent low-opacity watermark */}
        <LogoBackgroundWatermark imgRef={logoRef} />
        {/* The cinematic loading screen (unmounts after it finishes) */}
        <LoadingScreen onReveal={() => {
          console.log('Loading screen reveal triggered');
          setIsRevealed(true);
        }} />

        <SmoothCursor />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div 
            className={isRevealed ? 'site-ready' : ''} 
            style={{ 
              opacity: isRevealed ? 1 : 0,
              transition: 'opacity 0.5s ease-in',
              minHeight: '100vh'
            }}
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/hackathon/:hackathonId/login" element={<HackathonLogin />} />
              <Route path="/hackathon/:hackathonId/submit" element={<SubmissionPage />} />
              <Route path="/hackathon/:hackathonId/leaderboard" element={<Leaderboard />} />
              <Route path="/admin/auth" element={<AdminAuth />} />
              <Route path="/admin/hackathon" element={<HackathonAdminUnderDevelopment />} />
              <Route path="/admin/hackathon/create" element={<CreateHackathon />} />
              <Route path="/admin/developer" element={<DeveloperAdminDashboard />} />
              <Route path="/originadmin" element={<OriginAdmin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
