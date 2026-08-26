import React, { useState, useEffect } from "react";
import { Download, AlertCircle, RefreshCw } from "lucide-react";
import { getEvents, getBackendExportData, downloadBackendCsv, type Event } from "@/lib/admin-api";
import { motion } from "framer-motion";

export default function BackendExportPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getEvents().then(setEvents).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedEvent) {
      setData([]);
      return;
    }
    loadData();
  }, [selectedEvent]);

  const loadData = async () => {
    if (!selectedEvent) return;
    setLoading(true);
    setError("");
    try {
      const res = await getBackendExportData(selectedEvent);
      setData(res || []);
    } catch (err: any) {
      setError(err.message || "Failed to load backend data");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!selectedEvent) return;
    setDownloading(true);
    try {
      await downloadBackendCsv(selectedEvent);
    } catch (err: any) {
      setError(err.message || "Failed to download CSV");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Backend Export Data</h1>
          <p className="text-white/40 text-sm mt-1">
            View and export data in the exact format required by the Python backend.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="bg-[#0d0d1a] border border-white/[0.07] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/40 w-48 appearance-none"
          >
            <option value="">Select Hackathon...</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <button
            onClick={loadData}
            disabled={!selectedEvent || loading}
            className="p-2 bg-white/[0.06] hover:bg-white/10 disabled:opacity-40 text-white rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleDownload}
            disabled={!selectedEvent || downloading || data.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Downloading..." : "Export CSV"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/40">Loading data...</div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-3">
              <Download className="w-5 h-5 text-white/30" />
            </div>
            <h3 className="text-white font-medium mb-1">No data to display</h3>
            <p className="text-white/40 text-sm">
              Select a hackathon from the dropdown to view its backend export data.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                  {Object.keys(data[0]).map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/[0.06]">
                {data.map((row, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.01, 0.5) }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {Object.values(row).map((val: any, j) => (
                      <td
                        key={j}
                        className="px-4 py-3 text-white/70 max-w-[200px] truncate"
                        title={val?.toString()}
                      >
                        {val?.toString() || <span className="text-white/20">-</span>}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
