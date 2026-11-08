import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, AlertCircle, CheckCircle2, X,
  ChevronDown, ChevronUp, Loader2, ArrowRight, Info, Download,
  SkipForward, ShieldCheck, Wrench, ChevronRight,
} from "lucide-react";
import {
  getEvents, previewBackendImport, confirmBackendImport,
  downloadBackendCsv, type Event,
} from "@/lib/admin-api";

type ImportMode = "production" | "dev";
type Step = "upload" | "preview" | "confirming" | "done";

import Papa from "papaparse";

// ── CSV Parser ─────────────────────────────────────────────────────────────────
function parseCSV(text: string): Record<string, string>[] {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data as Record<string, string>[];
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  new:    { label: "New",     cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  update: { label: "Update",  cls: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
  error:  { label: "Error",   cls: "text-red-400 bg-red-400/10 border-red-400/20" },
  locked: { label: "Locked",  cls: "text-orange-400 bg-orange-400/10 border-orange-400/20" },
  skip:   { label: "Skipped", cls: "text-white/30 bg-white/[0.04] border-white/10" },
};

function ModeToggle({ mode, setMode, disabled }: { mode: ImportMode; setMode: (m: ImportMode) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
      <button
        onClick={() => !disabled && setMode("production")}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
          mode === "production"
            ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
            : "text-white/40 hover:text-white/70"
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Production
      </button>
      <button
        onClick={() => !disabled && setMode("dev")}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
          mode === "dev"
            ? "bg-amber-500/80 text-white shadow-md shadow-amber-500/20"
            : "text-white/40 hover:text-white/70"
        }`}
      >
        <Wrench className="w-3.5 h-3.5" />
        Dev Mode
      </button>
    </div>
  );
}

export default function BackendImportPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [mode, setMode] = useState<ImportMode>("production");
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getEvents().then(setEvents).catch(console.error); }, []);

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.endsWith(".csv")) { setError("Only .csv files are supported."); return; }
    if (!selectedEvent) { setError("Please select a hackathon first."); return; }
    setFile(f); setError(""); setLoading(true);
    try {
      const text = await f.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) { setError("The CSV file appears to be empty."); return; }
      const result = await previewBackendImport(selectedEvent, parsed, mode);
      setPreview(result);
      setStep("preview");
    } catch (err: any) {
      setError(err.message || "Failed to validate CSV.");
    } finally {
      setLoading(false);
    }
  }, [selectedEvent, mode]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleConfirm = async () => {
    if (!selectedEvent || !preview || !file) return;
    setStep("confirming"); setLoading(true);
    try {
      const validRows = preview.rows.filter((r: any) => r._status === "new" || r._status === "update");
      const res = await confirmBackendImport(selectedEvent, validRows, file.name, mode);
      setResult(res); setStep("done");
    } catch (err: any) {
      setError(err.message || "Import failed.");
      setStep("preview");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("upload"); setFile(null); setPreview(null);
    setResult(null); setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const validRows = preview?.rows.filter((r: any) => r._status === "new" || r._status === "update") ?? [];
  const errorRows = preview?.rows.filter((r: any) => r._status === "error" || r._status === "locked") ?? [];
  const skipRows  = preview?.rows.filter((r: any) => r._status === "skip") ?? [];

  const isDevMode = mode === "dev";

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Backend Import Center</h1>
          <p className="text-white/40 text-sm mt-1">
            Import your scored CSV back into the database. Teams matched by <span className="text-white/60 font-mono">teamID</span>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {selectedEvent && (
            <button
              onClick={() => downloadBackendCsv(selectedEvent)}
              className="flex items-center gap-2 px-3 py-2 bg-white/[0.05] hover:bg-white/10 border border-white/[0.08] text-white/60 hover:text-white rounded-xl text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Template
            </button>
          )}
          <ModeToggle mode={mode} setMode={(m) => { setMode(m); reset(); }} disabled={step === "confirming"} />
        </div>
      </div>

      {/* Mode info banner */}
      <AnimatePresence mode="wait">
        {isDevMode ? (
          <motion.div
            key="dev"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3"
          >
            <Wrench className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-amber-400 text-sm font-semibold">Dev Mode active — Full overwrite enabled</p>
              <p className="text-amber-400/60 text-xs mt-0.5">
                All CSV fields will be written to the database: Team Name, Institution, Problem Statement, Repo URL, Progress, Scores, and Reasoning.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="prod"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="flex items-start gap-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl px-4 py-3"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-indigo-400 text-sm font-semibold">Production Mode — Scores only</p>
              <p className="text-indigo-400/60 text-xs mt-0.5">
                Only score columns (Tech, Innovation, Completeness) and Reasoning will be updated. Team details are read-only.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hackathon selector */}
      <div>
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
          Hackathon <span className="text-indigo-400">*</span>
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => { setSelectedEvent(e.target.value); reset(); }}
          className="w-full max-w-sm bg-[#0d0d1a] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/40 appearance-none"
        >
          <option value="">Select a hackathon...</option>
          {events.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {/* STEP: Upload */}
      {step === "upload" && (
        <div className="space-y-4">
          {/* Expected columns hint */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-2">Expected CSV Columns</p>
            <div className="flex flex-wrap gap-1.5">
              {["teamID", "Team_Name", "Problem_Statement", "Repo_URL", "Progress",
                "Total_Scores", "Tech_Scores", "Innov_Scores", "Completeness_Scores", "Reasoning"].map((col) => {
                const isScore = ["Tech_Scores","Innov_Scores","Completeness_Scores","Total_Scores","Reasoning"].includes(col);
                const isDevOnly = ["Team_Name","Problem_Statement","Repo_URL","Progress"].includes(col);
                return (
                  <span
                    key={col}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                      isScore
                        ? "text-emerald-400 bg-emerald-400/8 border-emerald-400/20"
                        : isDevOnly
                          ? isDevMode
                            ? "text-amber-400 bg-amber-400/8 border-amber-400/20"
                            : "text-white/20 bg-white/[0.02] border-white/[0.06]"
                          : "text-indigo-400 bg-indigo-400/8 border-indigo-400/20"
                    }`}
                  >
                    {col}
                    {isDevOnly && !isDevMode && " (ignored)"}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => selectedEvent && fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-14 text-center transition-all cursor-pointer ${
              isDragOver
                ? "border-emerald-500/60 bg-emerald-500/5"
                : selectedEvent
                  ? "border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.02]"
                  : "border-white/[0.04] opacity-50 cursor-not-allowed"
            }`}
          >
            <input ref={fileRef} type="file" accept=".csv" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            {loading ? (
              <Loader2 className="w-10 h-10 text-indigo-400 mx-auto mb-4 animate-spin" />
            ) : (
              <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragOver ? "text-emerald-400" : "text-white/20"}`} />
            )}
            <p className="text-white/60 font-medium text-sm mb-1">
              {loading ? "Validating CSV..." : isDragOver ? "Drop your scored CSV here" : "Drag & drop your scored CSV"}
            </p>
            <p className="text-white/30 text-xs">{selectedEvent ? "or click to browse" : "Select a hackathon first"}</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* STEP: Preview */}
      {step === "preview" && preview && (
        <div className="space-y-5">
          {/* Summary cards */}
          <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-bold text-white">Import Preview</h2>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isDevMode ? "text-amber-400 bg-amber-400/10 border-amber-400/20" : "text-indigo-400 bg-indigo-400/10 border-indigo-400/20"
                  }`}>
                    {isDevMode ? "Dev Mode" : "Production"}
                  </span>
                </div>
                <p className="text-white/40 text-xs font-mono">{file?.name}</p>
              </div>
              <button onClick={reset} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Total Rows", value: preview.totalRows, cls: "text-white" },
                { label: "Will Import", value: validRows.length, cls: "text-emerald-400" },
                { label: "Already Scored", value: preview.alreadyEvaluated, cls: "text-blue-400" },
                { label: "Blank (skipped)", value: preview.skippedNoScores ?? skipRows.length, cls: "text-white/30" },
                { label: "Errors", value: preview.errors, cls: preview.errors > 0 ? "text-red-400" : "text-white/30" },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.02] rounded-xl p-3.5 border border-white/[0.04]">
                  <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                  <p className="text-white/40 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {preview.alreadyEvaluated > 0 && (
              <div className="mt-4 flex items-start gap-2 bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-blue-400 text-sm">{preview.alreadyEvaluated} teams already have scores — they will be <strong>overwritten</strong>.</p>
              </div>
            )}

            {errorRows.length > 0 && (
              <div className="mt-4">
                <button onClick={() => setShowErrors(!showErrors)}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors">
                  {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  View {errorRows.length} error{errorRows.length !== 1 ? "s" : ""}
                </button>
                <AnimatePresence>
                  {showErrors && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} className="mt-3 space-y-2 overflow-hidden">
                      {errorRows.map((row: any, i: number) => (
                        <div key={i} className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 rounded-xl px-3 py-2.5">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-red-400 text-xs font-medium">{row.teamID || row.team_code || "Unknown team"}</p>
                            <p className="text-red-400/60 text-xs">{row._error}</p>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Preview table */}
          {validRows.length > 0 && (
            <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white">{validRows.length} rows to update</h3>
              </div>
              <div className="max-h-96 overflow-y-auto overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.04] sticky top-0 bg-[#0d0d1a]">
                      <th className="text-left px-4 py-2.5 text-white/30 font-semibold uppercase tracking-widest whitespace-nowrap">Team ID</th>
                      <th className="text-left px-4 py-2.5 text-white/30 font-semibold uppercase tracking-widest whitespace-nowrap">Team Name</th>
                      <th className="text-left px-4 py-2.5 text-white/30 font-semibold uppercase tracking-widest whitespace-nowrap">Tech</th>
                      <th className="text-left px-4 py-2.5 text-white/30 font-semibold uppercase tracking-widest whitespace-nowrap">Innov</th>
                      <th className="text-left px-4 py-2.5 text-white/30 font-semibold uppercase tracking-widest whitespace-nowrap">Compl</th>
                      <th className="text-left px-4 py-2.5 text-white/30 font-semibold uppercase tracking-widest whitespace-nowrap">Total</th>
                      {isDevMode && <th className="text-left px-4 py-2.5 text-amber-400/60 font-semibold uppercase tracking-widest whitespace-nowrap">Changes</th>}
                      <th className="text-left px-4 py-2.5 text-white/30 font-semibold uppercase tracking-widest whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validRows.map((row: any, i: number) => (
                      <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.01, 0.3) }}
                        className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 font-mono text-white/50 whitespace-nowrap">{row.team_code}</td>
                        <td className="px-4 py-2.5 text-white/70 max-w-[140px] truncate">
                          {row.csv_team_name && isDevMode && row.csv_team_name !== row.team_name ? (
                            <span className="flex items-center gap-1 text-amber-400">
                              <span className="text-white/30 line-through">{row.team_name}</span>
                              <ChevronRight className="w-3 h-3" />
                              {row.csv_team_name}
                            </span>
                          ) : row.team_name}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-white/60">{row.tech_scores ?? <span className="text-white/20">-</span>}</td>
                        <td className="px-4 py-2.5 font-mono text-white/60">{row.innov_scores ?? <span className="text-white/20">-</span>}</td>
                        <td className="px-4 py-2.5 font-mono text-white/60">{row.completeness_scores ?? <span className="text-white/20">-</span>}</td>
                        <td className="px-4 py-2.5 text-white font-bold font-mono">{row.computed_total?.toFixed(1) ?? "-"}</td>
                        {isDevMode && (
                          <td className="px-4 py-2.5">
                            {row.dev_changes?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {row.dev_changes.map((c: string, j: number) => (
                                  <span key={j} className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400/10 border border-amber-400/20 text-amber-400 whitespace-nowrap">{c}</span>
                                ))}
                              </div>
                            ) : <span className="text-white/20 text-[11px]">Scores only</span>}
                          </td>
                        )}
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${STATUS_BADGE[row._status]?.cls ?? ""}`}>
                            {STATUS_BADGE[row._status]?.label ?? row._status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={handleConfirm} disabled={validRows.length === 0}
              className={`flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                isDevMode ? "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20" : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/20"
              }`}>
              <CheckCircle2 className="w-4 h-4" />
              Confirm {isDevMode ? "Full" : "Scores"} Import ({validRows.length} rows)
            </button>
            <button onClick={reset}
              className="px-5 py-2.5 border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.04] rounded-xl text-sm font-medium transition-colors">
              Cancel
            </button>
            {skipRows.length > 0 && (
              <span className="flex items-center gap-1 text-white/30 text-xs">
                <SkipForward className="w-3.5 h-3.5" />
                {skipRows.length} blank rows skipped
              </span>
            )}
          </div>
        </div>
      )}

      {/* STEP: Confirming */}
      {step === "confirming" && (
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Loader2 className={`w-10 h-10 mx-auto mb-4 animate-spin ${isDevMode ? "text-amber-400" : "text-indigo-400"}`} />
          <p className="text-white font-semibold">Saving to database...</p>
          <p className="text-white/30 text-sm mt-1">Please do not close this page.</p>
        </div>
      )}

      {/* STEP: Done */}
      {step === "done" && result && (
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-white font-bold text-lg mb-1">Import Complete!</h2>
          <p className="text-white/40 text-sm mb-6">
            {isDevMode ? "All details" : "Scores"} have been saved to the database.
          </p>
          <div className="flex justify-center gap-8 mb-8">
            {[
              { label: "Updated", value: result.success, cls: "text-emerald-400" },
              { label: "Failed",  value: result.failed,  cls: "text-red-400" },
              { label: "Total",   value: result.total,   cls: "text-white/60" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
                <p className="text-white/30 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={reset}
              className="px-4 py-2 bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-sm font-medium transition-colors">
              Import Another
            </button>
            <a href={`/admin/v2/evaluation/scores${selectedEvent ? `?event_id=${selectedEvent}` : ""}`}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
              View Score Manager <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
