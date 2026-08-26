import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  LayoutDashboard,
  Trophy,
  Users,
  FileText,
  Download,
  Upload,
  BarChart3,
  History,
  Medal,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  Shield,
  ScrollText,
  Menu,
  X,
  Zap,
  Activity,
  Star,
} from "lucide-react";

interface NavSection {
  label: string;
  items: NavItem[];
  defaultOpen?: boolean;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const navSections: NavSection[] = [
  {
    label: "Dashboard",
    defaultOpen: true,
    items: [
      { label: "Overview", path: "/admin/v2/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Hackathons",
    defaultOpen: true,
    items: [
      { label: "All Hackathons", path: "/admin/v2/hackathons", icon: List },
      { label: "Create Hackathon", path: "/admin/v2/hackathons/create", icon: Plus },
    ],
  },
  {
    label: "Teams",
    defaultOpen: true,
    items: [
      { label: "All Teams", path: "/admin/v2/teams", icon: Activity },
    ],
  },
  {
    label: "Evaluation",
    defaultOpen: false,
    items: [
      { label: "Score Manager", path: "/admin/v2/evaluation/scores", icon: BarChart3 },
    ],
  },
  {
    label: "Administration",
    defaultOpen: false,
    items: [
      { label: "Users", path: "/admin/v2/users", icon: Shield },
      { label: "Audit Logs", path: "/admin/v2/audit-logs", icon: ScrollText },
      { label: "Settings", path: "/admin/v2/settings", icon: Settings },
    ],
  },
];

function NavSectionComponent({ section }: { section: NavSection }) {
  const location = useLocation();
  const isAnyActive = section.items.some((item) => location.pathname === item.path);
  const [open, setOpen] = useState(section.defaultOpen || isAnyActive);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-widest text-white/30 hover:text-white/50 transition-colors"
      >
        {section.label}
        {open ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {section.items.map((item) => (
              <NavItemComponent key={item.path} item={item} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavItemComponent({ item }: { item: NavItem }) {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const Icon = item.icon;

  return (
    <Link to={item.path}>
      <div
        className={`relative flex items-center gap-3 px-3 py-2 mx-1 rounded-lg text-sm transition-all duration-150 group ${
          isActive
            ? "bg-indigo-500/15 text-indigo-400"
            : "text-white/50 hover:text-white/80 hover:bg-white/[0.04]"
        }`}
      >
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-full" />
        )}
        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-indigo-400" : "text-white/30 group-hover:text-white/60"}`} />
        <span className="font-medium">{item.label}</span>
      </div>
    </Link>
  );
}

function Sidebar({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/auth");
    onClose?.();
  };

  return (
    <div className={`flex flex-col h-full ${mobile ? "w-72" : "w-64"} bg-[#0a0a14] border-r border-white/[0.06]`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        {mobile && (
          <button onClick={onClose} className="text-white/40 hover:text-white/70 mr-1 -ml-1">
            <X className="w-5 h-5" />
          </button>
        )}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/30 shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-white font-bold text-sm tracking-tight">OREHACK</span>
          <span className="block text-white/30 text-xs font-medium tracking-widest uppercase">Admin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5" data-lenis-prevent>
        {navSections.map((section) => (
          <NavSectionComponent key={section.label} section={section} />
        ))}
      </nav>

      {/* User profile + logout */}
      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-white/80 text-xs font-semibold truncate">{user?.email}</p>
            <p className="text-white/30 text-[11px] font-medium uppercase tracking-wider">
              {user?.role?.replace("_", " ") ?? "Admin"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          id="admin-logout-btn"
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

// Breadcrumb helper
function getBreadcrumb(pathname: string): string {
  const crumbs: Record<string, string> = {
    "/admin/v2/dashboard": "Dashboard",
    "/admin/v2/hackathons": "All Hackathons",
    "/admin/v2/hackathons/create": "Create Hackathon",
    "/admin/v2/teams": "Teams",
    "/admin/v2/evaluation/scores": "Score Manager",
    "/admin/v2/evaluation/import": "Import Scores",
    "/admin/v2/evaluation/imports": "Import History",
    "/admin/v2/evaluation/leaderboard": "Leaderboard",
    "/admin/v2/exports": "Export Center",
    "/admin/v2/users": "Users",
    "/admin/v2/audit-logs": "Audit Logs",
    "/admin/v2/settings": "Settings",
  };
  
  // Match hackathon/team detail pages
  if (pathname.startsWith("/admin/v2/hackathons/") && pathname !== "/admin/v2/hackathons/create") {
    return "Hackathon Detail";
  }
  if (pathname.startsWith("/admin/v2/teams/")) return "Team Detail";
  
  return crumbs[pathname] ?? "Admin";
}

export default function AdminLayout() {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080810] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/auth" replace />;
  }

  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <div className="flex h-screen bg-[#080810] text-white overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full z-50 md:hidden"
            >
              <Sidebar mobile onClose={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header bar */}
        <header className="h-14 bg-[#0a0a14]/80 border-b border-white/[0.06] backdrop-blur-md flex items-center px-4 md:px-6 gap-4 shrink-0">
          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white/40 hover:text-white/70 transition-colors"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/30">Admin</span>
            <ChevronRight className="w-3 h-3 text-white/20" />
            <span className="text-white/70 font-medium">{breadcrumb}</span>
          </div>

          {/* Spacer + status indicator */}
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-white/30 font-medium hidden sm:block">Live</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto" data-lenis-prevent>
          <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
