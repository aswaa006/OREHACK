import { useEffect, useState, useCallback, useRef, ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Download, Upload, ChevronDown, ChevronUp,
  Save, X, Search, CheckCircle2, AlertCircle,
  FileSpreadsheet, Users, Trophy, TrendingUp, Loader2
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Participant = {
  id: string;
  team_id: string;
  team_name: string | null;
  leader_name: string | null;
  leader_phone: string | null;
  problem_statement: string | null;
  repository_url: string | null;
  progress: string | null;
  final_score: number | null;
  technical_score: number | null;
  innovation_score: number | null;
  completeness_score: number | null;
  reasoning: string | null;
  status: string | null;
  password: string | null;
};

type CsvRow = {
  teamID: string;
  Team_Name: string;
  Problem_Statement: string;
  Repo_URL: string;
  Progress: string;
  Total_Score: string;
  Tech_Score: string;
  Innov_Score: string;
  Completeness: string;
  Reasoning: string;
  password: string;
};

type UploadResult = { teamID: string; status: "ok" | "error"; message: string };

// ─── CSV Helpers ─────────────────────────────────────────────────────────────

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split("\n").map(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
    return obj as unknown as CsvRow;
  });
}

function buildCsvContent(participants: Participant[]): string {
  const headers = ["teamID", "Team_Name", "Problem_Statement", "Repo_URL", "Progress", "Total_Score", "Tech_Score", "Innov_Score", "Completeness", "Reasoning", "password"];
  const rows = participants.map(p => [
    p.team_id,
    p.team_name ?? "",
    p.problem_statement ?? "",
    p.repository_url ?? "",
    p.progress ?? "",
    p.final_score ?? "",
    p.technical_score ?? "",
    p.innovation_score ?? "",
    p.completeness_score ?? "",
    p.reasoning ?? "",
    p.password ?? "",
  ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
  return [headers.join(","), ...rows].join("\n");
}

function downloadBlob(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EventScoreManager() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();

  const [hackathonName, setHackathonName] = useState(slug ?? "");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"participants" | "upload">("participants");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Per-row edit state
  const [editMap, setEditMap] = useState<Record<string, Partial<Participant>>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // CSV Upload state
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvPreview, setCsvPreview] = useState<CsvRow[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);

  // ── Fetch participants ──
  const fetchParticipants = useCallback(async () => {
    if (!slug) return;
    setLoading(true);

    // Get hackathon name
    const { data: h } = await supabase
      .from("hackathons").select("name").eq("slug", slug).single();
    if (h?.name) setHackathonName(h.name);

    // Get submissions for this hackathon
    const { data: subs } = await supabase
      .from("submissions")
      .select("id, team_id, team_name, repository_url, problem_statement, progress, reasoning, final_score, technical_score, innovation_score, completeness_score, status, submitted_at")
      .eq("hackathon_slug", slug)
      .order("submitted_at", { ascending: false });

    if (!subs) { setLoading(false); return; }

    // Get team info
    const teamIds = [...new Set(subs.map(s => s.team_id).filter(Boolean))];
    const teamMap = new Map<string, { leader_name: string | null; leader_phone: string | null; password: string | null }>();

    if (teamIds.length) {
      const { data: teams } = await supabase
        .from("teams")
        .select("id, leader_name, leader_phone, password")
        .in("id", teamIds);
      (teams ?? []).forEach((t: { id: string; leader_name: string | null; leader_phone: string | null; password: string | null }) => teamMap.set(t.id, t));
    }

    setParticipants(subs.map(s => {
      const t = teamMap.get(s.team_id);
      return {
        id: s.id,
        team_id: s.team_id,
        team_name: s.team_name,
        leader_name: t?.leader_name ?? null,
        leader_phone: t?.leader_phone ?? null,
        problem_statement: s.problem_statement,
        repository_url: s.repository_url,
        progress: s.progress ?? null,
        final_score: s.final_score,
        technical_score: s.technical_score,
        innovation_score: s.innovation_score,
        completeness_score: s.completeness_score,
        reasoning: s.reasoning ?? null,
        status: s.status,
        password: t?.password ?? null,
      };
    }));
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    fetchParticipants();
    // Realtime subscription
    const channel = supabase.channel(`event-scores-${slug}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, fetchParticipants)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchParticipants, slug]);

  // ── Inline save ──
  const handleSave = async (id: string) => {
    const edits = editMap[id];
    if (!edits) return;
    setSavingId(id);

    // Calculate total if sub-scores present
    const tech = edits.technical_score !== undefined ? edits.technical_score : participants.find(p => p.id === id)?.technical_score ?? null;
    const innov = edits.innovation_score !== undefined ? edits.innovation_score : participants.find(p => p.id === id)?.innovation_score ?? null;
    const comp = edits.completeness_score !== undefined ? edits.completeness_score : participants.find(p => p.id === id)?.completeness_score ?? null;
    const total = (tech ?? 0) + (innov ?? 0) + (comp ?? 0) || edits.final_score;

    const { error } = await supabase.from("submissions").update({
      ...edits,
      final_score: total,
      status: "evaluated",
    }).eq("id", id);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved!", description: "Scores updated successfully." });
      setEditMap(p => { const n = { ...p }; delete n[id]; return n; });
      setParticipants(prev => prev.map(p => p.id === id ? { ...p, ...edits, final_score: total as number | null, status: "evaluated" } : p));
    }
    setSavingId(null);
  };

  // ── CSV Upload ──
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    setUploadResults([]);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      setCsvPreview(parseCsv(text));
    };
    reader.readAsText(file);
  };

  const handleApplyCsv = async () => {
    if (!csvPreview.length) return;
    setUploading(true);
    const results: UploadResult[] = [];

    for (const row of csvPreview) {
      if (!row.teamID) continue;

      // Find matching submission by team_id
      const { data: existing } = await supabase
        .from("submissions")
        .select("id")
        .eq("team_id", row.teamID)
        .eq("hackathon_slug", slug)
        .maybeSingle();

      const payload = {
        team_name: row.Team_Name || null,
        problem_statement: row.Problem_Statement || null,
        repository_url: row.Repo_URL || null,
        progress: row.Progress || null,
        technical_score: row.Tech_Score ? Number(row.Tech_Score) : null,
        innovation_score: row.Innov_Score ? Number(row.Innov_Score) : null,
        completeness_score: row.Completeness ? Number(row.Completeness) : null,
        final_score: row.Total_Score ? Number(row.Total_Score) : null,
        reasoning: row.Reasoning || null,
        status: "evaluated",
      };

      if (existing) {
        const { error } = await supabase.from("submissions").update(payload).eq("id", existing.id);
        results.push({ teamID: row.teamID, status: error ? "error" : "ok", message: error?.message ?? "Updated" });
      } else {
        const { error } = await supabase.from("submissions").insert({
          ...payload,
          team_id: row.teamID,
          hackathon_slug: slug,
        });
        results.push({ teamID: row.teamID, status: error ? "error" : "ok", message: error?.message ?? "Inserted" });
      }
    }

    setUploadResults(results);
    setUploading(false);
    const okCount = results.filter(r => r.status === "ok").length;
    toast({ title: `CSV Applied`, description: `${okCount}/${results.length} rows processed.` });
    fetchParticipants();
  };

  // ── Download ──
  const handleDownload = () => {
    const csv = buildCsvContent(participants);
    downloadBlob(csv, `${slug}-participants.csv`);
  };

  // ── Derived ──
  const filtered = participants.filter(p =>
    !search ||
    p.team_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.team_id?.toLowerCase().includes(search.toLowerCase()) ||
    p.leader_name?.toLowerCase().includes(search.toLowerCase())
  );

  const avgScore = participants.length
    ? (participants.reduce((s, p) => s + (p.final_score ?? 0), 0) / participants.length).toFixed(1)
    : "0.0";

  const evaluated = participants.filter(p => p.status === "evaluated").length;

  // ── Field helper ──
  const field = (id: string, key: keyof Participant) =>
    (editMap[id]?.[key] ?? participants.find(p => p.id === id)?.[key]) as string | number | null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 h-96 w-96 rounded-full bg-gradient-to-bl from-primary/15 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Link to="/admin/events" className="hover:text-foreground transition-colors">← Events</Link>
              <span>/</span>
              <span className="text-foreground font-medium">{hackathonName}</span>
            </div>
            <h1 className="text-2xl font-bold">Score Manager</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleDownload}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </motion.button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Teams", value: participants.length, icon: Users, color: "text-cyan-400" },
            { label: "Evaluated", value: evaluated, icon: CheckCircle2, color: "text-emerald-400" },
            { label: "Pending", value: participants.length - evaluated, icon: AlertCircle, color: "text-amber-400" },
            { label: "Avg Score", value: avgScore, icon: TrendingUp, color: "text-violet-400" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border/60 bg-card/60 p-4 flex items-center gap-3"
            >
              <div className="rounded-xl bg-muted/50 p-2.5"><s.icon className={`w-4 h-4 ${s.color}`} /></div>
              <div>
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border/60">
          {(["participants", "upload"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium capitalize rounded-t-lg transition-colors ${
                tab === t ? "bg-card border border-b-0 border-border/60 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "participants" ? <><Users className="w-3.5 h-3.5 inline mr-1.5" />Participants</> : <><Upload className="w-3.5 h-3.5 inline mr-1.5" />Upload Scores CSV</>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "participants" && (
            <motion.div key="participants" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {/* Search */}
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search team name, ID, leader…"
                  className="w-full rounded-xl border border-border/60 bg-card/60 pl-9 pr-4 py-2 text-sm outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Table */}
              {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-2xl border border-border/60 overflow-hidden bg-card/40">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                      <thead>
                        <tr className="border-b border-border/60 bg-card/60 text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-3 w-8 text-center">▼</th>
                          <th className="px-4 py-3 text-left">Team ID</th>
                          <th className="px-4 py-3 text-left">Team Name</th>
                          <th className="px-4 py-3 text-left">Leader</th>
                          <th className="px-4 py-3 text-center">Tech</th>
                          <th className="px-4 py-3 text-center">Innov</th>
                          <th className="px-4 py-3 text-center">Complete</th>
                          <th className="px-4 py-3 text-center font-bold text-foreground">Total</th>
                          <th className="px-4 py-3 text-center">Status</th>
                          <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((p, idx) => {
                          const isOpen = expandedId === p.id;
                          const hasEdits = Boolean(editMap[p.id]);
                          return (
                            <>
                              <tr
                                key={p.id}
                                onClick={() => setExpandedId(isOpen ? null : p.id)}
                                className={`border-b border-border/40 cursor-pointer transition-colors hover:bg-card/60 ${idx % 2 === 0 ? "bg-background/30" : ""}`}
                              >
                                <td className="px-4 py-3 text-center">
                                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="inline-block text-muted-foreground">
                                    <ChevronDown className="w-4 h-4" />
                                  </motion.span>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.team_id}</td>
                                <td className="px-4 py-3 font-medium">{p.team_name ?? "—"}</td>
                                <td className="px-4 py-3 text-muted-foreground">{p.leader_name ?? "—"}</td>
                                <td className="px-4 py-3 text-center">{p.technical_score ?? "—"}</td>
                                <td className="px-4 py-3 text-center">{p.innovation_score ?? "—"}</td>
                                <td className="px-4 py-3 text-center">{p.completeness_score ?? "—"}</td>
                                <td className="px-4 py-3 text-center font-bold text-primary">{p.final_score ?? "—"}</td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    p.status === "evaluated" ? "bg-emerald-500/15 text-emerald-400" :
                                    p.status === "rejected" ? "bg-rose-500/15 text-rose-400" :
                                    "bg-amber-500/15 text-amber-400"
                                  }`}>{p.status ?? "queued"}</span>
                                </td>
                                <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                  {hasEdits && (
                                    <motion.button
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleSave(p.id)}
                                      disabled={savingId === p.id}
                                      className="flex items-center gap-1 mx-auto rounded-lg bg-primary/10 border border-primary/30 px-3 py-1 text-xs text-primary hover:bg-primary/20 disabled:opacity-50 transition-colors"
                                    >
                                      {savingId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                      Save
                                    </motion.button>
                                  )}
                                </td>
                              </tr>

                              {/* Expanded Edit Row */}
                              <AnimatePresence>
                                {isOpen && (
                                  <motion.tr
                                    key={`expand-${p.id}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  >
                                    <td colSpan={10} className="bg-card/80 border-b border-border/40 px-6 py-5">
                                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        {/* Team Info */}
                                        <div className="space-y-3">
                                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team Info</h4>
                                          {[
                                            { label: "Leader Phone", key: "leader_phone" },
                                            { label: "Repository URL", key: "repository_url" },
                                            { label: "Progress", key: "progress" },
                                          ].map(({ label, key }) => (
                                            <div key={key}>
                                              <p className="text-xs text-muted-foreground mb-1">{label}</p>
                                              <input
                                                value={String(field(p.id, key as keyof Participant) ?? "")}
                                                onChange={e => setEditMap(prev => ({
                                                  ...prev,
                                                  [p.id]: { ...prev[p.id], [key]: e.target.value || null }
                                                }))}
                                                onClick={e => e.stopPropagation()}
                                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none focus:border-primary/50"
                                              />
                                            </div>
                                          ))}
                                        </div>

                                        {/* Scores */}
                                        <div className="space-y-3">
                                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scores</h4>
                                          {[
                                            { label: "Tech Score", key: "technical_score" },
                                            { label: "Innovation Score", key: "innovation_score" },
                                            { label: "Completeness", key: "completeness_score" },
                                            { label: "Total Score (auto)", key: "final_score" },
                                          ].map(({ label, key }) => (
                                            <div key={key}>
                                              <p className="text-xs text-muted-foreground mb-1">{label}</p>
                                              <input
                                                type="number"
                                                value={field(p.id, key as keyof Participant) ?? ""}
                                                onChange={e => setEditMap(prev => ({
                                                  ...prev,
                                                  [p.id]: { ...prev[p.id], [key]: e.target.value === "" ? null : Number(e.target.value) }
                                                }))}
                                                onClick={e => e.stopPropagation()}
                                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none focus:border-primary/50"
                                              />
                                            </div>
                                          ))}
                                        </div>

                                        {/* Problem & Reasoning */}
                                        <div className="space-y-3">
                                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Notes</h4>
                                          {[
                                            { label: "Problem Statement", key: "problem_statement" },
                                            { label: "Reasoning / Feedback", key: "reasoning" },
                                          ].map(({ label, key }) => (
                                            <div key={key}>
                                              <p className="text-xs text-muted-foreground mb-1">{label}</p>
                                              <textarea
                                                rows={3}
                                                value={String(field(p.id, key as keyof Participant) ?? "")}
                                                onChange={e => setEditMap(prev => ({
                                                  ...prev,
                                                  [p.id]: { ...prev[p.id], [key]: e.target.value || null }
                                                }))}
                                                onClick={e => e.stopPropagation()}
                                                className="w-full rounded-lg border border-border/60 bg-background px-3 py-1.5 text-sm outline-none focus:border-primary/50 resize-none"
                                              />
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Save row */}
                                      <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border/40">
                                        <button
                                          onClick={e => { e.stopPropagation(); setEditMap(prev => { const n = { ...prev }; delete n[p.id]; return n; }); }}
                                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                                        >
                                          <X className="w-3.5 h-3.5" />Reset
                                        </button>
                                        <motion.button
                                          whileTap={{ scale: 0.97 }}
                                          onClick={e => { e.stopPropagation(); handleSave(p.id); }}
                                          disabled={savingId === p.id || !editMap[p.id]}
                                          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
                                        >
                                          {savingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                          Save Changes
                                        </motion.button>
                                      </div>
                                    </td>
                                  </motion.tr>
                                )}
                              </AnimatePresence>
                            </>
                          );
                        })}
                        {!loading && filtered.length === 0 && (
                          <tr>
                            <td colSpan={10} className="text-center py-12 text-muted-foreground">
                              <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              No participants found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {tab === "upload" && (
            <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-3xl">
              <div className="bg-card/60 border border-border/60 rounded-2xl p-6">
                <h3 className="font-semibold mb-1 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  Upload Processed Scores CSV
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  CSV must contain the columns: <code className="text-xs bg-muted px-1 py-0.5 rounded">teamID, Team_Name, Problem_Statement, Repo_URL, Progress, Total_Score, Tech_Score, Innov_Score, Completeness, Reasoning, password</code>
                </p>

                {/* Drop zone */}
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border/60 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">{csvFileName || "Click to select CSV file"}</p>
                  <p className="text-sm text-muted-foreground mt-1">or drag and drop your exported CSV here</p>
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              {/* Preview */}
              {csvPreview.length > 0 && (
                <div className="bg-card/60 border border-border/60 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
                    <h4 className="font-semibold">Preview — {csvPreview.length} rows</h4>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleApplyCsv}
                      disabled={uploading}
                      className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                    >
                      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {uploading ? "Applying..." : "Apply to Database"}
                    </motion.button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[800px]">
                      <thead>
                        <tr className="border-b border-border/40 bg-card/50 text-muted-foreground">
                          {["teamID","Team_Name","Total_Score","Tech_Score","Innov_Score","Completeness","Progress"].map(h => (
                            <th key={h} className="px-4 py-2 text-left font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.slice(0, 20).map((row, i) => (
                          <tr key={i} className="border-b border-border/30 hover:bg-card/60">
                            <td className="px-4 py-2 font-mono">{row.teamID}</td>
                            <td className="px-4 py-2">{row.Team_Name}</td>
                            <td className="px-4 py-2 font-semibold text-primary">{row.Total_Score}</td>
                            <td className="px-4 py-2">{row.Tech_Score}</td>
                            <td className="px-4 py-2">{row.Innov_Score}</td>
                            <td className="px-4 py-2">{row.Completeness}</td>
                            <td className="px-4 py-2">{row.Progress}</td>
                          </tr>
                        ))}
                        {csvPreview.length > 20 && (
                          <tr><td colSpan={7} className="px-4 py-2 text-center text-muted-foreground">…and {csvPreview.length - 20} more rows</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Results */}
              {uploadResults.length > 0 && (
                <div className="bg-card/60 border border-border/60 rounded-2xl p-6 space-y-2">
                  <h4 className="font-semibold mb-3">Upload Results</h4>
                  {uploadResults.map((r, i) => (
                    <div key={i} className={`flex items-center gap-3 text-sm rounded-lg px-4 py-2 ${r.status === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                      {r.status === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      <span className="font-mono">{r.teamID}</span>
                      <span className="text-xs opacity-80">— {r.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
