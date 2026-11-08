import React, { useState } from "react";
import { updateEvent, type Event } from "@/lib/admin-api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function SettingsTab({ event, onUpdate }: { event: Event; onUpdate: (e: Event) => void }) {
  const [pptOpen, setPptOpen] = useState(event.ppt_submission_open ?? true);
  const [gitOpen, setGitOpen] = useState(event.git_submission_open ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateEvent(event.id, {
        ppt_submission_open: pptOpen,
        git_submission_open: gitOpen,
      });
      onUpdate(updated);
      toast.success("Settings updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-xl p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-white mb-6">Submission Settings</h3>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base text-white">PPT Submission</Label>
              <p className="text-sm text-white/50">Allow teams to submit their presentation URL.</p>
            </div>
            <Switch
              checked={pptOpen}
              onCheckedChange={setPptOpen}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base text-white">Git Repository Submission</Label>
              <p className="text-sm text-white/50">Allow teams to submit their code repository URL.</p>
            </div>
            <Switch
              checked={gitOpen}
              onCheckedChange={setGitOpen}
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.06] flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving || (pptOpen === event.ppt_submission_open && gitOpen === event.git_submission_open)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
