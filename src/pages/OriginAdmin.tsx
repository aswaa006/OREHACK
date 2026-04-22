import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { clearAdminSession, normalizeDashboardRole } from "@/lib/dashboard-routing";
import { uploadHackathonBanner } from "@/lib/storage";

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

/* ─── Hackathon dataset (mirrors ActiveHackathons.tsx) ───── */
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
  { id: "origin-2k26",    name: "Origin 2K26",            status: "Completed", participants: 413, deadline: "10th April 10:00 am", poster: "/place to strt.jpeg" },
  { id: "buildcore-v3",   name: "BuildCore v3",            status: "Upcoming",  participants: 0,   deadline: "3rd May 11:15 am" },
  { id: "devstrike-24",   name: "DevStrike '24",           status: "Completed", participants: 256, deadline: "Ended" },
  { id: "codeblitz-1",    name: "CodeBlitz 1.0",           status: "Upcoming",  participants: 190, deadline: "9th May 4:40 pm" },
  { id: "simats-open",    name: "SIMATS Open Challenge",   status: "Live",      participants: 275, deadline: "17th May 8:20 pm" },
  { id: "hackfest-2026",  name: "HackFest 2026",           status: "Upcoming",  participants: 142, deadline: "26th May 2:55 pm" },
];

/* ─── Status badge colours ───────────────────────────────── */
const STATUS_STYLE: Record<HackathonStatus, { bg: string; text: string; label: string }> = {
  Live:      { bg: "rgba(34,197,94,0.18)",  text: "#4ade80", label: "LIVE"      },
  Upcoming:  { bg: "rgba(99,102,241,0.18)", text: "#818cf8", label: "UPCOMING"  },
  Completed: { bg: "rgba(251,191,36,0.15)", text: "#fbbf24", label: "COMPLETED" },
};

/* ─── Control-panel CTA ──────────────────────────────────── */
const ControlPanelBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      width: "100%",
      marginTop: "auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.4rem",
      padding: "0.55rem 1rem",
      border: "1px solid rgba(139,92,246,0.5)",
      borderRadius: "0.5rem",
      background: "rgba(139,92,246,0.08)",
      color: "#a78bfa",
      fontSize: "0.78rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.25s ease",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.22)";
      (e.currentTarget as HTMLButtonElement).style.color = "#c4b5fd";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLButtonElement).style.background = "rgba(139,92,246,0.08)";
      (e.currentTarget as HTMLButtonElement).style.color = "#a78bfa";
    }}
  >
    Enter Control Panel
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  </button>
);

/* ─── Hackathon card ─────────────────────────────────────── */
const EventCard = ({
  event,
  onRemove,
}: {
  event: HackathonCard;
  onRemove: () => void;
}) => {
  const nav = useNavigate();
  const sc = STATUS_STYLE[event.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      style={{
        position: "relative",
        borderRadius: "0.85rem",
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(15,18,30,0.85)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "1rem",
        gap: "0.6rem",
        minHeight: "190px",
      }}
    >
      {/* Poster background */}
      {event.poster && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('${event.poster}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.35,
          }}
        />
      )}
      {/* Dark overlay */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(8,10,20,0.55) 0%, rgba(8,10,20,0.85) 100%)" }} />

      {/* Card content */}
      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%", gap: "0.55rem" }}>
        {/* Top row: name + X */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f1f5f9", lineHeight: 1.3, flex: 1 }}>{event.name}</span>
          <button
            onClick={onRemove}
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.35)", padding: "0 0 0 4px", lineHeight: 1, fontSize: "1rem", flexShrink: 0 }}
            aria-label="Remove event"
          >
            ✕
          </button>
        </div>

        {/* Status badge */}
        <div>
          <span style={{ display: "inline-block", padding: "0.18rem 0.6rem", borderRadius: "9999px", background: sc.bg, color: sc.text, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em" }}>
            {sc.label}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)" }}>Participants:</span>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{event.participants.toLocaleString()}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)" }}>Deadline:</span>
          <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{event.deadline}</span>
        </div>

        {/* CTA */}
        <ControlPanelBtn onClick={() => nav(`/orehackproject1924/panel`)} />
      </div>
    </motion.div>
  );
};

