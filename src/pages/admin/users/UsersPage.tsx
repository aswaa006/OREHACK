import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Plus, Mail, AlertCircle, CheckCircle2, X } from "lucide-react";
import { getUsers, createAdminUser } from "@/lib/admin-api";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EVENT_ADMIN");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const load = () => { getUsers().then(setUsers).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Email and password required."); return; }
    setCreating(true);
    setError("");
    try {
      await createAdminUser(email, password, role);
      setSuccess(true);
      setEmail(""); setPassword("");
      setShowCreate(false);
      load();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create user.");
    } finally {
      setCreating(false);
    }
  };

  const roleCls: Record<string, string> = {
    SUPER_ADMIN: "text-red-400 bg-red-400/10 border-red-400/20",
    EVENT_ADMIN: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
    PARTICIPANT: "text-white/30 bg-white/5 border-white/[0.08]",
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="text-white/40 text-sm mt-1">Manage admin accounts on the platform.</p>
        </div>
        <button
          onClick={() => setShowCreate(v => !v)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> Create User
        </button>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400">User created successfully.</p>
        </motion.div>
      )}

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Create Admin User</h2>
                <button onClick={() => setShowCreate(false)} className="text-white/30 hover:text-white/60"><X className="w-4 h-4" /></button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required
                      className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white/70 focus:outline-none focus:border-indigo-500/40 appearance-none">
                      <option value="EVENT_ADMIN">Event Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                    className="w-full bg-white/[0.04] border border-white/[0.07] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-indigo-500/40" />
                </div>
                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
                <button type="submit" disabled={creating} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  {creating ? <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <Plus className="w-4 h-4" />}
                  {creating ? "Creating..." : "Create User"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Users list */}
      <div className="bg-[#0d0d1a] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Email", "Role", "Joined"].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-white/30 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.03]">
                  {[...Array(3)].map((__, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-white/[0.04] rounded animate-pulse" /></td>)}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-10 text-center text-white/30 text-sm">No users found.</td></tr>
            ) : (
              users.map((user, i) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-white/[0.03]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">{user.email[0].toUpperCase()}</div>
                      <span className="text-white/80 text-sm">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleCls[user.role] ?? "text-white/30 bg-white/5 border-white/[0.08]"}`}>
                      <Shield className="w-3 h-3" /> {user.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-white/30 text-xs">{new Date(user.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
