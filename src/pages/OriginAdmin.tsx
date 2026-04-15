import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const ADMIN_USERNAME = "Execution@oregent.in";
const ADMIN_PASSWORD = "Zerotouch192421";
const ADMIN_SESSION_KEY = "orehack_origin_admin_auth";

type SubmissionRecord = {
  teamID: string;
  Team_Name: string;
  Problem_Statement: string;
  Repo_URL: string;
  Progress: string;
  Total_Scores: number | null;
  Tech_Scores: number | null;
  Innov_Scores: number | null;
  Completeness_Scores: number | null;
  password: string;
};

const emptyForm: SubmissionRecord = {
  teamID: "",
  Team_Name: "",
  Problem_Statement: "",
  Repo_URL: "",
  Progress: "queued",
  Total_Scores: null,
  Tech_Scores: null,
  Innov_Scores: null,
  Completeness_Scores: null,
  password: "",
};

const asString = (value: unknown) => (typeof value === "string" ? value : "");
const asNumberOrNull = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
};

const toSubmissionRecord = (row: Record<string, unknown>): SubmissionRecord => ({
  teamID: asString(row.teamID),
  Team_Name: asString(row.Team_Name),
  Problem_Statement: asString(row.Problem_Statement),
  Repo_URL: asString(row.Repo_URL),
  Progress: asString(row.Progress) || "queued",
  Total_Scores: asNumberOrNull(row.Total_Scores),
  Tech_Scores: asNumberOrNull(row.Tech_Scores),
  Innov_Scores: asNumberOrNull(row.Innov_Scores),
  Completeness_Scores: asNumberOrNull(row.Completeness_Scores),
  password: asString(row.password),
});

