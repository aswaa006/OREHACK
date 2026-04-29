import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { clearAdminSession, normalizeDashboardRole } from "@/lib/dashboard-routing";
import { uploadHackathonBanner } from "@/lib/storage";

// Import Premium Components and CSS
import { 
  PageTransition, 
  PremiumEventCard, 
  PremiumInput, 
  PremiumButton 
} from "@/components/PremiumComponents";
import "@/styles/AdminDashboard.css"; // Ensure this is available

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

  return (
    <div style={{ minHeight: "100vh", background: "#0a0e27", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <form onSubmit={submit} autoComplete="off" style={{ width: "100%", maxWidth: 420, background: "rgba(26, 31, 58, 0.5)", border: "1px solid rgba(0, 217, 255, 0.2)", borderRadius: "16px", padding: "2.5rem", backdropFilter: "blur(16px)" }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#00d9ff", marginBottom: "0.5rem" }}>System Access</p>
        <h1 style={{ fontFamily: "Space Grotesk, sans-serif", fontSize: "1.8rem", fontWeight: 700, color: "#f5f7fa", marginBottom: "0.4rem" }}>Admin Gateway</h1>
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: "0.8rem", color: "#a0aec0", marginBottom: "1.5rem" }}>Sign in to access the control panel.</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <PremiumInput label="Email Address" type="email" value={user} onChange={e => setUser(e.target.value)} placeholder="admin@domain.com" icon="✉" />
          <PremiumInput label="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" icon="🔒" />
          
          {err && <p style={{ fontSize: "0.78rem", color: "#ff006e", margin: "0.2rem 0" }}>{err}</p>}
          
          <div style={{ marginTop: "0.5rem" }}>
            <PremiumButton type="submit" variant="primary" isLoading={loading} disabled={loading} size="lg">
              Authenticate
            </PremiumButton>
          </div>
        </div>
      </form>
    </div>
  );
};

/* ─── Main ───────────────────────────────────────────────── */
const OriginAdmin = () => {
  const navigate = useNavigate();
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
      const reader = new FileReader();
      reader.onload = (ev) => setNewPoster(ev.target?.result as string);
      reader.readAsDataURL(file);
      setFormError(error instanceof Error ? error.message : "Banner upload failed.");
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleEnterPanel = (eventId: string) => {
    navigate(`/orehackproject1924/panel`);
  };

  if (authChecking) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0e27", display: "flex", alignItems: "center", justifyContent: "center", color: "#f5f7fa", fontFamily: "Space Grotesk" }}>
        <div className="button-spinner" style={{ marginRight: 10 }}></div> Verifying admin access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="admin-dashboard-container" style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)", padding: "2.5rem 2rem" }}>
      <PageTransition className="admin-content-wrapper" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column" }}>
        
        {/* ── Header ── */}
        <div className="dashboard-header" style={{ marginBottom: "2rem" }}>
          <div className="header-content">
            <h1 style={{ marginBottom: "0.2rem" }}>Admin Dashboard</h1>
            <p>Select a hackathon to manage its details and submissions.</p>
          </div>
          <PremiumButton variant="danger" size="md" onClick={logout} icon="⏏">
            Logout
          </PremiumButton>
        </div>

        {/* ── Managed Events section ── */}
        <section className="managed-events-section" style={{ padding: "0", background: "transparent", border: "none", margin: "0 0 2.5rem 0" }}>
          <div className="section-header" style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.3rem" }}>Managed Events</h2>
            <p>Events displayed on the main landing page.</p>
          </div>

          <div className="events-grid" style={{ padding: 0 }}>
            <AnimatePresence>
              {events.map(ev => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  layout
                >
                  <PremiumEventCard
                    event={ev}
                    onEnterPanel={handleEnterPanel}
                  />
                  <button 
                    onClick={() => setEvents(prev => prev.filter(e => e.id !== ev.id))}
                    style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, background: 'rgba(0,0,0,0.4)', borderRadius: '50%', width: 24, height: 24, border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Add Next Event ─────────────────────────────── */}
        <section className="add-event-section">
          <h3 style={{ fontSize: "14px", letterSpacing: "1px", opacity: 0.8, marginBottom: "1rem" }}>ADD NEXT EVENT</h3>
          
          <form className="add-event-form" onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} style={{ maxWidth: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
              <PremiumInput
                label="Event Name"
                placeholder="e.g., CodeBlitz 2.0"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                icon="✍"
              />

              <div className="premium-input-wrapper">
                <label className="input-label">Status</label>
                <div className="input-container">
                  <select
                    className="premium-select"
                    style={{ width: '100%' }}
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as HackathonStatus)}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Live">Live</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <PremiumInput
                label="Participants"
                placeholder="0"
                type="number"
                value={newParticipants}
                onChange={e => setNewParticipants(e.target.value)}
                icon="👥"
              />

              <PremiumInput
                label="Deadline"
                placeholder="e.g., 10th May"
                value={newDeadline}
                onChange={e => setNewDeadline(e.target.value)}
                icon="📅"
              />

              <div className="premium-input-wrapper">
                <label className="input-label">Poster Banner</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "rgba(26, 31, 58, 0.5)",
                    border: "2px dashed var(--border-color)",
                    borderRadius: "var(--radius-md)",
                    padding: "var(--sp-md) var(--sp-lg)",
                    cursor: "pointer",
                    height: '46px',
                    transition: "all var(--transition-base)",
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-cyan)"}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)"}
                >
                  <span style={{ fontSize: "14px", color: posterFileName ? "var(--accent-cyan)" : "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                    {posterFileName || "Recommend 16:9 ratio"}
                  </span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "16px", marginLeft: "10px" }}>🖼</span>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePosterFile} />
                </div>
              </div>
            </div>

            <div className="form-actions" style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <PremiumButton 
                variant="success" 
                icon="✨" 
                onClick={handleAddEvent}
                disabled={!newName.trim() || savingEvent}
                isLoading={savingEvent || uploadingPoster}
              >
                + Add Event
              </PremiumButton>
              
              {(uploadingPoster || formError) && (
                <span style={{ fontSize: "12px", color: formError ? "var(--accent-magenta)" : "var(--accent-cyan)" }}>
                  {formError || "Uploading banner to storage..."}
                </span>
              )}
            </div>
          </form>
        </section>

      </PageTransition>
    </div>
  );
};

export default OriginAdmin;
