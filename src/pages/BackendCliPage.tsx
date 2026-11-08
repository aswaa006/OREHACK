import React from "react";
import { Link } from "react-router-dom";
import { Terminal } from "lucide-react";

export default function BackendCliPage() {
  return (
    <div className="min-h-screen bg-background p-8 text-foreground font-mono">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <Terminal className="w-6 h-6 text-primary" />
            Backend CLI
          </h1>
          <Link to="/admin/super" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Admin
          </Link>
        </div>
        
        <div className="bg-card border border-border/50 rounded-lg p-6 min-h-[400px]">
          <p className="text-muted-foreground mb-4">
            // This is your designated backend CLI page.
            <br/>
            // You can paste your custom CLI integration code here later.
          </p>

          <div className="bg-black/50 p-4 rounded text-sm text-green-400">
            {`> _ ready for input...`}
          </div>
        </div>
      </div>
    </div>
  );
}
