import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Save, AlertCircle, Image as ImageIcon, Award, FileText } from "lucide-react";
import { createEvent } from "@/lib/admin-api";

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "REGISTRATION_OPEN", label: "Registration Open" },
  { value: "REGISTRATION_CLOSED", label: "Registration Closed" },
  { value: "EVALUATION", label: "Evaluation" },
  { value: "COMPLETED", label: "Completed" },
];

interface FormData {
  name: string;
  institution: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  max_team_size: string;
  status: string;
}

const defaultForm: FormData = {
  name: "",
  institution: "",
  description: "",
  theme: "",
  start_date: "",
  end_date: "",
  max_team_size: "4",
  status: "DRAFT",
};

function Field({
  label,
  id,
  required,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">
        {label} {required && <span className="text-indigo-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full bg-[#0d0d1a] border border-white/[0.07] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/50 transition-colors";

export default function CreateHackathonPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBannerFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { setError("Hackathon name is required."); return; }
    setLoading(true);
    setError("");
    try {
      // In a real app, upload bannerFile to storage here.
      const created = await createEvent({
        ...form,
        max_team_size: parseInt(form.max_team_size) || 4,
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      } as any);
      navigate(`/admin/v2/hackathons/${created.id}`, { replace: true });
    } catch (err: any) {
      setError(err.message || "Failed to create hackathon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Back nav */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/60 text-sm transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Hackathons
        </button>
        <h1 className="text-2xl font-bold text-white">Create Hackathon</h1>
        <p className="text-white/40 text-sm mt-1">Set up a new hackathon event on the platform.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Banner Upload */}
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            Banner Image
          </h2>
          <div className="border-2 border-dashed border-white/[0.1] rounded-xl p-8 flex flex-col items-center justify-center bg-white/[0.02] hover:bg-white/[0.04] transition-colors relative">
            {bannerFile ? (
              <div className="flex flex-col items-center">
                <img src={URL.createObjectURL(bannerFile)} alt="Banner preview" className="max-h-48 rounded-lg mb-4 object-cover" />
                <p className="text-sm text-white/70">{bannerFile.name}</p>
                <button type="button" onClick={() => setBannerFile(null)} className="text-xs text-red-400 mt-2 hover:underline">Remove</button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-3">
                  <ImageIcon className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-sm text-white/70 font-medium">Click to upload banner</p>
                <p className="text-xs text-white/40 mt-1">PNG, JPG or WEBP (max. 5MB)</p>
                <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={handleBannerUpload} />
              </div>
            )}
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Basic Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Hackathon Name" id="name" required>
                <input id="name" className={inputCls} value={form.name} onChange={set("name")} placeholder="OREHACK 2026" required />
              </Field>
            </div>
            <Field label="Institution" id="institution">
              <input id="institution" className={inputCls} value={form.institution} onChange={set("institution")} placeholder="SIMATS Engineering" />
            </Field>
            <Field label="Theme" id="theme">
              <input id="theme" className={inputCls} value={form.theme} onChange={set("theme")} placeholder="AI & Innovation" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" id="description">
                <textarea
                  id="description"
                  className={`${inputCls} resize-none min-h-[100px]`}
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Brief description of the hackathon..."
                />
              </Field>
            </div>
          </div>
        </div>


        {/* Dates */}
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Dates & Schedule</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Event Start" id="start_date">
              <input id="start_date" type="datetime-local" className={inputCls} value={form.start_date} onChange={set("start_date")} />
            </Field>
            <Field label="Event End" id="end_date">
              <input id="end_date" type="datetime-local" className={inputCls} value={form.end_date} onChange={set("end_date")} />
            </Field>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Configuration</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Max Team Size" id="max_team_size">
              <input
                id="max_team_size"
                type="number"
                min="1"
                max="10"
                className={inputCls}
                value={form.max_team_size}
                onChange={set("max_team_size")}
              />
            </Field>
            <Field label="Initial Status" id="status">
              <select id="status" className={inputCls} value={form.status} onChange={set("status")}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white/90 hover:bg-white/[0.08] rounded-xl text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {loading ? "Creating..." : "Create Hackathon"}
          </button>
        </div>
      </form>
    </div>
  );
}
