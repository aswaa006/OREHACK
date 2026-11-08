import { useEffect, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar, ChevronRight, Layers, Plus, Rocket,
  Trophy, Users, X, Building2, Clock
} from "lucide-react";

type Hackathon = {
  id: string;
  name: string;
  slug: string;
  theme: string | null;
  institution: string | null;
  status: string | null;
  start_time: string | null;
  duration_hours: number | null;
  total_submissions: number | null;
};

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

export default function EventsAdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    name: "", slug: "", theme: "", institution: "",
    startDate: "", durationHours: "36",
  });

  const computedSlug = form.slug ? slugify(form.slug) : slugify(form.name);

  const fetchHackathons = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("hackathons")
      .select("id, name, slug, theme, institution, status, start_time, duration_hours, total_submissions")
      .order("created_at", { ascending: false });
    if (data) setHackathons(data as Hackathon[]);
    setLoading(false);
  };

  useEffect(() => { fetchHackathons(); }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreating(true);
    const slug = computedSlug || "new-hackathon";
    const { error } = await supabase.from("hackathons").insert({
      name: form.name.trim(),
      slug,
      theme: form.theme.trim() || "General",
      institution: form.institution.trim() || null,
      start_time: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
      duration_hours: Number(form.durationHours || 24),
      status: "live",
      total_submissions: 0,
      total_evaluated: 0,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event Created!", description: `"${form.name}" is now live.` });
      setShowCreate(false);
      setForm({ name: "", slug: "", theme: "", institution: "", startDate: "", durationHours: "36" });
      await fetchHackathons();
    }
    setCreating(false);
  };

  const statusColor = (status: string | null) => {
    if (status === "live") return "bg-emerald-500/15 text-emerald-400";
    if (status === "ended") return "bg-muted/60 text-muted-foreground";
    return "bg-amber-500/15 text-amber-400";
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-primary/20 via-cyan-500/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-gradient-to-tl from-violet-500/15 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Layers className="w-8 h-8 text-primary" />
              Event Manager
            </h1>
            <p className="text-muted-foreground mt-1">Create and manage hackathon events. Click an event to manage scores.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin/hackathon" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back
            </Link>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Event
            </motion.button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Events", value: hackathons.length, icon: Layers, color: "text-cyan-400" },
            { label: "Live Now", value: hackathons.filter(h => h.status === "live").length, icon: Rocket, color: "text-emerald-400" },
            { label: "Total Submissions", value: hackathons.reduce((a, h) => a + (h.total_submissions || 0), 0), icon: Users, color: "text-violet-400" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-5 flex items-center gap-4"
            >
              <div className="rounded-xl bg-muted/50 p-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : hackathons.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No events yet. Create your first hackathon!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hackathons.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/admin/events/${h.slug}`)}
                className="group cursor-pointer rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm p-6 hover:border-primary/40 hover:bg-card/80 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{h.name}</h3>
                    {h.institution && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" />
                        {h.institution}
                      </p>
                    )}
                  </div>
                  <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColor(h.status)}`}>
                    {h.status || "draft"}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                  {h.theme && (
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5" />
                      {h.theme}
                    </div>
                  )}
                  {h.start_time && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(h.start_time).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </div>
                  )}
                  {h.duration_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {h.duration_hours}h duration
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {h.total_submissions ?? 0} submissions
                  </span>
                  <span className="text-primary flex items-center gap-1 text-xs font-medium group-hover:translate-x-1 transition-transform">
                    Manage Scores <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Drawer */}
      <AnimatePresence>
        {showCreate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-background border-l border-border/60 shadow-2xl overflow-y-auto"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Create New Event</h2>
                  <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreate} className="space-y-4">
                  {[
                    { label: "Event Name *", key: "name", placeholder: "Origin Hackathon 2026", required: true },
                    { label: "Institution / Organization", key: "institution", placeholder: "MIT Chennai" },
                    { label: "Theme", key: "theme", placeholder: "AI + Web + Product" },
                    { label: "Slug (URL key)", key: "slug", placeholder: "origin-2026 (auto-generated)" },
                  ].map(({ label, key, placeholder, required }) => (
                    <label key={key} className="block space-y-1.5">
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      <input
                        required={required}
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
                      />
                      {key === "slug" && (
                        <p className="text-xs text-muted-foreground">URL: /admin/events/{computedSlug || "your-slug"}</p>
                      )}
                    </label>
                  ))}

                  <div className="grid grid-cols-2 gap-4">
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-foreground">Start Date</span>
                      <input
                        type="datetime-local"
                        value={form.startDate}
                        onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                        className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
                      />
                    </label>
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium text-foreground">Duration (hrs)</span>
                      <input
                        type="number" min={1}
                        value={form.durationHours}
                        onChange={e => setForm(p => ({ ...p, durationHours: e.target.value }))}
                        className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
                      />
                    </label>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreate(false)}
                      className="flex-1 rounded-lg border border-border/70 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={creating}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      <Rocket className="w-4 h-4" />
                      {creating ? "Creating..." : "Create & Go Live"}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
