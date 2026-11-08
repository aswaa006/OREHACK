import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
  Upload, CheckCircle2, AlertCircle, Loader2,
  Database, FileSpreadsheet, ChevronRight, ArrowLeft
} from "lucide-react";

const HACKATHON_SLUG = "origin-2k25";

type Row = {
  teamID: string; Team_Name: string; Problem_Statement: string;
  Repo_URL: string; Progress: string; Total_Scores: string;
  Tech_Scores: string; Innov_Scores: string; Completeness_Scores: string;
  Reasoning: string; password: string;
};

type SeedResult = { teamID: string; status: "ok" | "error"; msg: string };

function parseCSVLine(line: string): string[] {
  const result: string[] = []; let current = ""; let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { if (inQuote && line[i+1] === '"') { current += '"'; i++; } else { inQuote = !inQuote; } }
    else if (ch === ',' && !inQuote) { result.push(current); current = ""; }
    else { current += ch; }
  }
  result.push(current);
  return result;
}

function parseCsvText(text: string): Row[] {
  const lines: string[] = []; let current = ""; let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') { inQuote = !inQuote; current += ch; }
    else if (ch === '\n' && !inQuote) { lines.push(current); current = ""; }
    else { current += ch; }
  }
  if (current.trim()) lines.push(current);
  const headers = parseCSVLine(lines[0]);
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim(); if (!line) continue;
    const vals = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h.trim()] = (vals[idx] ?? "").replace(/^"|"$/g, "").trim(); });
    if (obj["teamID"]) rows.push(obj as unknown as Row);
  }
  return rows;
}

