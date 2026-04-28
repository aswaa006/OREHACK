import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { resolveHackathonBySlug } from "@/lib/event-db";
import { supabase } from "@/lib/supabase";

const ADMIN_SESSION_KEY = "orehack_origin_admin_auth";
const HACKATHON_SLUG_CANDIDATES = ["origin-2k26", "origin-2k25"];

type SubmissionRecord = {
  id: string;
  hackathonId: string;
  teamDbId: string | null;
  teamID: string;
  Team_Name: string;
  Problem_Statement: string;
  Repo_URL: string;
  Progress: string;
  Total_Scores: number | null;
  Tech_Scores: number | null;
  Innov_Scores: number | null;
  Completeness_Scores: number | null;
};

type HackathonRef = {
  id: string;
  slug: string;
  name: string;
};

type SubmissionRow = {
  id: string;
  hackathon_id: string;
  team_id: string | null;
  teamID: string | null;
  TeamID: string | null;
  Team_Name: string | null;
  Problem_Statement: string | null;
  Repo_URL: string | null;
  Progress: string | null;
  Total_Scores: number | null;
  Tech_Scores: number | null;
  Innov_Scores: number | null;
  Completeness_Scores: number | null;
};

type TeamRow = {
  id: string;
  team_code: string | null;
  team_name: string | null;
};

type ScoreRow = {
  submission_id: string;
  final_score: number | null;
  tech_score: number | null;
  innovation_score: number | null;
  completeness_score: number | null;
};

const emptyForm: SubmissionRecord = {
  id: "",
  hackathonId: "",
  teamDbId: null,
  teamID: "",
  Team_Name: "",
  Problem_Statement: "",
  Repo_URL: "",
  Progress: "queued",
  Total_Scores: null,
  Tech_Scores: null,
  Innov_Scores: null,
  Completeness_Scores: null,
};

const toNumberOrNull = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
};

const normalizeProgress = (value: string) =>
  value.trim().toLowerCase() === "completed" ? "completed" : "queued";

