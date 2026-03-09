import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = ["System", "Hackathons", "Evaluation", "Logs"];

const DeveloperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("System");

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">
              Developer Admin
              <span className="ml-2 text-xs font-normal text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Oregent
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">Full System Control</p>
          </div>
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Exit
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="flex gap-1 mb-8 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="dev-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "System" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Active Hackathons", value: "3" },
                { label: "Total Submissions", value: "412" },
                { label: "Engine Status", value: "Online", color: "text-success" },
                { label: "Avg Eval Time", value: "4.2s" },
              ].map((s) => (
                <div key={s.label} className="surface-elevated rounded-xl p-5">
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.color || "text-foreground"}`}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="surface-elevated rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                {["Re-run All Evaluations", "Override Score", "Manage Hackathons", "Assign Admins"].map((action) => (
                  <button
                    key={action}
                    className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-300"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Hackathons" && (
          <div className="surface-elevated rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Managed Hackathons</h3>
            <div className="space-y-3">
              {["Origin 2K26", "BuildCore v3", "DevStrike '24"].map((name) => (
                <div key={name} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <span className="text-sm text-foreground font-medium">{name}</span>
                  <button className="text-xs text-primary hover:underline">Manage</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Evaluation" && (
          <div className="surface-elevated rounded-xl p-6">
            <h3 className="text-sm font-semibold text-foreground mb-2">Evaluation Engine</h3>
            <p className="text-sm text-muted-foreground">
              Override scores, re-run evaluations, and monitor pipeline health from here.
            </p>
          </div>
        )}

        {activeTab === "Logs" && (
          <div className="surface-elevated rounded-xl p-6 font-mono text-xs text-muted-foreground space-y-1">
            <p>[2026-03-02 14:23:01] Evaluation completed: NeuralForge → 94.2</p>
            <p>[2026-03-02 14:22:58] Repository parsed: github.com/neuralforge/proj</p>
            <p>[2026-03-02 14:22:45] Submission received: NeuralForge</p>
            <p>[2026-03-02 14:20:12] Engine health check: OK</p>
            <p>[2026-03-02 14:15:00] Hackathon "Origin 2K26" status: LIVE</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperAdminDashboard;
