import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { clearAdminSession, normalizeDashboardRole } from "@/lib/dashboard-routing";
import { uploadHackathonBanner } from "@/lib/storage";
import { Eye, EyeOff } from "lucide-react";

/* ─── Auth constants ─────────────────────────────────────── */
const ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const mapStatusToDb = (status: HackathonStatus) => {
  if (status === "Upcoming") return "scheduled";
  if (status === "Completed") return "completed";
  return "live";
};

const verifyOriginAdminAccess = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, default_role, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile || profile.is_active === false) {
    return { ok: false, error: "This account cannot access Origin admin." };
  }

  const roleRows = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (roleRows.error) {
    return { ok: false, error: roleRows.error.message || "Unable to resolve role." };
  }

  const resolvedRole = normalizeDashboardRole(roleRows.data?.[0]?.role ?? profile.default_role);
  const allowed = resolvedRole === "developer_admin" || resolvedRole === "hackathon_admin";
  if (!allowed) {
    return { ok: false, error: "You do not have admin access." };
  }

  return { ok: true, error: "" };
};

/* ─── Hackathon dataset ──────────────────────────────────── */
type HackathonStatus = "Live" | "Upcoming" | "Completed";

interface HackathonCard {
  id: string;
  name: string;
  status: HackathonStatus;
  participants: number;
  deadline: string;
  poster?: string;
}

const INITIAL_EVENTS: HackathonCard[] = [
  { id: "origin-2k26", name: "Origin 2K26", status: "Upcoming", participants: 413, deadline: "10th April 10:00 am", poster: "/place to strt.jpeg" },
  { id: "buildcore-v3", name: "BuildCore v3", status: "Upcoming", participants: 0, deadline: "3rd May 11:15 am" },
  { id: "devstrike-24", name: "DevStrike '24", status: "Completed", participants: 256, deadline: "Ended" },
  { id: "codeblitz-1", name: "CodeBlitz 1.0", status: "Live", participants: 190, deadline: "9th May 4:40 pm" },
  { id: "simats-open", name: "SIMATS Open Challenge", status: "Live", participants: 275, deadline: "17th May 8:20 pm" },
  { id: "hackfest-2026", name: "HackFest 2026", status: "Upcoming", participants: 142, deadline: "26th May 2:55 pm" },
];

/* ─── Status badge colours ───────────────────────────────── */
const STATUS_STYLE: Record<HackathonStatus, { bg: string; border: string; text: string; label: string }> = {
  Live: { bg: "rgba(34,197,94,0.15)", border: "rgba(34,197,94,0.3)", text: "#4ade80", label: "LIVE" },
  Upcoming: { bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.3)", text: "#c4b5fd", label: "UPCOMING" },
  Completed: { bg: "rgba(251,191,36,0.15)", border: "rgba(251,191,36,0.3)", text: "#fbbf24", label: "COMPLETED" },
};

/* ─── Common Background ──────────────────────────────────── */
export const AdminLockedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none" style={{ background: "#050505" }}>
    <div className="absolute inset-0 grid-bg opacity-10" />
    <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#7c3aed] opacity-[0.08] rounded-full blur-[120px]" />
    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#7c3aed] opacity-[0.06] rounded-full blur-[140px]" />
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#7c3aed] opacity-[0.04] rounded-full blur-[160px]" />
  </div>
);

/* ─── Control-panel CTA ──────────────────────────────────── */
const ControlPanelBtn = ({ onClick, heroLayout = false }: { onClick: () => void, heroLayout?: boolean }) => (
  <button
    onClick={onClick}
    style={{
      width: heroLayout ? "fit-content" : "100%",
      marginTop: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.6rem",
      padding: heroLayout ? "0.8rem 2rem" : "0.6rem 1rem",
      border: "1px solid rgba(124,58,237,0.4)",
      borderRadius: "0.6rem",
      background: "#7c3aed",
      color: "#ffffff",
      fontFamily: "'Outfit', sans-serif",
      fontSize: heroLayout ? "0.9rem" : "0.78rem",
      fontWeight: 700,
      letterSpacing: "0.05em",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
      boxShadow: heroLayout ? "0 0 25px rgba(124, 58, 237, 0.5)" : "0 0 15px rgba(124, 58, 237, 0.3)",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = "#9333ea";
      (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(124, 58, 237, 0.8)";
      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = "#7c3aed";
      (e.currentTarget as HTMLButtonElement).style.boxShadow = heroLayout ? "0 0 25px rgba(124, 58, 237, 0.5)" : "0 0 15px rgba(124, 58, 237, 0.3)";
      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0px)";
    }}
  >
    ENTER CONTROL DASHBOARD
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </button>
);