const OriginAdmin = () => {
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SubmissionRecord>(emptyForm);
  const [newForm, setNewForm] = useState<SubmissionRecord>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [marksSort, setMarksSort] = useState<"none" | "asc" | "desc">("none");
  const [problemSort, setProblemSort] = useState<"none" | "asc" | "desc">("none");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (username.trim() === ADMIN_USERNAME && loginPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError("");
      if (typeof window !== "undefined") {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      }
      return;
    }

    setAuthError("Invalid admin username or password.");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername("");
    setLoginPassword("");
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadSubmissions = async () => {
      if (mounted) {
        setLoading(true);
        setError("");
      }

      const { data, error: fetchError } = await supabase
        .from("submissions")
        .select("teamID, Team_Name, Problem_Statement, Repo_URL, Progress, Total_Scores, Tech_Scores, Innov_Scores, Completeness_Scores, password")
        .limit(500);

      if (!mounted) return;

      if (fetchError) {
        setError(fetchError.message || "Failed to load submissions.");
        setLoading(false);
        return;
      }

      setSubmissions((data || []).map((row) => toSubmissionRecord(row as Record<string, unknown>)));
      setLoading(false);
    };

    loadSubmissions();

    const channel = supabase
      .channel("origin-admin-submissions-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, loadSubmissions)
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const completed = submissions.filter((row) => row.Progress.toLowerCase() === "completed").length;
    const queued = submissions.filter((row) => row.Progress.toLowerCase() === "queued").length;
    return { total, completed, queued };
  }, [submissions]);

  const sortedSubmissions = useMemo(() => {
    const rows = [...submissions];

    const compareScore = (left: SubmissionRecord, right: SubmissionRecord) => {
      if (marksSort === "none") return 0;
      return marksSort === "desc"
        ? (right.Total_Scores ?? -Infinity) - (left.Total_Scores ?? -Infinity)
        : (left.Total_Scores ?? Infinity) - (right.Total_Scores ?? Infinity);
    };

    const compareProblem = (left: SubmissionRecord, right: SubmissionRecord) => {
      if (problemSort === "none") return 0;
      const leftProblem = left.Problem_Statement.trim().toLowerCase();
      const rightProblem = right.Problem_Statement.trim().toLowerCase();
      return problemSort === "asc"
        ? leftProblem.localeCompare(rightProblem)
        : rightProblem.localeCompare(leftProblem);
    };

    rows.sort((left, right) => {
      if (problemSort !== "none" && marksSort !== "none") {
        const problemCompare = compareProblem(left, right);
        if (problemCompare !== 0) return problemCompare;
        return compareScore(left, right);
      }

      if (problemSort !== "none") {
        return compareProblem(left, right);
      }

      if (marksSort !== "none") {
        return compareScore(left, right);
      }

      return left.teamID.localeCompare(right.teamID);
    });

    return rows;
  }, [submissions, marksSort, problemSort]);

  const onEditChange = (field: keyof SubmissionRecord, value: string) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: field.includes("Scores") ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const onNewChange = (field: keyof SubmissionRecord, value: string) => {
    setNewForm((prev) => ({
      ...prev,
      [field]: field.includes("Scores") ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const startEdit = (row: SubmissionRecord) => {
    setEditingTeamId(row.teamID);
    setEditForm({ ...row });
  };

  const cancelEdit = () => {
    setEditingTeamId(null);
    setEditForm(emptyForm);
  };

  const saveEdit = async () => {
    if (!editingTeamId) return;
    if (!editForm.teamID.trim()) {
      setError("Team ID cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");

    const { error: updateError } = await supabase
      .from("submissions")
      .update({
        teamID: editForm.teamID.trim(),
        Team_Name: editForm.Team_Name.trim(),
        Problem_Statement: editForm.Problem_Statement.trim(),
        Repo_URL: editForm.Repo_URL.trim(),
        Progress: editForm.Progress.trim().toLowerCase() === "completed" ? "completed" : "queued",
        Total_Scores: editForm.Total_Scores,
        Tech_Scores: editForm.Tech_Scores,
        Innov_Scores: editForm.Innov_Scores,
        Completeness_Scores: editForm.Completeness_Scores,
        password: editForm.password,
      })
      .eq("teamID", editingTeamId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message || "Failed to update row.");
      return;
    }

    setEditingTeamId(null);
  };

  const addRow = async () => {
    if (!newForm.teamID.trim()) {
      setError("Team ID is required for adding a row.");
      return;
    }

    setSaving(true);
    setError("");

    const { error: insertError } = await supabase
      .from("submissions")
      .insert({
        teamID: newForm.teamID.trim(),
        Team_Name: newForm.Team_Name.trim(),
        Problem_Statement: newForm.Problem_Statement.trim(),
        Repo_URL: newForm.Repo_URL.trim(),
        Progress: newForm.Progress.trim().toLowerCase() === "completed" ? "completed" : "queued",
        Total_Scores: newForm.Total_Scores,
        Tech_Scores: newForm.Tech_Scores,
        Innov_Scores: newForm.Innov_Scores,
        Completeness_Scores: newForm.Completeness_Scores,
        password: newForm.password,
      });

    setSaving(false);

    if (insertError) {
      setError(insertError.message || "Failed to add row.");
      return;
    }

    setNewForm(emptyForm);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <form onSubmit={handleLogin} autoComplete="off" className="w-full max-w-md rounded-2xl border border-border/70 bg-card/50 p-8">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Origin Admin</p>
          <h1 className="mt-2 text-3xl font-black">Admin Authentication</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to access the admin panel.</p>

          <div className="mt-6 space-y-3">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              autoComplete="off"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            {authError && <p className="text-xs text-destructive">{authError}</p>}
            <button type="submit" className="w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
              Sign In
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-5 py-10 md:px-8">
      <div className="mx-auto w-full max-w-[1400px] space-y-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border/70 bg-card/50 p-6 backdrop-blur-sm"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Origin Admin</p>
          <h1 className="mt-2 text-3xl font-black md:text-5xl">Full Access Control Panel</h1>
          <p className="mt-2 text-sm text-muted-foreground">Edit, add, and manage every submissions field directly.</p>
          <div className="mt-4">
            <button onClick={handleLogout} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-card">
              Logout
            </button>
          </div>
        </motion.header>

        {error && <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Total Rows", value: stats.total, tone: "text-cyan-300" },
            { label: "Completed", value: stats.completed, tone: "text-emerald-300" },
            { label: "Queued", value: stats.queued, tone: "text-amber-300" },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-border/70 bg-card/40 p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{card.label}</p>
              <p className={`mt-2 text-3xl font-extrabold ${card.tone}`}>{card.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border/70 bg-card/40 p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">Add New Row</p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Sort by</span>
              <select
                value={marksSort}
                onChange={(e) => setMarksSort(e.target.value as typeof marksSort)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="desc">Marks: High to Low</option>
                <option value="asc">Marks: Low to High</option>
                <option value="none">Marks: None</option>
              </select>
              <select
                value={problemSort}
                onChange={(e) => setProblemSort(e.target.value as typeof problemSort)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="asc">Problem Statement: A to Z</option>
                <option value="desc">Problem Statement: Z to A</option>
                <option value="none">Problem Statement: None</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <input value={newForm.teamID} onChange={(e) => onNewChange("teamID", e.target.value)} placeholder="Team ID" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input value={newForm.Team_Name} onChange={(e) => onNewChange("Team_Name", e.target.value)} placeholder="Team Name" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input value={newForm.password} onChange={(e) => onNewChange("password", e.target.value)} placeholder="Password" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <select value={newForm.Progress} onChange={(e) => onNewChange("Progress", e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="queued">queued</option>
              <option value="completed">completed</option>
            </select>
            <input value={newForm.Repo_URL} onChange={(e) => onNewChange("Repo_URL", e.target.value)} placeholder="Repo URL" className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2" />
            <input value={newForm.Total_Scores ?? ""} onChange={(e) => onNewChange("Total_Scores", e.target.value)} placeholder="Total Score" className="rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <button onClick={addRow} disabled={saving} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Add Row</button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/40">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px]">
              <thead>
                <tr className="border-b border-border/70 bg-card/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Team ID</th>
                  <th className="px-4 py-3">Team Name</th>
                  <th className="px-4 py-3">Hackathon</th>
                  <th className="px-4 py-3">Repo URL</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total Score</th>
                  <th className="px-4 py-3">Password</th>
                  <th className="px-4 py-3">Problem Statement</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">Loading submissions...</td>
                  </tr>
                )}

                {!loading && sortedSubmissions.map((row) => {
                  const submitted = row.Repo_URL.trim().length > 0;
                  const statusLabel = submitted ? "Completed" : "In Progress";
                  const statusClass = submitted ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-300";
                  const isEditing = editingTeamId === row.teamID;

                  return (
                    <tr key={row.teamID} className="border-b border-border/60 text-sm hover:bg-card/60">
                      <td className="px-4 py-3">
                        {isEditing ? <input value={editForm.teamID} onChange={(e) => onEditChange("teamID", e.target.value)} className="w-full rounded border border-border bg-background px-2 py-1" /> : row.teamID}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? <input value={editForm.Team_Name} onChange={(e) => onEditChange("Team_Name", e.target.value)} className="w-full rounded border border-border bg-background px-2 py-1" /> : row.Team_Name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">ORIGIN SIMATS</td>
                      <td className="px-4 py-3">
                        {isEditing ? <input value={editForm.Repo_URL} onChange={(e) => onEditChange("Repo_URL", e.target.value)} className="w-full rounded border border-border bg-background px-2 py-1" /> : (row.Repo_URL || "-")}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select value={editForm.Progress} onChange={(e) => onEditChange("Progress", e.target.value)} className="w-full rounded border border-border bg-background px-2 py-1">
                            <option value="queued">queued</option>
                            <option value="completed">completed</option>
                          </select>
                        ) : (
                          row.Progress || "queued"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>{statusLabel}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {isEditing ? <input value={editForm.Total_Scores ?? ""} onChange={(e) => onEditChange("Total_Scores", e.target.value)} className="w-24 rounded border border-border bg-background px-2 py-1 text-right" /> : (row.Total_Scores !== null ? row.Total_Scores.toFixed(1) : "-")}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? <input value={editForm.password} onChange={(e) => onEditChange("password", e.target.value)} className="w-full rounded border border-border bg-background px-2 py-1" /> : row.password}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? <input value={editForm.Problem_Statement} onChange={(e) => onEditChange("Problem_Statement", e.target.value)} className="w-full rounded border border-border bg-background px-2 py-1" /> : row.Problem_Statement}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={saveEdit} disabled={saving} className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50">Save</button>
                            <button onClick={cancelEdit} className="rounded bg-muted px-2 py-1 text-xs font-semibold text-foreground">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(row)} className="rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">Edit</button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!loading && sortedSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">No submissions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default OriginAdmin;
