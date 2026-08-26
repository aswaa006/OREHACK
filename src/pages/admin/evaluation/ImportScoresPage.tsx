import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, AlertCircle, CheckCircle2, X, ChevronDown,
  ChevronUp, Eye, Loader2, ArrowRight, Info,
} from "lucide-react";
import {
  getEvents, previewScoreImport, confirmScoreImport,
  type Event, type ImportPreview,
} from "@/lib/admin-api";

// Simple CSV parser (handles quoted fields)
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => { row[h.trim()] = values[idx]?.trim() ?? ""; });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

type Step = "upload" | "preview" | "confirming" | "done";

export default function ImportScoresPage() {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get("event_id") ?? "");
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; total: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getEvents().then(setEvents).catch(console.error); }, []);

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.endsWith(".csv")) { setError("Only .csv files are supported."); return; }
    if (!selectedEvent) { setError("Please select a hackathon first."); return; }
    setFile(f);
    setError("");

    const text = await f.text();
    const parsed = parseCSV(text);

    if (parsed.length === 0) { setError("The CSV file appears to be empty."); return; }

    setLoading(true);
    try {
      const result = await previewScoreImport(selectedEvent, parsed);
      setRows(parsed);
      setPreview(result);
      setStep("preview");
    } catch (err: any) {
      setError(err.message || "Failed to parse/preview the CSV.");
    } finally {
      setLoading(false);
    }
  }, [selectedEvent]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleConfirm = async () => {
    if (!selectedEvent || !preview || !file) return;
    setStep("confirming");
    setLoading(true);
    try {
      const validRows = preview.rows.filter(r => r._status === "new" || r._status === "update");
      const res = await confirmScoreImport(selectedEvent, validRows, file.name);
      setResult(res);
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Import failed.");
      setStep("preview");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("upload");
    setFile(null);
    setRows([]);
    setPreview(null);
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const errorRows = preview?.rows.filter(r => r._status === "error" || r._status === "locked") ?? [];
  const validRows = preview?.rows.filter(r => r._status === "new" || r._status === "update") ?? [];
  const updateRows = preview?.rows.filter(r => r._status === "update") ?? [];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Import Scores</h1>
        <p className="text-white/40 text-sm mt-1">Upload the scored CSV from your Python CLI to populate evaluation scores.</p>
      </div>

      {/* Event selector */}
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

      {/* Step: Upload */}
      {step === "upload" && (
        <div className="space-y-4">
          {/* Expected format info */}
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-blue-400 text-sm font-medium mb-1">Expected CSV Columns</p>
                <p className="text-white/40 text-xs font-mono">submission_id, teamID, Team_Name, Problem_Statement, Repo_URL, Progress, Tech_Scores, Innov_Scores, Completeness_Scores, Total_Scores, Reasoning</p>
              </div>
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onClick={() => selectedEvent && fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
              isDragOver
                ? "border-indigo-500/60 bg-indigo-500/5"
                : selectedEvent
                  ? "border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.02]"
                  : "border-white/[0.04] opacity-50 cursor-not-allowed"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {loading ? (
              <Loader2 className="w-10 h-10 text-indigo-400 mx-auto mb-4 animate-spin" />
            ) : (
              <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragOver ? "text-indigo-400" : "text-white/20"}`} />
            )}
            <p className="text-white/60 font-medium text-sm mb-1">
              {loading ? "Parsing and validating..." : isDragOver ? "Drop CSV file here" : "Drag & drop CSV file here"}
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

      {/* Step: Preview */}
      {step === "preview" && preview && (
        <div className="space-y-5">
          {/* Summary */}
          <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white">Import Preview</h2>
                <p className="text-white/40 text-xs mt-1 font-mono">{file?.name}</p>
              </div>
              <button onClick={reset} className="text-white/30 hover:text-white/60 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Rows Detected", value: preview.totalRows, cls: "text-white" },
                { label: "Valid (New)", value: preview.valid, cls: "text-emerald-400" },
                { label: "Already Evaluated", value: preview.alreadyEvaluated, cls: "text-blue-400" },
                { label: "Errors", value: preview.errors, cls: preview.errors > 0 ? "text-red-400" : "text-white/30" },
              ].map((s) => (
                <div key={s.label} className="bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]">
                  <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
                  <p className="text-white/40 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {updateRows.length > 0 && (
              <div className="mt-4 flex items-start gap-2 bg-blue-500/5 border border-blue-500/15 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                <p className="text-blue-400 text-sm">{updateRows.length} teams already have scores — they will be updated (overwritten).</p>
              </div>
            )}

            {preview.errors > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowErrors(!showErrors)}
                  className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  {showErrors ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  View {preview.errors} error{preview.errors !== 1 ? "s" : ""}
                </button>

                <AnimatePresence>
                  {showErrors && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 space-y-2"
                    >
                      {errorRows.map((row, i) => (
                        <div key={i} className="flex items-start gap-3 bg-red-500/5 border border-red-500/10 rounded-xl px-3 py-2.5">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-red-400 text-xs font-medium">{row.submission_id || "Unknown submission"}</p>
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

          {/* Valid rows preview */}
          {validRows.length > 0 && (
            <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white">{validRows.length} Score Updates</h3>
              </div>
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.04] sticky top-0 bg-[#0d0d1a]">
                      {["Submission ID", "Team Code", "Technical", "Innovation", "Completeness", "Total", "Status"].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-white/30 font-semibold uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {validRows.map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 font-mono text-white/50">{row.submission_id}</td>
                        <td className="px-4 py-2.5 text-white/40">{row.team_code}</td>
                        <td className="px-4 py-2.5 text-white/60 font-mono">{Number(row.tech_scores).toFixed(1)}</td>
                        <td className="px-4 py-2.5 text-white/60 font-mono">{Number(row.innov_scores).toFixed(1)}</td>
                        <td className="px-4 py-2.5 text-white/60 font-mono">{Number(row.completeness_scores).toFixed(1)}</td>
                        <td className="px-4 py-2.5 text-white font-bold font-mono">{Number(row.computed_total).toFixed(1)}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${row._status === "update" ? "text-blue-400 bg-blue-400/10" : "text-emerald-400 bg-emerald-400/10"}`}>
                            {row._status === "update" ? "Update" : "New"}
                          </span>
                        </td>
                      </tr>
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
          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirm}
              disabled={validRows.length === 0}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Import ({validRows.length} updates)
            </button>
            <button
              onClick={reset}
              className="px-5 py-2.5 border border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.04] rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Step: Confirming */}
      {step === "confirming" && (
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-12 text-center">
          <Loader2 className="w-10 h-10 text-indigo-400 mx-auto mb-4 animate-spin" />
          <p className="text-white font-semibold">Importing scores...</p>
          <p className="text-white/30 text-sm mt-1">Please do not close this page.</p>
        </div>
      )}

      {/* Step: Done */}
      {step === "done" && result && (
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-white font-bold text-lg mb-1">Import Complete</h2>
          <p className="text-white/40 text-sm mb-5">Scores have been saved to the database.</p>
          <div className="flex justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-emerald-400">{result.success}</p>
              <p className="text-white/30 text-xs">Updated</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{result.failed}</p>
              <p className="text-white/30 text-xs">Failed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white/60">{result.total}</p>
              <p className="text-white/30 text-xs">Total</p>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={reset} className="px-4 py-2 bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-sm font-medium transition-colors">
              Import Another
            </button>
            <a href={`/admin/v2/evaluation/scores${selectedEvent ? `?event_id=${selectedEvent}` : ""}`} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors">
              View Leaderboard <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