/* ─── Dynamic Asymmetric Event Cards ─────────────────────── */

const HeroEventCard = ({ event, onRemove }: { event: HackathonCard; onRemove: () => void }) => {
  const nav = useNavigate();
  const sc = STATUS_STYLE[event.status];

  return (
    <motion.div
      layout
      style={{
        position: "relative",
        borderRadius: "1.5rem",
        border: "1px solid rgba(124,58,237,0.25)",
        background: "rgba(10,10,15,0.75)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "2.5rem",
        gap: "1rem",
        minHeight: "480px",
        height: "100%",
        backdropFilter: "blur(20px)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.5), inset 0 0 60px rgba(124,58,237,0.08)",
        transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.5s ease",
      }}
      whileHover={{ y: -8, boxShadow: "0 25px 60px rgba(124,58,237,0.15), inset 0 0 80px rgba(124,58,237,0.15)" }}
    >
      {event.poster && (
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${event.poster}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.35,
          }}
          animate={{ scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      )}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,8,0.95) 0%, rgba(5,5,8,0.5) 60%, rgba(124,58,237,0.15) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 20%, rgba(124,58,237,0.15), transparent 60%)" }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "1.5rem" }}>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "0.3rem 0.8rem", borderRadius: "9999px", background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", boxShadow: `0 0 15px ${sc.bg}` }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.text, marginRight: "0.4rem", animation: "pulse 2s infinite" }} />
              {sc.label}
            </span>
            <button onClick={onRemove} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#ffffff", opacity: 0.6, transition: "opacity 0.2s" }} onMouseEnter={e => e.currentTarget.style.opacity = "1"} onMouseLeave={e => e.currentTarget.style.opacity = "0.6"}>✕</button>
          </div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "clamp(2rem, 4vw, 3.5rem)", letterSpacing: "-0.03em", color: "#ffffff", lineHeight: 1.1, margin: "0 0 0.5rem", textShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
          >
            {event.name}
          </motion.h3>

          <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "1.4rem", color: "#c4b5fd", margin: "0 0 2.5rem" }}>
            Primary Operation Phase
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div style={{ display: "flex", gap: "3rem" }}>
            <div>
              <span style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "0.3rem" }}>Network Size</span>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "1.4rem", fontWeight: 700, color: "#ffffff" }}>{event.participants.toLocaleString()}</span>
            </div>
            <div>
              <span style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "0.3rem" }}>Temporal Lock</span>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.2rem", fontWeight: 600, color: "#ffffff" }}>{event.deadline}</span>
            </div>
          </div>

          <ControlPanelBtn onClick={() => nav(`/orehackproject1924/panel`)} heroLayout={true} />
        </div>
      </div>
    </motion.div>
  );
};

const SideEventCard = ({ event, onRemove }: { event: HackathonCard; onRemove: () => void }) => {
  const nav = useNavigate();
  const sc = STATUS_STYLE[event.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      style={{
        position: "relative", borderRadius: "1rem", border: "1px solid rgba(124,58,237,0.15)",
        background: "rgba(10,10,15,0.65)", overflow: "hidden", display: "flex", flexDirection: "column",
        padding: "1.25rem", gap: "0.8rem", flex: 1, backdropFilter: "blur(16px)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.5)", transition: "transform 0.4s ease, border-color 0.4s ease",
      }}
      whileHover={{ y: -4, borderColor: "rgba(124,58,237,0.4)" }}
    >
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(124,58,237,0.05) 0%, transparent 100%)" }} />
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "9999px", background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
              {sc.label}
            </span>
            <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", padding: "0", fontSize: "1rem" }}>✕</button>
          </div>
          <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "1.3rem", color: "#ffffff", margin: "0 0 0.5rem" }}>{event.name}</h4>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit', sans-serif" }}>
            <span>Nodes: <strong style={{ color: "#fff", fontFamily: "'Space Mono', monospace" }}>{event.participants}</strong></span>
            <span>Est: <strong>{event.deadline}</strong></span>
          </div>
        </div>

        <ControlPanelBtn onClick={() => nav(`/orehackproject1924/panel`)} />
      </div>
    </motion.div>
  );
};

