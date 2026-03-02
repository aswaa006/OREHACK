import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HackathonLogin from "./pages/HackathonLogin";
import SubmissionPage from "./pages/SubmissionPage";
import Leaderboard from "./pages/Leaderboard";
import AdminAuth from "./pages/AdminAuth";
import HackathonAdminDashboard from "./pages/HackathonAdminDashboard";
import DeveloperAdminDashboard from "./pages/DeveloperAdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
