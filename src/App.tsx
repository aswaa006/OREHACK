import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HackathonLogin from "./pages/HackathonLogin";
import SubmissionPage from "./pages/SubmissionPage";
import Leaderboard from "./pages/Leaderboard";
import AdminAuth from "./pages/AdminAuth";
import HackathonAdminDashboard from "./pages/HackathonAdminDashboard";
import DeveloperAdminDashboard from "./pages/DeveloperAdminDashboard";
import AdminHealth from "./pages/AdminHealth";
import CreateHackathon from "./pages/CreateHackathon";
import OriginAdmin from "./pages/OriginAdmin";
import OriginControlPanel from "./pages/OriginControlPanel";
import OriginStage4 from "./pages/OriginStage4";
import OriginStage1 from "./pages/OriginStage1";
import OriginStage2 from "./pages/OriginStage2";
import { LoadingScreen } from "./components/LoadingScreen";
// Phase 1 — Event flow
import { EventProvider } from "./context/EventContext";
import EventLanding from "./pages/EventLanding";
import Login from "./pages/Login";
import Rules from "./pages/Rules";
import WaitingRoom from "./pages/WaitingRoom";
import ControlRoom from "./pages/ControlRoom";
import ProblemStatementsOverview from "./pages/ProblemStatementsOverview";
import OriginStage3 from "./pages/OriginStage3";
import HackathonsPage from "./pages/Hackathons";
import { runStartupHealthCheck } from "@/lib/health-check";

const queryClient = new QueryClient();

function LogoBackgroundWatermark({ imgRef, hidden }: { imgRef: React.RefObject<HTMLImageElement>, hidden?: boolean }) {
  if (typeof document === 'undefined' || hidden) return null;
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

const WatermarkManager = ({ logoRef }: { logoRef: React.RefObject<HTMLImageElement> }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === "/" || location.pathname.startsWith("/event/");

  useEffect(() => {
    const handleScroll = () => {
      const el = logoRef.current;
      const footer = document.querySelector('footer');
      if (!el || isLandingPage) return;

      let targetOpacity = 0.04;
      let isFullOpacity = false;

      if (footer) {
        const rect = footer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const distanceToBottom = rect.bottom - windowHeight;
        const rampDistance = 800;

        if (distanceToBottom <= rampDistance && distanceToBottom > 0) {
          const t = 1 - (distanceToBottom / rampDistance);
          const clampedT = Math.max(0, Math.min(1, t));
          targetOpacity = 0.04 + (0.76 * clampedT);
        } else if (distanceToBottom <= 0) {
          targetOpacity = 0.8;
        }
        isFullOpacity = distanceToBottom <= 10;
      }

      el.style.opacity = targetOpacity.toString();

      if (isFullOpacity && !el.classList.contains('site-logo-bg--footer')) {
        const computedStyle = window.getComputedStyle(el);
        const matrix = computedStyle.transform;
        let angle = 0;
        if (matrix && matrix !== 'none') {
          const values = matrix.split('(')[1]?.split(')')[0]?.split(',');
          if (values && values.length >= 2) {
            angle = Math.round(Math.atan2(parseFloat(values[1]), parseFloat(values[0])) * (180 / Math.PI));
          }
        }
        el.classList.add('site-logo-bg--footer');
        el.style.animationPlayState = 'paused';
        el.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      } else if (!isFullOpacity && el.classList.contains('site-logo-bg--footer')) {
        el.classList.remove('site-logo-bg--footer');
        el.style.animationPlayState = 'running';
        el.style.transform = '';
      }
    };

    const onTurbo = () => {
      if (!logoRef.current || isLandingPage) return;
      logoRef.current.classList.add('site-logo-bg--turbo');
      setTimeout(() => {
        logoRef.current?.classList.remove('site-logo-bg--turbo');
      }, 4000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('logoTurbo', onTurbo);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('logoTurbo', onTurbo);
    };
  }, [location.pathname, isLandingPage, logoRef]);

  return <LogoBackgroundWatermark imgRef={logoRef} hidden={isLandingPage} />;
};

const EventPathRedirect = ({ to }: { to: string }) => {
  const { eventId } = useParams<{ eventId: string }>();
  const baseEvent = eventId || "origin-2k26";
  return <Navigate to={`/event/${baseEvent}/${to}`} replace />;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* ── Existing routes ── */}
        <Route path="/" element={<Index />} />
        <Route path="/hackathon/:hackathonId/login" element={<HackathonLogin />} />
        <Route path="/hackathon/:hackathonId/submit" element={<SubmissionPage />} />
        <Route path="/hackathon/:hackathonId/leaderboard" element={<Leaderboard />} />
        <Route path="/admin" element={<Navigate to="/admin/auth" replace />} />
        <Route path="/admin/login" element={<Navigate to="/admin/auth" replace />} />
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin/hackathon" element={<HackathonAdminDashboard />} />
        <Route path="/admin/hackathon/create" element={<CreateHackathon />} />
        <Route path="/admin/developer" element={<DeveloperAdminDashboard />} />
        <Route path="/admin/health" element={<AdminHealth />} />
        <Route path="/orehackproject1924" element={<OriginAdmin />} />
        <Route path="/orehackproject1924/panel" element={<OriginControlPanel />} />
        <Route path="/orehackproject1924/panel/stage-1" element={<OriginStage1 />} />
        <Route path="/orehackproject1924/panel/stage-2" element={<OriginStage2 />} />
        <Route path="/orehackproject1924/panel/stage-3" element={<OriginStage3 />} />
        <Route path="/orehackproject1924/panel/stage-4" element={<OriginStage4 />} />

        {/* ── Phase 1: Event flow ── */}
        <Route path="/event/:eventId" element={<EventLanding />} />
        <Route path="/event/:eventId/login" element={<Login />} />
        <Route path="/event/:eventId/rules" element={<Rules />} />
        <Route path="/event/:eventId/waiting-room" element={<WaitingRoom />} />
        <Route path="/event/:eventId/stage-1" element={<EventPathRedirect to="waiting-room" />} />
        {/* Stage 2 — Control Room (Problem Statement Allocation) */}
        <Route path="/event/:eventId/stage-2" element={<ControlRoom />} />
        {/* Problem Statements Overview (after allocation completes) */}
        <Route path="/event/:eventId/overview" element={<ProblemStatementsOverview />} />
        <Route path="/event/:eventId/problem-statements" element={<EventPathRedirect to="overview" />} />
        {/* Submission desk */}
        <Route path="/event/:eventId/submit" element={<SubmissionPage />} />
        <Route path="/event/:eventId/stage-3" element={<EventPathRedirect to="submit" />} />

        <Route path="/hackathons" element={<HackathonsPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  const [isRevealed, setIsRevealed] = useState(false);
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

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    void runStartupHealthCheck(true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <WatermarkManager logoRef={logoRef} />

          <LoadingScreen onReveal={() => {
            console.log('Loading screen reveal triggered');
            setIsRevealed(true);
          }} />

          <SmoothCursor />
          <Toaster />
          <Sonner />

          <EventProvider>
            <div
              className={isRevealed ? 'site-ready' : ''}
              style={{
                opacity: isRevealed ? 1 : 0,
                transition: 'opacity 0.5s ease-in',
                minHeight: '100vh'
              }}
            >
              <AnimatedRoutes />
            </div>
          </EventProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
