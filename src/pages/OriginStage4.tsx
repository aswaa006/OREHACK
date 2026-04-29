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
  score: number | null;
  generated_at: string | null;
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
            .from("evaluation_reports")
            .select("submission_id, score, generated_at")
            .in("submission_id", submissionIds)
            .order("generated_at", { ascending: false })
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
        Total_Scores: toNumberOrNull(score?.score) ?? toNumberOrNull(row.Total_Scores),
        Tech_Scores: toNumberOrNull(row.Tech_Scores),
        Innov_Scores: toNumberOrNull(row.Innov_Scores),
        Completeness_Scores: toNumberOrNull(row.Completeness_Scores),
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
      .on("postgres_changes", { event: "*", schema: "public", table: "evaluation_reports" }, refresh)
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
        .from("evaluation_reports")
        .insert(
          {
            submission_id: editingRowId,
            score: editForm.Total_Scores,
            generated_at: new Date().toISOString(),
            report_json: {
              technical: editForm.Tech_Scores,
              innovation: editForm.Innov_Scores,
              completeness: editForm.Completeness_Scores,
            },
          },
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
        .from("evaluation_reports")
        .insert(
          {
            submission_id: insertedSubmission.id,
            score: newForm.Total_Scores,
            generated_at: new Date().toISOString(),
            report_json: {
              technical: newForm.Tech_Scores,
              innovation: newForm.Innov_Scores,
              completeness: newForm.Completeness_Scores,
            },
          },
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
    <div style={{ minHeight: "100vh", background: "#000000", color: "#f1f5f9", padding: "2.5rem 2rem" }}>
      <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1rem", padding: "1.75rem 2rem" }}
        >
          {/* Breadcrumb - Font 1 size +3 */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: "'Outfit', sans-serif", fontWeight: 600, letterSpacing: "-0.05em", fontSize: "1.2rem", color: "rgba(255,255,255,0.35)", marginBottom: "0.75rem" }}>
            <button onClick={() => navigate("/orehackproject1924")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontFamily: "inherit", fontSize: "inherit", padding: 0, transition: "color 0.2s" }}>Dashboard</button>
            <span>/</span>
            <button onClick={() => navigate("/orehackproject1924/panel")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)", fontFamily: "inherit", fontSize: "inherit", padding: 0, transition: "color 0.2s" }}>Stages</button>
            <span>/</span>
            <span style={{ color: "#a78bfa" }}>Stage 4 — Reports</span>
          </div>

          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: "1.1rem", color: "#ffffff", marginBottom: "0.35rem" }}>Stage 4</p>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontWeight: 500, fontSize: "2.6rem", margin: "0 0 0.4rem", color: "#7c3aed" }}>Reports and Data Engine</h1>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400, fontSize: "1.05rem", color: "rgba(255,255,255,0.38)", margin: "0 0 1.25rem" }}>
            Live normalized data view for teams, submissions, and score sheets.
            <br />
            <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Managing: {managedHackathon ? `${managedHackathon.name} (${managedHackathon.slug})` : "No active hackathon"}</span>
          </p>
          <button
            onClick={() => navigate("/orehackproject1924/panel")}
            style={{ fontFamily: "'Playfair Display', serif", background: "#ffffff", border: "1px solid #ffffff", borderRadius: "0.5rem", padding: "0.6rem 1.1rem", color: "#000000", fontSize: "0.95rem", cursor: "pointer", transition: "all 0.2s ease" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#e5e5e5"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
          >
            ← Back to Stages
          </button>
        </motion.div>

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <section style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
          {[
            { label: "Total Rows", value: stats.total },
            { label: "Completed", value: stats.completed },
            { label: "Queued", value: stats.queued },
          ].map((card) => (
            <div key={card.label} style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1rem", padding: "1.25rem" }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#a78bfa", margin: 0 }}>{card.label}</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", color: "#ffffff", margin: "0.5rem 0 0" }}>{card.value}</p>
            </div>
          ))}
        </section>

        <section style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "1rem", padding: "1rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "0.75rem", marginBottom: "1rem" }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "1.1rem", fontWeight: 600, color: "#ffffff", margin: 0 }}>Add New Row / Sort</p>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(255,255,255,0.5)" }}>Sort by</span>
              <select
                value={marksSort}
                onChange={(e) => setMarksSort(e.target.value as typeof marksSort)}
                style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", padding: "0.4rem 0.6rem", color: "#ffffff", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", outline: "none" }}
              >
                <option value="desc">Marks: High to Low</option>
                <option value="asc">Marks: Low to High</option>
                <option value="none">Marks: None</option>
              </select>
              <select
                value={problemSort}
                onChange={(e) => setProblemSort(e.target.value as typeof problemSort)}
                style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", padding: "0.4rem 0.6rem", color: "#ffffff", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.85rem", outline: "none" }}
              >
                <option value="asc">Problem Statement: A to Z</option>
                <option value="desc">Problem Statement: Z to A</option>
                <option value="none">Problem Statement: None</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gap: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
            <input value={newForm.teamID} onChange={(e) => onNewChange("teamID", e.target.value)} placeholder="Team ID" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem", outline: "none" }} />
            <input value={newForm.Team_Name} onChange={(e) => onNewChange("Team_Name", e.target.value)} placeholder="Team Name" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem", outline: "none" }} />
            <select value={newForm.Progress} onChange={(e) => onNewChange("Progress", e.target.value)} style={{ background: "#000000", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem", outline: "none" }}>
              <option value="queued">queued</option>
              <option value="completed">completed</option>
            </select>
            <input value={newForm.Repo_URL} onChange={(e) => onNewChange("Repo_URL", e.target.value)} placeholder="Repo URL" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem", outline: "none" }} />
            <input value={newForm.Total_Scores ?? ""} onChange={(e) => onNewChange("Total_Scores", e.target.value)} placeholder="Total Score" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.5rem", padding: "0.5rem 0.75rem", color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: "0.85rem", outline: "none" }} />
            <button
              onClick={addRow}
              disabled={saving}
              style={{ background: "#ffffff", color: "#000000", border: "1px solid #ffffff", borderRadius: "0.5rem", padding: "0.5rem 1rem", fontFamily: "'Playfair Display', serif", fontSize: "0.95rem", cursor: saving ? "not-allowed" : "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { if(!saving) (e.currentTarget as HTMLButtonElement).style.background = "#e5e5e5"; }}
              onMouseLeave={e => { if(!saving) (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
            >
              Add Row
            </button>
          </div>
        </section>

        <section style={{ overflow: "hidden", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.07)", background: "#000000" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "1650px", tableLayout: "fixed", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", textAlign: "left", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#ffffff", fontFamily: "'JetBrains Mono', monospace" }}>
                  <th style={{ width: "120px", padding: "1rem" }}>Team ID</th>
                  <th style={{ width: "200px", padding: "1rem" }}>Team Name</th>
                  <th style={{ width: "220px", padding: "1rem" }}>Repo URL</th>
                  <th style={{ width: "110px", padding: "1rem" }}>Progress</th>
                  <th style={{ width: "100px", padding: "1rem", textAlign: "right" }}>Tech</th>
                  <th style={{ width: "100px", padding: "1rem", textAlign: "right" }}>Innovation</th>
                  <th style={{ width: "120px", padding: "1rem", textAlign: "right" }}>Completeness</th>
                  <th style={{ width: "110px", padding: "1rem", textAlign: "right" }}>Total</th>
                  <th style={{ minWidth: "300px", padding: "1rem" }}>Problem Statement</th>
                  <th style={{ width: "120px", padding: "1rem", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={10} style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif" }}>
                      Loading submissions...
                    </td>
                  </tr>
                )}

                {!loading && sortedSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={10} style={{ padding: "2rem", textAlign: "center", color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif" }}>
                      No submissions found
                    </td>
                  </tr>
                )}

                {!loading && sortedSubmissions.map((row) => {
                  const isEditing = editingRowId === row.id;
                  const submitted = row.Repo_URL.trim().length > 0;
                  const statusLabel = submitted ? "Completed" : "In Progress";
                  const statusBg = submitted ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)";
                  const statusColor = "#ffffff";

                  return (
                    <tr key={row.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", fontSize: "1.15rem", fontFamily: "'JetBrains Mono', monospace", color: "#ffffff", transition: "background 0.2s" }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {isEditing ? (
                          <input
                            value={editForm.teamID}
                            onChange={(e) => onEditChange("teamID", e.target.value)}
                            style={{ width: "100%", background: "#000000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.25rem", padding: "0.25rem 0.5rem", color: "#fff", outline: "none" }}
                          />
                        ) : (
                          row.teamID
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {isEditing ? (
                          <input
                            value={editForm.Team_Name}
                            onChange={(e) => onEditChange("Team_Name", e.target.value)}
                            style={{ width: "100%", background: "#000000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.25rem", padding: "0.25rem 0.5rem", color: "#fff", outline: "none" }}
                          />
                        ) : (
                          <div style={{ width: "180px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.Team_Name}>{row.Team_Name || "-"}</div>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {isEditing ? (
                          <input
                            value={editForm.Repo_URL}
                            onChange={(e) => onEditChange("Repo_URL", e.target.value)}
                            style={{ width: "100%", background: "#000000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.25rem", padding: "0.25rem 0.5rem", color: "#fff", outline: "none" }}
                          />
                        ) : (
                          <div style={{ width: "200px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.Repo_URL}>{row.Repo_URL || "-"}</div>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {isEditing ? (
                          <select
                            value={editForm.Progress}
                            onChange={(e) => onEditChange("Progress", e.target.value)}
                            style={{ width: "100%", background: "#000000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.25rem", padding: "0.25rem 0.5rem", color: "#fff", outline: "none" }}
                          >
                            <option value="queued">queued</option>
                            <option value="completed">completed</option>
                          </select>
                        ) : (
                          <span style={{ display: "inline-block", borderRadius: "9999px", padding: "0.25rem 0.6rem", fontSize: "0.95rem", fontWeight: 600, background: statusBg, color: statusColor }}>{statusLabel}</span>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                        {isEditing ? (
                          <input
                            value={editForm.Tech_Scores ?? ""}
                            onChange={(e) => onEditChange("Tech_Scores", e.target.value)}
                            style={{ width: "80px", background: "#000000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.25rem", padding: "0.25rem 0.5rem", color: "#fff", outline: "none", textAlign: "right" }}
                          />
                        ) : (
                          row.Tech_Scores ?? "-"
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                        {isEditing ? (
                          <input
                            value={editForm.Innov_Scores ?? ""}
                            onChange={(e) => onEditChange("Innov_Scores", e.target.value)}
                            style={{ width: "80px", background: "#000000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.25rem", padding: "0.25rem 0.5rem", color: "#fff", outline: "none", textAlign: "right" }}
                          />
                        ) : (
                          row.Innov_Scores ?? "-"
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                        {isEditing ? (
                          <input
                            value={editForm.Completeness_Scores ?? ""}
                            onChange={(e) => onEditChange("Completeness_Scores", e.target.value)}
                            style={{ width: "90px", background: "#000000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.25rem", padding: "0.25rem 0.5rem", color: "#fff", outline: "none", textAlign: "right" }}
                          />
                        ) : (
                          row.Completeness_Scores ?? "-"
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 600 }}>
                        {isEditing ? (
                          <input
                            value={editForm.Total_Scores ?? ""}
                            onChange={(e) => onEditChange("Total_Scores", e.target.value)}
                            style={{ width: "90px", background: "#000000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.25rem", padding: "0.25rem 0.5rem", color: "#fff", outline: "none", textAlign: "right" }}
                          />
                        ) : row.Total_Scores !== null ? (
                          row.Total_Scores.toFixed(1)
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        {isEditing ? (
                          <textarea
                            value={editForm.Problem_Statement}
                            onChange={(e) => onEditChange("Problem_Statement", e.target.value)}
                            style={{ minHeight: "60px", width: "100%", background: "#000000", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "0.25rem", padding: "0.25rem 0.5rem", color: "#fff", outline: "none", fontSize: "0.75rem", fontFamily: "inherit" }}
                          />
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                            <span style={{ display: "block", maxWidth: "280px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.75rem", fontStyle: "italic", color: "rgba(255,255,255,0.5)" }}>
                              {row.Problem_Statement || "No statement provided"}
                            </span>
                            <button
                              onClick={() => setViewingProblem(row.Problem_Statement)}
                              style={{ flexShrink: 0, borderRadius: "0.35rem", background: "rgba(255,255,255,0.05)", padding: "0.35rem 0.5rem", color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", cursor: "pointer", border: "none", transition: "all 0.2s" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(167,139,250,0.2)"; (e.currentTarget as HTMLButtonElement).style.color = "#a78bfa"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; }}
                            >
                              View
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button
                              onClick={saveEdit}
                              disabled={saving}
                              style={{ borderRadius: "0.25rem", background: "#ffffff", border: "1px solid #ffffff", padding: "0.25rem 0.5rem", fontSize: "0.75rem", fontWeight: 600, color: "#000000", cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Playfair Display', serif" }}
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{ borderRadius: "0.25rem", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", padding: "0.25rem 0.5rem", fontSize: "0.75rem", fontWeight: 600, color: "#ffffff", cursor: "pointer", fontFamily: "'Playfair Display', serif" }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEdit(row)}
                            style={{ borderRadius: "0.25rem", background: "#ffffff", border: "1px solid #ffffff", padding: "0.25rem 0.5rem", fontSize: "0.75rem", fontWeight: 600, color: "#000000", cursor: "pointer", fontFamily: "'Playfair Display', serif" }}
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        </section>
      </div>

      {viewingProblem !== null && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setViewingProblem(null)}
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            style={{ position: "relative", display: "flex", flexDirection: "column", maxHeight: "85vh", width: "100%", maxWidth: "42rem", overflow: "hidden", borderRadius: "1.5rem", border: "1px solid rgba(255,255,255,0.07)", background: "#000000", boxShadow: "0 32px 64px -16px rgba(0,0,0,0.6)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "1.5rem" }}>
              <div>
                <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em", color: "#a78bfa", margin: 0 }}>Problem Concept</p>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, margin: "0.25rem 0 0", color: "#ffffff" }}>Detailed Statement</h3>
              </div>
              <button
                onClick={() => setViewingProblem(null)}
                style={{ borderRadius: "9999px", background: "rgba(255,255,255,0.05)", padding: "0.5rem", color: "rgba(255,255,255,0.5)", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "#ffffff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; }}
              >
                Close
              </button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
              <p style={{ fontFamily: "'Outfit', sans-serif", whiteSpace: "pre-wrap", fontSize: "1rem", fontWeight: 400, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", margin: 0 }}>
                {viewingProblem || "No statement content available."}
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)", padding: "1.25rem" }}>
              <button
                onClick={() => setViewingProblem(null)}
                style={{ borderRadius: "0.75rem", background: "#ffffff", padding: "0.6rem 1.5rem", fontSize: "0.875rem", fontWeight: 700, color: "#000000", border: "1px solid #ffffff", fontFamily: "'Playfair Display', serif", cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#e5e5e5"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#ffffff"; }}
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