const HorizontalEventCard = ({ event, onRemove }: { event: HackathonCard; onRemove: () => void }) => {
  const nav = useNavigate();
  const sc = STATUS_STYLE[event.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      style={{
        position: "relative", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(5,5,8,0.5)", overflow: "hidden", display: "flex", flexWrap: "wrap", alignItems: "center",
        padding: "1.25rem 1.5rem", gap: "2rem", backdropFilter: "blur(10px)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
      whileHover={{ background: "rgba(10,10,15,0.8)", borderColor: "rgba(124,58,237,0.2)" }}
    >
      <div style={{ flex: "0 0 auto" }}>
        <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "9999px", background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text, fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.15em", textTransform: "uppercase" }}>
          {sc.label}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: "200px" }}>
        <h4 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "1.2rem", color: "#ffffff", margin: "0 0 0.2rem" }}>{event.name}</h4>
        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif" }}>
          <span>Archived Nodes: <strong style={{ color: "#fff", fontFamily: "'Space Mono', monospace" }}>{event.participants}</strong></span>
          <span>Concluded: <strong>{event.deadline}</strong></span>
        </div>
      </div>

      <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={() => nav(`/orehackproject1924/panel`)} style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", color: "#c4b5fd", padding: "0.5rem 1rem", borderRadius: "0.5rem", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", transition: "all 0.2s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(124,58,237,0.3)"; e.currentTarget.style.color = "#fff"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(124,58,237,0.1)"; e.currentTarget.style.color = "#c4b5fd"; }}>
          View Data
        </button>
        <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.2)", fontSize: "1.2rem" }} onMouseEnter={e => e.currentTarget.style.color = "#f87171"} onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.2)"}>✕</button>
      </div>
    </motion.div>
  );
};


