import React from "react";
import { Settings, Zap, Info } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function SettingsPage() {
  const { user } = useAdminAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Platform configuration and account settings.</p>
      </div>

      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-400" /> Account Information
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
            <span className="text-white/40 text-sm">Email</span>
            <span className="text-white/80 text-sm font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
            <span className="text-white/40 text-sm">Role</span>
            <span className="text-white/80 text-sm font-medium">{user?.role?.replace("_", " ")}</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-white/40 text-sm">Session</span>
            <span className="text-emerald-400 text-sm font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" /> Platform Info
        </h2>
        <div className="space-y-3">
          {[
            { label: "Version", value: "2.0.0" },
            { label: "API", value: "/api/v2/" },
            { label: "Score Categories", value: "Technical (50pt), Innovation (30pt), Completeness (20pt)" },
            { label: "Import Format", value: "submission_id, Tech_Scores, Innov_Scores, Completeness_Scores, Reasoning" },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between py-3 border-b border-white/[0.04] last:border-0">
              <span className="text-white/40 text-sm shrink-0">{item.label}</span>
              <span className="text-white/60 text-sm text-right font-mono">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