/* ─── Login Screen ───────────────────────────────────────── */
const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");
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
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "0.6rem",
    padding: "0.65rem 1rem",
    color: "#f1f5f9",
    fontSize: "0.875rem",
    outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <form onSubmit={submit} autoComplete="off" style={{ width: "100%", maxWidth: 420, background: "rgba(15,18,30,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "1.2rem", padding: "2.5rem" }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a78bfa", marginBottom: "0.5rem" }}>Oregent Admin</p>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#f1f5f9", marginBottom: "0.4rem" }}>Admin Dashboard</h1>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: "1.5rem" }}>Sign in to access the admin panel.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input type="email" value={user} onChange={e => setUser(e.target.value)} placeholder="admin@company.com" autoComplete="off" style={iStyle} />
          <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="Password" autoComplete="new-password" style={iStyle} />
          {err && <p style={{ fontSize: "0.78rem", color: "#f87171" }}>{err}</p>}
          <button type="submit" disabled={loading} style={{ background: "#7c3aed", border: "none", borderRadius: "0.6rem", padding: "0.7rem", color: "#fff", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", opacity: loading ? 0.7 : 1 }}> {loading ? "Signing in..." : "Sign In"}</button>
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
  const [newName,         setNewName]         = useState("");
  const [newStatus,       setNewStatus]       = useState<HackathonStatus>("Upcoming");
  const [newParticipants, setNewParticipants] = useState("0");
  const [newDeadline,     setNewDeadline]     = useState("");
  const [newPoster,       setNewPoster]       = useState<string | undefined>(undefined);
  const [posterFileName,  setPosterFileName]  = useState("");
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
      // Keep local preview fallback when storage is unavailable.
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
      <div style={{ minHeight: "100vh", background: "#080b14", display: "flex", alignItems: "center", justifyContent: "center", color: "#f1f5f9" }}>
        Verifying admin access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  /* ── shared input style ── */
  const iStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "0.55rem",
    padding: "0.6rem 0.9rem",
    color: "#f1f5f9",
    fontSize: "0.82rem",
    outline: "none",
    width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080b14", color: "#f1f5f9", fontFamily: "'Inter', system-ui, sans-serif", padding: "2.5rem 2rem" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            background: "rgba(15,18,30,0.7)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "1rem",
            padding: "1.6rem 2rem",
            backdropFilter: "blur(16px)",
          }}
        >
          <div>
            <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a78bfa", marginBottom: "0.35rem" }}>Oregent Admin</p>
            <h1 style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.02em", margin: "0 0 0.35rem" }}>Admin Dashboard</h1>
            <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.38)", margin: 0 }}>Select a hackathon to manage its details and submissions.</p>
          </div>
          <button
            onClick={logout}
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "0.5rem", padding: "0.4rem 1.1rem", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s ease", whiteSpace: "nowrap", marginTop: "0.25rem" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.3)"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"; }}
          >
            Logout
          </button>
        </motion.div>

        {/* ── Managed Events section ── */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <p style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.2rem" }}>Managed Events</p>
          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginBottom: "1.1rem" }}>Events displayed on the main landing page.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            <AnimatePresence>
              {events.map(ev => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  onRemove={() => setEvents(prev => prev.filter(e => e.id !== ev.id))}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* ── Add Next Event ─────────────────────────────── */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "0.85rem" }}>Add Next Event</p>

          {/* Form row */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 0.7fr 1.5fr 1.2fr",
            gap: "0.65rem",
            alignItems: "center",
            background: "rgba(15,18,30,0.6)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: "0.85rem",
            padding: "1rem 1.1rem",
          }}>
            {/* Event Name */}
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Event Name"
              style={iStyle}
            />

            {/* Status */}
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as HackathonStatus)}
              style={{ ...iStyle, appearance: "none", cursor: "pointer" }}
            >
              <option value="Upcoming">Upcoming</option>
              <option value="Live">Live</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Participants */}
            <input
              type="number"
              value={newParticipants}
              onChange={e => setNewParticipants(e.target.value)}
              placeholder="0"
              style={{ ...iStyle, textAlign: "center" }}
            />

            {/* Deadline */}
            <input
              value={newDeadline}
              onChange={e => setNewDeadline(e.target.value)}
              placeholder="Deadline (e.g. 10th May)"
              style={iStyle}
            />

            {/* Upload Banner */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem",
                background: "rgba(255,255,255,0.04)",
                border: "1px dashed rgba(255,255,255,0.18)",
                borderRadius: "0.55rem",
                padding: "0.6rem 0.9rem",
                cursor: "pointer",
                transition: "border-color 0.2s ease",
                minWidth: 0,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(167,139,250,0.55)"}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.18)"}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "0.78rem", color: posterFileName ? "#c4b5fd" : "rgba(255,255,255,0.5)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {posterFileName || "Upload Banner"}
                </p>
                <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.25)", margin: "1px 0 0" }}>Recommend 16:9 ratio</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePosterFile} />
            </div>
          </div>

          {/* Add Event Button */}
          <button
            onClick={handleAddEvent}
            disabled={!newName.trim() || savingEvent}
            style={{
              marginTop: "0.75rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "linear-gradient(135deg, #059669, #10b981)",
              border: "none",
              borderRadius: "0.6rem",
              padding: "0.65rem 1.5rem",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              opacity: newName.trim() ? 1 : 0.45,
              transition: "all 0.2s ease",
              boxShadow: "0 4px 18px rgba(16,185,129,0.28)",
            }}
            onMouseEnter={e => { if (newName.trim()) (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 24px rgba(16,185,129,0.45)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 18px rgba(16,185,129,0.28)"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            {savingEvent ? "Saving..." : "+ Add Event"}
          </button>
          {(uploadingPoster || formError) && (
            <p style={{ marginTop: "0.65rem", fontSize: "0.72rem", color: formError ? "#f87171" : "#a78bfa" }}>
              {formError || "Uploading banner to storage..."}
            </p>
          )}
        </motion.section>

      </div>
    </div>
  );
};

export default OriginAdmin;