/* ─── Login Screen ───────────────────────────────────────── */
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.trim(),
      password: pass,
    });

    if (error || !data.user) {
      setErr("Invalid credentials.");
      setLoading(false);
      return;
    }

    const access = await verifyOriginAdminAccess(data.user.id);
    if (!access.ok) {
      await supabase.auth.signOut();
      setErr(access.error || "Access denied.");
      setLoading(false);
      return;
    }

    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    onLogin();
    setLoading(false);
  };

  const iStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "0.6rem",
    padding: "0.7rem 1rem",
    color: "#ffffff",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <div className="relative z-0" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", background: "#050505" }}>
      <AdminLockedBackground />
      <form onSubmit={submit} autoComplete="off" style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1, background: "rgba(10,12,18,0.8)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: "1.2rem", padding: "2.5rem", backdropFilter: "blur(20px)" }}>

        {/* ── Brand label – Outfit bold, New-Era style ── */}
        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "1rem",
          fontWeight: 800,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#7c3aed",
          marginBottom: "0.6rem",
        }}>Oregent Admin</p>

        {/* ── Authenticate heading – Instrument Serif italic, like OreHack on home ── */}
        <h1 style={{
          fontFamily: "'Instrument Serif', serif",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: "clamp(2rem, 6vw, 2.6rem)",
          letterSpacing: "-0.01em",
          color: "#ffffff",
          marginBottom: "0.4rem",
          textShadow: "0 0 40px rgba(124,58,237,0.3), 0 0 80px rgba(124,58,237,0.15)",
          lineHeight: 1.1,
        }}>Authenticate</h1>

        <p style={{
          fontFamily: "'Outfit', sans-serif",
          fontStyle: "italic",
          fontSize: "0.8rem",
          color: "rgba(255,255,255,0.45)",
          marginBottom: "1.75rem",
        }}>Sign in to access the secure control portal.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

          {/* ── Email ── */}
          <input
            type="email"
            value={user}
            onChange={e => setUser(e.target.value)}
            placeholder="admin@company.com"
            autoComplete="off"
            style={{ ...iStyle, fontFamily: "'Outfit', sans-serif" }}
          />

          {/* ── Password with eye toggle ── */}
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              style={{ ...iStyle, paddingRight: "2.8rem", fontFamily: "'Outfit', sans-serif" }}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: "absolute",
                right: "0.85rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(196,181,253,0.7)",
                display: "flex",
                alignItems: "center",
                padding: 0,
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#c4b5fd")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(196,181,253,0.7)")}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* ── Error message – sans-serif ── */}
          {err && (
            <p style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "0.78rem",
              color: "#f87171",
              margin: 0,
            }}>{err}</p>
          )}

          {/* ── Sign In button – white ── */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? "rgba(255,255,255,0.8)" : "#ffffff",
              border: "none",
              borderRadius: "0.6rem",
              padding: "0.78rem",
              color: "#0d0d14",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.06em",
              fontSize: "0.875rem",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
              textTransform: "uppercase",
              boxShadow: "0 0 24px rgba(255,255,255,0.12), 0 2px 10px rgba(0,0,0,0.35)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = "0 0 32px rgba(255,255,255,0.22), 0 4px 14px rgba(0,0,0,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 24px rgba(255,255,255,0.12), 0 2px 10px rgba(0,0,0,0.35)"; }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </div>
      </form>
    </div>
  );
};