export default function DataSeederPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [fileName, setFileName] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [results, setResults] = useState<SeedResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => setLog(p => [...p.slice(-50), msg]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setFileName(file.name);
    setResults([]); setDone(false); setLog([]);
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const parsed = parseCsvText(text);
      setRows(parsed);
      addLog(`✅ Parsed ${parsed.length} rows from "${file.name}"`);
    };
    reader.readAsText(file);
  };

  const handleSeed = async () => {
    if (!rows.length || seeding) return;
    setSeeding(true); setResults([]); setProgress(0); setDone(false);

    addLog(`🚀 Starting seed of ${rows.length} rows into hackathon: ${HACKATHON_SLUG}`);

    // Ensure hackathon row exists
    const { data: h } = await supabase.from("hackathons").select("id").eq("slug", HACKATHON_SLUG).maybeSingle();
    if (!h) {
      await supabase.from("hackathons").insert({
        name: "Origin 2K25", slug: HACKATHON_SLUG, theme: "AI + Web + Product",
        institution: "SHC", status: "ended", start_time: "2025-01-01T00:00:00Z",
        duration_hours: 36, total_submissions: rows.length,
        total_evaluated: rows.filter(r => r.Progress === "completed").length,
      });
      addLog("✅ Created hackathon record for origin-2k25");
    }

    const BATCH = 30;
    const allResults: SeedResult[] = [];

    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);

      const submissionPayloads = batch.map(row => ({
        hackathon_slug: HACKATHON_SLUG,
        team_id: row.teamID,
        team_name: row.Team_Name || null,
        repository_url: row.Repo_URL || null,
        problem_statement: row.Problem_Statement || null,
        progress: row.Progress || null,
        final_score: row.Total_Scores ? parseFloat(row.Total_Scores) : null,
        technical_score: row.Tech_Scores ? parseFloat(row.Tech_Scores) : null,
        innovation_score: row.Innov_Scores ? parseFloat(row.Innov_Scores) : null,
        completeness_score: row.Completeness_Scores ? parseFloat(row.Completeness_Scores) : null,
        reasoning: row.Reasoning || null,
        status: row.Progress === "completed" ? "evaluated" : row.Progress === "rejected" ? "rejected" : "queued",
        submitted_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from("submissions")
        .upsert(submissionPayloads, { onConflict: "hackathon_slug,team_id", ignoreDuplicates: false });

      if (error) {
        // Row-by-row fallback
        for (const p of submissionPayloads) {
          const { error: e2 } = await supabase.from("submissions").upsert([p], { ignoreDuplicates: false });
          allResults.push({ teamID: p.team_id, status: e2 ? "error" : "ok", msg: e2?.message ?? "ok" });
        }
      } else {
        batch.forEach(r => allResults.push({ teamID: r.teamID, status: "ok", msg: "ok" }));
      }

      // Upsert teams (for password)
      const teamBatch = batch.filter(r => r.password).map(row => ({
        team_id: row.teamID,
        team_name: row.Team_Name || null,
        password: row.password || null,
        hackathon_id: HACKATHON_SLUG,
      }));
      if (teamBatch.length) {
        await supabase.from("teams").upsert(teamBatch, { onConflict: "team_id", ignoreDuplicates: false });
      }

      const pct = Math.round(((i + batch.length) / rows.length) * 100);
      setProgress(pct);
      setResults([...allResults]);
      addLog(`Batch ${Math.ceil((i + BATCH) / BATCH)}: ${Math.min(i + BATCH, rows.length)}/${rows.length} rows (${pct}%)`);
    }

    const okCount = allResults.filter(r => r.status === "ok").length;
    const errCount = allResults.filter(r => r.status === "error").length;

    // Update hackathon totals
    await supabase.from("hackathons").update({
      total_submissions: okCount,
      total_evaluated: rows.filter(r => r.Progress === "completed").length,
    }).eq("slug", HACKATHON_SLUG);

    addLog(`🎉 Done! ${okCount} seeded, ${errCount} errors.`);
    setDone(true);
    setSeeding(false);
  };

  const okCount = results.filter(r => r.status === "ok").length;
  const errCount = results.filter(r => r.status === "error").length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center gap-4">
          <Link to="/admin/events" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Events
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Database className="w-7 h-7 text-primary" />
            Data Seeder
          </h1>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-300">
          <strong>⚠️ One-time use:</strong> This tool seeds historical hackathon data into Supabase.
          Run this once per event. Existing rows will be updated via upsert.
        </div>

        {/* File Upload */}
        <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            1. Upload CSV File
          </h3>
          <p className="text-sm text-muted-foreground">
            Expected columns: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
              teamID, Team_Name, Problem_Statement, Repo_URL, Progress, Total_Scores, Tech_Scores, Innov_Scores, Completeness_Scores, Reasoning, password
            </code>
          </p>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border/60 rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">{fileName || "Click to select your CSV"}</p>
            {rows.length > 0 && <p className="text-sm text-emerald-400 mt-1">{rows.length} rows ready to seed</p>}
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </div>
        </div>

        {/* Seed button */}
        {rows.length > 0 && !done && (
          <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              2. Seed into Supabase ({rows.length} rows → <span className="text-primary">{HACKATHON_SLUG}</span>)
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Total Rows", value: rows.length },
                { label: "Completed", value: rows.filter(r => r.Progress === "completed").length },
                { label: "Processing", value: rows.filter(r => r.Progress === "processing").length },
              ].map(s => (
                <div key={s.label} className="rounded-xl border border-border/40 bg-background/30 py-4">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {seeding && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Seeding…</span>
                  <span className="font-semibold text-primary">{progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSeed}
              disabled={seeding}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              {seeding ? `Seeding... (${progress}%)` : `Seed ${rows.length} Rows`}
            </motion.button>
          </div>
        )}

        {/* Done state */}
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center space-y-4"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-emerald-300">Seeding Complete!</h3>
              <p className="text-sm text-muted-foreground mt-1">{okCount} rows inserted, {errCount} errors</p>
            </div>
            <Link
              to={`/admin/events/${HACKATHON_SLUG}`}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors"
            >
              View in Score Manager <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}

        {/* Live log */}
        {log.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-card/40 p-5 space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Live Log</h4>
            <div className="font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
              {log.map((l, i) => <p key={i} className="text-foreground/70">{l}</p>)}
            </div>
          </div>
        )}

        {/* Error rows */}
        {errCount > 0 && (
          <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-5 space-y-2">
            <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {errCount} Errors
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {results.filter(r => r.status === "error").map((r, i) => (
                <p key={i} className="text-xs text-destructive/80 font-mono">{r.teamID}: {r.msg}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
