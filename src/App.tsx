import { useEffect, useState } from "react";
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
import HackathonAdminDashboard from "./pages/HackathonAdminDashboard";
import DeveloperAdminDashboard from "./pages/DeveloperAdminDashboard";
import { LoadingScreen } from "./components/LoadingScreen";

const queryClient = new QueryClient();

/**
 * The permanent background watermark, always present behind the site content.
 */
function LogoBackgroundWatermark() {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <img
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

    return () => lenis.destroy();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* The permanent low-opacity watermark */}
        <LogoBackgroundWatermark />
        {/* The cinematic loading screen (unmounts after it finishes) */}
        <LoadingScreen onReveal={() => setIsRevealed(true)} />

        <SmoothCursor />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className={isRevealed ? 'site-ready' : ''} style={{ opacity: isRevealed ? undefined : 0 }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/hackathon/:hackathonId/login" element={<HackathonLogin />} />
              <Route path="/hackathon/:hackathonId/submit" element={<SubmissionPage />} />
              <Route path="/hackathon/:hackathonId/leaderboard" element={<Leaderboard />} />
              <Route path="/admin/auth" element={<AdminAuth />} />
              <Route path="/admin/hackathon" element={<HackathonAdminDashboard />} />
              <Route path="/admin/developer" element={<DeveloperAdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
