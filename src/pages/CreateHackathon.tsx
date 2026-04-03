import { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Rocket, Sparkles, Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";

type HackathonFormState = {
  name: string;
  slug: string;
  theme: string;
  startDate: string;
  durationHours: string;
};

const defaultState: HackathonFormState = {
  name: "",
  slug: "",
  theme: "AI + Web + Product",
  startDate: "",
  durationHours: "36",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const CreateHackathon = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<HackathonFormState>(defaultState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const computedSlug = useMemo(() => (form.slug ? slugify(form.slug) : slugify(form.name)), [form.name, form.slug]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    setError("");
    setLoading(true);

    const liveSlug = computedSlug || "live-hackathon";

    const { error: insertError } = await supabase.from("hackathons").insert({
      name: form.name.trim(),
      slug: liveSlug,
      theme: form.theme.trim() || "General",
      start_date: form.startDate || null,
      duration_hours: Number(form.durationHours || 24),
      status: "live",
      submissions: 0,
      evaluated: 0,
    });

    if (insertError) {
      setLoading(false);
      setError(insertError.message || "Unable to create hackathon.");
      return;
    }

    // Auto-redirect to the live hackathon entry flow.
    navigate(`/hackathon/${liveSlug}/login`, {
      replace: true,
      state: { created: true, hackathonName: form.name.trim() },
    });

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 grid-bg opacity-25" />
      <motion.div
        className="absolute -top-16 -left-20 h-[24rem] w-[24rem] rounded-full bg-gradient-to-br from-primary/25 via-cyan-400/15 to-transparent blur-3xl"
        animate={{ x: [0, 18, -12, 0], y: [0, 14, -8, 0], opacity: [0.2, 0.32, 0.2] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <main className="relative z-10 container mx-auto px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New Hackathon</h1>
              <p className="mt-1 text-sm text-muted-foreground">Launch a new event and auto-start it in live mode.</p>
            </div>
            <Link to="/admin/hackathon" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              ← Back to Admin
            </Link>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            onSubmit={handleSubmit}
            className="surface-elevated rounded-2xl border border-border/70 p-6 shadow-lg shadow-black/20"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs font-medium text-muted-foreground">Hackathon Name</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Example: Oregent Origin 2026"
                  className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Slug (URL)</span>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="origin-2k26"
                  className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
                />
                <p className="text-xs text-muted-foreground">Live URL: /hackathon/{computedSlug || "your-slug"}/login</p>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Theme</span>
                <input
                  value={form.theme}
                  onChange={(e) => setForm((prev) => ({ ...prev, theme: e.target.value }))}
                  className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Start Date</span>
                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">Duration (Hours)</span>
                <input
                  type="number"
                  min={1}
                  value={form.durationHours}
                  onChange={(e) => setForm((prev) => ({ ...prev, durationHours: e.target.value }))}
                  className="w-full rounded-lg border border-border/70 bg-card/70 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/50"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-3 rounded-xl border border-border/70 bg-card/60 p-4 text-xs text-muted-foreground md:grid-cols-3">
              <div className="flex items-center gap-2">
                <Rocket className="h-4 w-4 text-cyan-400" />
                Auto launch live route
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Metadata saved locally
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-400" />
                Ready for submissions
              </div>
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <Link to="/admin/hackathon" className="rounded-lg border border-border/70 px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Cancel
              </Link>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles className="h-4 w-4" />
                {loading ? "Creating..." : "Create & Go Live"}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </main>
    </div>
  );
};

export default CreateHackathon;