/* ─── Main ───────────────────────────────────────────────── */
const OriginAdmin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => typeof window !== "undefined" && sessionStorage.getItem(ADMIN_SESSION_KEY) === "true"
  );
  const [authChecking, setAuthChecking] = useState(true);
  const [events, setEvents] = useState<HackathonCard[]>(INITIAL_EVENTS);
  const [formError, setFormError] = useState("");
  const [savingEvent, setSavingEvent] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  /* Add-event form state */
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<HackathonStatus>("Upcoming");
  const [newParticipants, setNewParticipants] = useState("0");
  const [newDeadline, setNewDeadline] = useState("");
  const [newPoster, setNewPoster] = useState<string | undefined>(undefined);
  const [posterFileName, setPosterFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        setIsAuthenticated(false);
        setAuthChecking(false);
        return;
      }

      const access = await verifyOriginAdminAccess(user.id);
      if (!access.ok) {
        await supabase.auth.signOut();
        clearAdminSession();
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
        setIsAuthenticated(false);
      } else {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
        setIsAuthenticated(true);
      }

      setAuthChecking(false);
    };

    void checkAuth();
  }, []);

  const logout = async () => {
    setIsAuthenticated(false);
    clearAdminSession();
    await supabase.auth.signOut();
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  };

  const handleAddEvent = async () => {
    if (!newName.trim()) return;

    setSavingEvent(true);
    setFormError("");

    const id = toSlug(newName);
    const insertRes = await supabase.from("hackathons").insert({
      name: newName.trim(),
      slug: id,
      theme: "General",
      duration_hours: 24,
      status: mapStatusToDb(newStatus),
      submissions_count: Number(newParticipants) || 0,
      evaluated_count: 0,
    });

    if (insertRes.error) {
      setFormError(insertRes.error.message || "Failed to save event to database.");
      setSavingEvent(false);
      return;
    }

    setEvents(prev => [...prev, {
      id,
      name: newName.trim(),
      status: newStatus,
      participants: Number(newParticipants) || 0,
      deadline: newDeadline.trim() || "TBD",
      poster: newPoster,
    }]);

    setNewName(""); setNewStatus("Upcoming"); setNewParticipants("0");
    setNewDeadline(""); setNewPoster(undefined); setPosterFileName("");
    setSavingEvent(false);
  };

  const handlePosterFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPosterFileName(file.name);
    setUploadingPoster(true);

    try {
      const upload = await uploadHackathonBanner({
        hackathonSlug: toSlug(newName || file.name),
        file,
      });
      setNewPoster(upload.publicUrl);
    } catch (error) {
      const reader = new FileReader();
      reader.onload = (ev) => setNewPoster(ev.target?.result as string);
      reader.readAsDataURL(file);
      setFormError(error instanceof Error ? error.message : "Banner upload failed.");
    } finally {
      setUploadingPoster(false);
    }
  };

  if (authChecking) {
    return (
      <div className="relative z-0" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#050505" }}>
        <AdminLockedBackground />
        <span style={{ position: "relative", zIndex: 1, color: "#ffffff", fontFamily: "'Outfit', sans-serif" }}>Verifying admin access...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  const iStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(124,58,237,0.2)",
    borderRadius: "0.55rem",
    padding: "0.6rem 0.9rem",
    color: "#ffffff",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "0.82rem",
    outline: "none",
    width: "100%",
  };

  /* ── Partition Active vs Completed Events ── */
  // Active = Live > Upcoming
  const activeEvents = [...events].filter(e => e.status !== "Completed").sort((a, b) => {
    if (a.status === "Live" && b.status !== "Live") return -1;
    if (a.status !== "Live" && b.status === "Live") return 1;
    return 0;
  });

  const completedEvents = events.filter(e => e.status === "Completed");

  const primaryEvent = activeEvents[0];
  const secondaryEvents = activeEvents.slice(1, 3); // take up to 2 for verticals

  return (
    <div className="relative z-0" style={{ minHeight: "100vh", padding: "2.5rem 2rem", background: "#050505" }}>
      <AdminLockedBackground />
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: "3rem", position: "relative", zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex", alignItems: "flex-start", justifyContent: "space-between",
            background: "rgba(8,8,12,0)", // completely transparent to feel more cinematic
            padding: "1rem 0",
            borderBottom: "1px solid rgba(124,58,237,0.15)"
          }}
        >
          <div>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7c3aed", marginBottom: "0.5rem" }}>
              OREGENT ADMIN
            </p>
            {/* "effect of ideation in 'control dashboard'" -> Instrument Serif, italic, purple, glowing */}
            <h1 style={{
              fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 500, color: "#7c3aed",
              lineHeight: 1, margin: "0 0 0.5rem",
              textShadow: "0 0 60px rgba(124, 58, 237, 0.45), 0 0 120px rgba(124, 58, 237, 0.2)"
            }}>
              Control Dashboard
            </h1>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontStyle: "italic", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", margin: 0 }}>
              Select a hackathon to manage its capabilities and configurations.
            </p>
          </div>
          <button
            onClick={logout}
            style={{
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "2rem",
              padding: "0.6rem 1.4rem", color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: "0.75rem",
              fontWeight: 700, letterSpacing: "0.05em", cursor: "pointer", transition: "all 0.3s ease", whiteSpace: "nowrap", marginTop: "0.25rem"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            LOGOUT
          </button>
        </motion.div>

        {/* ── Active Systems Grid ── */}
        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ marginBottom: "2rem" }}>
            {/* "effect of orehack on active systems" -> ui-serif/Georgia, italic uppercase with heavy purple glow */}
            <h2 style={{
              fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
              fontStyle: "italic", fontSize: "clamp(1.5rem, 3vw, 2.2rem)", fontWeight: 800, textTransform: "uppercase",
              color: "#ffffff", margin: 0, letterSpacing: "-0.02em",
              textShadow: "0 0 50px rgba(124, 58, 237, 0.6), 0 0 100px rgba(124, 58, 237, 0.3)"
            }}>
              Active Systems
            </h2>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontStyle: "normal", fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                // Realtime operations flow
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }} className="lg:grid-cols-[65%_1fr]">
            {/* Primary Hero Panel */}
            <div style={{ height: "100%" }}>
              {primaryEvent ? (
                <HeroEventCard event={primaryEvent} onRemove={() => setEvents(prev => prev.filter(e => e.id !== primaryEvent.id))} />
              ) : (
                <div style={{ height: "100%", minHeight: "450px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontFamily: "'Outfit', sans-serif" }}>
                  NO ACTIVE MISSIONS
                </div>
              )}
            </div>

            {/* Stacked Vertical Panels */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", height: "100%" }}>
              {secondaryEvents.map(ev => (
                <SideEventCard key={ev.id} event={ev} onRemove={() => setEvents(prev => prev.filter(e => e.id !== ev.id))} />
              ))}
              {secondaryEvents.length === 0 && (
                <div style={{ flex: 1, minHeight: "180px", border: "1px dashed rgba(255,255,255,0.05)", borderRadius: "1rem", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.1)", fontFamily: "'Outfit', sans-serif", fontSize: "0.8rem" }}>
                  AWAITING SECONDARY
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* ── Add Next Event / Admin Tools ─────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7c3aed", marginBottom: "0.85rem" }}>DEPLOY BUILD</p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.8rem",
            alignItems: "center",
            background: "rgba(10,10,15,0.6)",
            border: "1px solid rgba(124,58,237,0.15)",
            borderRadius: "1rem",
            padding: "1.25rem",
            backdropFilter: "blur(16px)",
          }}>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Event Designation" style={iStyle} />
            <select value={newStatus} onChange={e => setNewStatus(e.target.value as HackathonStatus)} style={{ ...iStyle, appearance: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)" }}>
              <option value="Upcoming">Upcoming</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>
            <input type="number" value={newParticipants} onChange={e => setNewParticipants(e.target.value)} placeholder="0" style={{ ...iStyle, textAlign: "center" }} />
            <input value={newDeadline} onChange={e => setNewDeadline(e.target.value)} placeholder="Deadline Tracker" style={iStyle} />

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem",
                background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(124,58,237,0.3)", borderRadius: "0.6rem",
                padding: "0.6rem 0.9rem", cursor: "pointer", transition: "border-color 0.2s ease", minWidth: 0,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,58,237,0.8)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(124,58,237,0.3)"}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.78rem", color: posterFileName ? "#c4b5fd" : "rgba(255,255,255,0.5)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {posterFileName || "Upload Artifact"}
                </p>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", margin: "1px 0 0" }}>16:9 ratio</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePosterFile} />
            </div>
          </div>

          {/* Commit deployment in white color on purple botton */}
          <button
            onClick={handleAddEvent}
            disabled={!newName.trim() || savingEvent}
            style={{
              marginTop: "1.5rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#7c3aed",
              border: "none",
              borderRadius: "2rem",
              padding: "0.7rem 1.8rem",
              color: "#ffffff",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              letterSpacing: "0.05em",
              fontSize: "0.85rem",
              cursor: "pointer",
              opacity: newName.trim() ? 1 : 0.45,
              transition: "all 0.3s ease",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              textTransform: "uppercase"
            }}
            onMouseEnter={e => { if (newName.trim()) { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.background = "#9333ea"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.background = "#7c3aed"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {savingEvent ? "Initializing..." : "Commit Deployment"}
          </button>
          {(uploadingPoster || formError) && (
            <p style={{ fontFamily: "'Outfit', sans-serif", marginTop: "0.65rem", fontSize: "0.75rem", color: formError ? "#f87171" : "#c4b5fd" }}>
              {formError || "Uploading payload..."}
            </p>
          )}
        </motion.section>

        {/* ── Secondary / Completed Systems horizontally ── */}
        {completedEvents.length > 0 && (
          <motion.section initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "2rem" }}>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "1.5rem" }}>
              Concluded Matrix
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.2rem" }}>
              {completedEvents.map(ev => (
                <HorizontalEventCard key={ev.id} event={ev} onRemove={() => setEvents(prev => prev.filter(e => e.id !== ev.id))} />
              ))}
            </div>
          </motion.section>
        )}

      </div>
      <style>{`
        @keyframes pulse { 0%,100%{ opacity:1; transform:scale(1); } 50%{ opacity:0.4; transform:scale(1.5); } }
      `}</style>
    </div>
  );
};

export default OriginAdmin;