const OriginStage4 = () => {
  const navigate = useNavigate();
  const isAuthenticated =
    typeof window !== "undefined" &&
    sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";

  const [managedHackathon, setManagedHackathon] = useState<HackathonRef | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SubmissionRecord>(emptyForm);
  const [newForm, setNewForm] = useState<SubmissionRecord>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [marksSort, setMarksSort] = useState<"none" | "asc" | "desc">("none");
  const [problemSort, setProblemSort] = useState<"none" | "asc" | "desc">("none");
  const [viewingProblem, setViewingProblem] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate("/orehackproject1924");
  }, [isAuthenticated, navigate]);

  const resolveManagedHackathon = useCallback(async (): Promise<HackathonRef | null> => {
    for (const slug of HACKATHON_SLUG_CANDIDATES) {
      const { data } = await resolveHackathonBySlug(slug);
      if (data) {
        return {
          id: data.id,
          slug: data.slug,
          name: data.name,
        };
      }
    }

    const { data: fallback } = await supabase
      .from("hackathons")
      .select("id, slug, name")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle<{ id: string; slug: string; name: string }>();

    if (!fallback) return null;
    return {
      id: fallback.id,
      slug: fallback.slug,
      name: fallback.name,
    };
  }, []);

  const loadSubmissions = useCallback(async (withLoading = true) => {
    if (withLoading) setLoading(true);
    setError("");

    const hackathon = await resolveManagedHackathon();
    if (!hackathon) {
      setManagedHackathon(null);
      setSubmissions([]);
      if (withLoading) setLoading(false);
      return;
    }

    setManagedHackathon(hackathon);

    const { data: submissionRows, error: submissionError } = await supabase
      .from("submissions")
      .select(
        "id, hackathon_id, team_id, teamID, TeamID, Team_Name, Problem_Statement, Repo_URL, Progress, Total_Scores, Tech_Scores, Innov_Scores, Completeness_Scores",
      )
      .eq("hackathon_id", hackathon.id)
      .order("created_at", { ascending: false })
      .limit(500)
      .returns<SubmissionRow[]>();

    if (submissionError) {
      setError(submissionError.message || "Failed to load submissions.");
      if (withLoading) setLoading(false);
      return;
    }

    const rows = submissionRows || [];
    const submissionIds = rows.map((row) => row.id);
    const teamIds = [...new Set(rows.map((row) => row.team_id).filter((id): id is string => Boolean(id)))];

    const [teamsRes, scoresRes] = await Promise.all([
      teamIds.length > 0
        ? supabase
            .from("teams")
            .select("id, team_code, team_name")
            .in("id", teamIds)
            .returns<TeamRow[]>()
        : Promise.resolve({ data: [], error: null }),
      submissionIds.length > 0
        ? supabase
            .from("submission_scores")
            .select("submission_id, final_score, tech_score, innovation_score, completeness_score")
            .in("submission_id", submissionIds)
            .returns<ScoreRow[]>()
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (teamsRes.error) {
      setError(teamsRes.error.message || "Failed to load team metadata.");
      if (withLoading) setLoading(false);
      return;
    }

    if (scoresRes.error) {
      setError(scoresRes.error.message || "Failed to load score metadata.");
      if (withLoading) setLoading(false);
      return;
    }

    const teamById = new Map((teamsRes.data || []).map((team) => [team.id, team]));
    const scoreBySubmission = new Map((scoresRes.data || []).map((score) => [score.submission_id, score]));

    const mapped = rows.map((row): SubmissionRecord => {
      const team = row.team_id ? teamById.get(row.team_id) : undefined;
      const score = scoreBySubmission.get(row.id);

      const teamCode =
        (row.teamID || row.TeamID || team?.team_code || "").trim() || row.id.slice(0, 8);

      return {
        id: row.id,
        hackathonId: row.hackathon_id,
        teamDbId: row.team_id,
        teamID: teamCode,
        Team_Name: (row.Team_Name || team?.team_name || "").trim(),
        Problem_Statement: (row.Problem_Statement || "").trim(),
        Repo_URL: (row.Repo_URL || "").trim(),
        Progress: normalizeProgress(row.Progress || "queued"),
        Total_Scores: toNumberOrNull(score?.final_score) ?? toNumberOrNull(row.Total_Scores),
        Tech_Scores: toNumberOrNull(score?.tech_score) ?? toNumberOrNull(row.Tech_Scores),
        Innov_Scores: toNumberOrNull(score?.innovation_score) ?? toNumberOrNull(row.Innov_Scores),
        Completeness_Scores:
          toNumberOrNull(score?.completeness_score) ?? toNumberOrNull(row.Completeness_Scores),
      };
    });

    setSubmissions(mapped);
    if (withLoading) setLoading(false);
  }, [resolveManagedHackathon]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let mounted = true;
    const initialLoad = async () => {
      await loadSubmissions();
      if (!mounted) return;
    };

    void initialLoad();

    const refresh = () => {
      void loadSubmissions(false);
    };

    const channel = supabase
      .channel("origin-stage4-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "submission_scores" }, refresh)
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [isAuthenticated, loadSubmissions]);

  const stats = useMemo(() => {
    const total = submissions.length;
    const completed = submissions.filter((r) => r.Progress === "completed").length;
    const queued = submissions.filter((r) => r.Progress !== "completed").length;
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
      const lp = left.Problem_Statement.toLowerCase();
      const rp = right.Problem_Statement.toLowerCase();
      return problemSort === "asc" ? lp.localeCompare(rp) : rp.localeCompare(lp);
    };

    rows.sort((left, right) => {
      if (problemSort !== "none" && marksSort !== "none") {
        const byProblem = compareProblem(left, right);
        if (byProblem !== 0) return byProblem;
        return compareScore(left, right);
      }
      if (problemSort !== "none") return compareProblem(left, right);
      if (marksSort !== "none") return compareScore(left, right);
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
    setEditingRowId(row.id);
    setEditForm({ ...row });
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditForm(emptyForm);
  };

  const ensureTeamIdentity = useCallback(
    async (input: {
      currentTeamDbId: string | null;
      teamCode: string;
      teamName: string;
    }) => {
      if (!managedHackathon) {
        throw new Error("No managed hackathon selected.");
      }

      const teamCode = input.teamCode.trim();
      const teamName = input.teamName.trim();
      const payload: {
        team_code: teamCode,
        team_name: teamName,
        is_active: true,
      } = {
        team_code: teamCode,
        team_name: teamName,
        is_active: true,
      };

      if (input.currentTeamDbId) {
        const { error: updateError } = await supabase
          .from("teams")
          .update(payload)
          .eq("id", input.currentTeamDbId);

        if (updateError) {
          throw new Error(updateError.message || "Failed to update team identity.");
        }
        return input.currentTeamDbId;
      }

      const { data: existing, error: existingError } = await supabase
        .from("teams")
        .select("id")
        .eq("hackathon_id", managedHackathon.id)
        .eq("team_code", teamCode)
        .maybeSingle<{ id: string }>();

      if (existingError) {
        throw new Error(existingError.message || "Failed to verify existing team identity.");
      }

      if (existing?.id) {
        const { error: updateExistingError } = await supabase
          .from("teams")
          .update(payload)
          .eq("id", existing.id);

        if (updateExistingError) {
          throw new Error(updateExistingError.message || "Failed to update existing team identity.");
        }
        return existing.id;
      }

      const { data: inserted, error: insertError } = await supabase
        .from("teams")
        .insert({
          hackathon_id: managedHackathon.id,
          ...payload,
        })
        .select("id")
        .single<{ id: string }>();

      if (insertError || !inserted) {
        throw new Error(insertError?.message || "Failed to create team identity.");
      }

      return inserted.id;
    },
    [managedHackathon],
  );

  const saveEdit = async () => {
    if (!editingRowId) return;
    if (!editForm.teamID.trim()) {
      setError("Team ID cannot be empty.");
      return;
    }
    if (!managedHackathon) {
      setError("No active hackathon context was found.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const teamId = await ensureTeamIdentity({
        currentTeamDbId: editForm.teamDbId,
        teamCode: editForm.teamID,
        teamName: editForm.Team_Name,
      });

      const submissionPatch = {
        hackathon_id: managedHackathon.id,
        team_id: teamId,
        teamID: editForm.teamID.trim(),
        TeamID: editForm.teamID.trim(),
        Team_Name: editForm.Team_Name.trim(),
        Problem_Statement: editForm.Problem_Statement.trim(),
        Repo_URL: editForm.Repo_URL.trim(),
        Progress: normalizeProgress(editForm.Progress),
        Total_Scores: editForm.Total_Scores,
        Tech_Scores: editForm.Tech_Scores,
        Innov_Scores: editForm.Innov_Scores,
        Completeness_Scores: editForm.Completeness_Scores,
      };

      const { error: updateError } = await supabase
        .from("submissions")
        .update(submissionPatch)
        .eq("id", editingRowId);

      if (updateError) {
        throw new Error(updateError.message || "Failed to update submission row.");
      }

      const { error: scoreError } = await supabase
        .from("submission_scores")
        .upsert(
          {
            submission_id: editingRowId,
            final_score: editForm.Total_Scores,
            tech_score: editForm.Tech_Scores,
            innovation_score: editForm.Innov_Scores,
            completeness_score: editForm.Completeness_Scores,
            max_total_score: 100,
            max_tech_score: 100,
            max_innovation_score: 100,
            max_completeness_score: 100,
          },
          { onConflict: "submission_id" },
        );

      if (scoreError) {
        throw new Error(scoreError.message || "Failed to update submission score row.");
      }

      setEditingRowId(null);
      setEditForm(emptyForm);
      await loadSubmissions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update row.");
    } finally {
      setSaving(false);
    }
  };

  const addRow = async () => {
    if (!newForm.teamID.trim()) {
      setError("Team ID is required.");
      return;
    }
    if (!managedHackathon) {
      setError("No active hackathon context was found.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const teamId = await ensureTeamIdentity({
        currentTeamDbId: null,
        teamCode: newForm.teamID,
        teamName: newForm.Team_Name,
      });

      const { data: insertedSubmission, error: insertError } = await supabase
        .from("submissions")
        .upsert(
          {
            hackathon_id: managedHackathon.id,
            team_id: teamId,
            teamID: newForm.teamID.trim(),
            TeamID: newForm.teamID.trim(),
            Team_Name: newForm.Team_Name.trim(),
            Problem_Statement: newForm.Problem_Statement.trim(),
            Repo_URL: newForm.Repo_URL.trim(),
            Progress: normalizeProgress(newForm.Progress),
            Total_Scores: newForm.Total_Scores,
            Tech_Scores: newForm.Tech_Scores,
            Innov_Scores: newForm.Innov_Scores,
            Completeness_Scores: newForm.Completeness_Scores,
          },
          { onConflict: "team_id" },
        )
        .select("id")
        .single<{ id: string }>();

      if (insertError || !insertedSubmission) {
        throw new Error(insertError?.message || "Failed to add submission row.");
      }

      const { error: scoreError } = await supabase
        .from("submission_scores")
        .upsert(
          {
            submission_id: insertedSubmission.id,
            final_score: newForm.Total_Scores,
            tech_score: newForm.Tech_Scores,
            innovation_score: newForm.Innov_Scores,
            completeness_score: newForm.Completeness_Scores,
            max_total_score: 100,
            max_tech_score: 100,
            max_innovation_score: 100,
            max_completeness_score: 100,
          },
          { onConflict: "submission_id" },
        );

      if (scoreError) {
        throw new Error(scoreError.message || "Failed to add submission score row.");
      }

      setNewForm({ ...emptyForm, hackathonId: managedHackathon.id });
      await loadSubmissions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add row.");
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background px-5 py-10 text-foreground md:px-8">
      <div className="mx-auto w-full max-w-[1400px] space-y-8">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-border/70 bg-card/50 p-6 backdrop-blur-sm"
        >
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <button onClick={() => navigate("/orehackproject1924")} className="transition-colors hover:text-foreground">Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate("/orehackproject1924/panel")} className="transition-colors hover:text-foreground">Stages</button>
            <span>/</span>
            <span className="font-semibold text-primary">Stage 4 - Reports</span>
          </div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Stage 4</p>
          <h1 className="text-3xl font-black md:text-4xl">Reports and Data Engine</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live normalized data view for teams, submissions, and score sheets.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Managing: {managedHackathon ? `${managedHackathon.name} (${managedHackathon.slug})` : "No active hackathon"}
          </p>
          <div className="mt-4">
            <button
              onClick={() => navigate("/orehackproject1924/panel")}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-card"
            >
              Back to Stages
            </button>
          </div>
        </motion.header>

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

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
            <input
              value={newForm.teamID}
              onChange={(e) => onNewChange("teamID", e.target.value)}
              placeholder="Team ID"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <input
              value={newForm.Team_Name}
              onChange={(e) => onNewChange("Team_Name", e.target.value)}
              placeholder="Team Name"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <select
              value={newForm.Progress}
              onChange={(e) => onNewChange("Progress", e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="queued">queued</option>
              <option value="completed">completed</option>
            </select>
            <input
              value={newForm.Repo_URL}
              onChange={(e) => onNewChange("Repo_URL", e.target.value)}
              placeholder="Repo URL"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm md:col-span-2"
            />
            <input
              value={newForm.Total_Scores ?? ""}
              onChange={(e) => onNewChange("Total_Scores", e.target.value)}
              placeholder="Total Score"
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            />
            <button
              onClick={addRow}
              disabled={saving}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Add Row
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/40">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1650px] table-fixed">
              <thead>
                <tr className="border-b border-border/70 bg-card/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="w-[120px] px-4 py-3">Team ID</th>
                  <th className="w-[200px] px-4 py-3">Team Name</th>
                  <th className="w-[220px] px-4 py-3">Repo URL</th>
                  <th className="w-[110px] px-4 py-3">Progress</th>
                  <th className="w-[100px] px-4 py-3 text-right">Tech</th>
                  <th className="w-[100px] px-4 py-3 text-right">Innovation</th>
                  <th className="w-[120px] px-4 py-3 text-right">Completeness</th>
                  <th className="w-[110px] px-4 py-3 text-right">Total</th>
                  <th className="min-w-[300px] px-4 py-3">Problem Statement</th>
                  <th className="w-[120px] px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Loading submissions...
                    </td>
                  </tr>
                )}

                {!loading && sortedSubmissions.map((row) => {
                  const isEditing = editingRowId === row.id;
                  const submitted = row.Repo_URL.trim().length > 0;
                  const statusLabel = submitted ? "Completed" : "In Progress";
                  const statusClass = submitted
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/15 text-amber-300";

                  return (
                    <tr key={row.id} className="border-b border-border/60 text-sm hover:bg-card/60">
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editForm.teamID}
                            onChange={(e) => onEditChange("teamID", e.target.value)}
                            className="w-full rounded border border-border bg-background px-2 py-1"
                          />
                        ) : (
                          row.teamID
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editForm.Team_Name}
                            onChange={(e) => onEditChange("Team_Name", e.target.value)}
                            className="w-full rounded border border-border bg-background px-2 py-1"
                          />
                        ) : (
                          <div className="w-[180px] truncate" title={row.Team_Name}>{row.Team_Name || "-"}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input
                            value={editForm.Repo_URL}
                            onChange={(e) => onEditChange("Repo_URL", e.target.value)}
                            className="w-full rounded border border-border bg-background px-2 py-1"
                          />
                        ) : (
                          <div className="w-[200px] truncate" title={row.Repo_URL}>{row.Repo_URL || "-"}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            value={editForm.Progress}
                            onChange={(e) => onEditChange("Progress", e.target.value)}
                            className="w-full rounded border border-border bg-background px-2 py-1"
                          >
                            <option value="queued">queued</option>
                            <option value="completed">completed</option>
                          </select>
                        ) : (
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>{statusLabel}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            value={editForm.Tech_Scores ?? ""}
                            onChange={(e) => onEditChange("Tech_Scores", e.target.value)}
                            className="w-20 rounded border border-border bg-background px-2 py-1 text-right"
                          />
                        ) : (
                          row.Tech_Scores ?? "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            value={editForm.Innov_Scores ?? ""}
                            onChange={(e) => onEditChange("Innov_Scores", e.target.value)}
                            className="w-20 rounded border border-border bg-background px-2 py-1 text-right"
                          />
                        ) : (
                          row.Innov_Scores ?? "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <input
                            value={editForm.Completeness_Scores ?? ""}
                            onChange={(e) => onEditChange("Completeness_Scores", e.target.value)}
                            className="w-24 rounded border border-border bg-background px-2 py-1 text-right"
                          />
                        ) : (
                          row.Completeness_Scores ?? "-"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">
                        {isEditing ? (
                          <input
                            value={editForm.Total_Scores ?? ""}
                            onChange={(e) => onEditChange("Total_Scores", e.target.value)}
                            className="w-24 rounded border border-border bg-background px-2 py-1 text-right"
                          />
                        ) : row.Total_Scores !== null ? (
                          row.Total_Scores.toFixed(1)
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <textarea
                            value={editForm.Problem_Statement}
                            onChange={(e) => onEditChange("Problem_Statement", e.target.value)}
                            className="min-h-[60px] w-full rounded border border-border bg-background px-2 py-1 text-xs"
                          />
                        ) : (
                          <div className="group/problem flex items-center justify-between gap-3">
                            <span className="block max-w-[280px] truncate text-xs italic text-muted-foreground">
                              {row.Problem_Statement || "No statement provided"}
                            </span>
                            <button
                              onClick={() => setViewingProblem(row.Problem_Statement)}
                              className="shrink-0 rounded-md bg-white/5 p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-primary/20 hover:text-primary group-hover/problem:opacity-100"
                              title="Expand Problem Statement"
                            >
                              View
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              className="rounded bg-emerald-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="rounded bg-muted px-2 py-1 text-xs font-semibold text-foreground"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(row)}
                            className="rounded bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {!loading && sortedSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {viewingProblem !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setViewingProblem(null)}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border/80 bg-card shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between border-b border-border/40 p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">Problem Concept</p>
                <h3 className="mt-1 text-xl font-black">Detailed Statement</h3>
              </div>
              <button
                onClick={() => setViewingProblem(null)}
                className="rounded-full bg-white/5 p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8">
              <p className="whitespace-pre-wrap text-base font-medium leading-relaxed text-muted-foreground">
                {viewingProblem || "No statement content available."}
              </p>
            </div>
            <div className="flex justify-end border-t border-border/40 bg-card/30 p-5">
              <button
                onClick={() => setViewingProblem(null)}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-95"
              >
                Close View
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OriginStage4;
