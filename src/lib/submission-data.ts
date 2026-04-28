import { supabase } from "@/lib/supabase";

export type SubmissionStatus = "queued" | "evaluated" | "rejected";

export type NormalizedSubmission = {
  id: string;
  team_id: string;
  team_name: string | null;
  repository_url: string;
  submitted_at: string;
  score: number | null;
  status: SubmissionStatus;
  final_score: number | null;
  max_total: number | null;
  technical_score: number | null;
  max_technical: number | null;
  innovation_score: number | null;
  max_innovation: number | null;
  completeness_score: number | null;
  max_completeness: number | null;
  technical_breakdown: Record<string, number> | null;
  innovation_breakdown: Record<string, number> | null;
  completeness_breakdown: Record<string, number> | null;
  evaluation_timestamp: string | null;
};

type SubmissionRow = {
  id: string | number | null;
  team_id: string | null;
  teamID: string | null;
  TeamID: string | null;
  Team_Name: string | null;
  Repo_URL: string | null;
  Progress: string | null;
  Total_Scores: number | null;
  Tech_Scores: number | null;
  Innov_Scores: number | null;
  Completeness_Scores: number | null;
  submitted_at: string | null;
  created_at: string | null;
};

type TeamRow = {
  id: string;
  team_code: string | null;
  team_name: string | null;
};

type ScoreRow = {
  submission_id: string;
  final_score: number | null;
  max_total: number | null;
  technical_score: number | null;
  max_technical: number | null;
  innovation_score: number | null;
  max_innovation: number | null;
  completeness_score: number | null;
  max_completeness: number | null;
  evaluation_timestamp: string | null;
};

function normalizeStatus(value: unknown, hasScore: boolean): SubmissionStatus {
  const raw = typeof value === "string" ? value.toLowerCase().trim() : "";
  if (raw === "evaluated" || raw === "rejected") {
    return raw;
  }
  if (hasScore) {
    return "evaluated";
  }
  return "queued";
}

export async function loadNormalizedSubmissions(options?: {
  hackathonId?: string;
  limit?: number;
}): Promise<{ data: NormalizedSubmission[]; error: string | null }> {
  const limit = options?.limit ?? 200;

  let query = supabase
    .from("submissions")
    .select("id, team_id, teamID, TeamID, Team_Name, Repo_URL, Progress, Total_Scores, Tech_Scores, Innov_Scores, Completeness_Scores, submitted_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.hackathonId) {
    query = query.eq("hackathon_id", options.hackathonId);
  }

  const { data: submissions, error: submissionsError } = await query;

  if (submissionsError) {
    return { data: [], error: submissionsError.message || "Failed to load submissions." };
  }

  const rows = (submissions || []) as SubmissionRow[];
  const teamIds = Array.from(new Set(rows.map((row) => row.team_id).filter((value): value is string => Boolean(value))));
  const submissionIds = Array.from(new Set(rows.map((row) => row.id).filter((value): value is string | number => value !== null))).map(String);

  const teamById = new Map<string, TeamRow>();
  if (teamIds.length) {
    const { data: teamsData } = await supabase
      .from("teams")
      .select("id, team_code, team_name")
      .in("id", teamIds);

    for (const team of (teamsData || []) as TeamRow[]) {
      teamById.set(String(team.id), team);
    }
  }

  const scoreBySubmission = new Map<string, ScoreRow>();
  if (submissionIds.length) {
    const { data: scoreData } = await supabase
      .from("submission_scores")
      .select("submission_id, final_score, max_total, technical_score, max_technical, innovation_score, max_innovation, completeness_score, max_completeness, evaluation_timestamp")
      .in("submission_id", submissionIds);

    for (const score of (scoreData || []) as ScoreRow[]) {
      scoreBySubmission.set(String(score.submission_id), score);
    }
  }

  const normalized = rows.map((row, index): NormalizedSubmission => {
    const submissionId = String(row.id ?? row.teamID ?? row.TeamID ?? index);
    const team = row.team_id ? teamById.get(String(row.team_id)) : undefined;
    const score = scoreBySubmission.get(submissionId);

    const finalScore = score?.final_score ?? row.Total_Scores ?? null;
    const technical = score?.technical_score ?? row.Tech_Scores ?? null;
    const innovation = score?.innovation_score ?? row.Innov_Scores ?? null;
    const completeness = score?.completeness_score ?? row.Completeness_Scores ?? null;
    const hasScoring = [finalScore, technical, innovation, completeness].some((value) => value !== null);

    return {
      id: submissionId,
      team_id: String(row.teamID ?? row.TeamID ?? team?.team_code ?? row.team_id ?? submissionId),
      team_name: row.Team_Name ?? team?.team_name ?? null,
      repository_url: row.Repo_URL ?? "",
      submitted_at: row.submitted_at ?? row.created_at ?? "",
      score: finalScore,
      status: normalizeStatus(row.Progress, hasScoring),
      final_score: finalScore,
      max_total: score?.max_total ?? 100,
      technical_score: technical,
      max_technical: score?.max_technical ?? 65,
      innovation_score: innovation,
      max_innovation: score?.max_innovation ?? 25,
      completeness_score: completeness,
      max_completeness: score?.max_completeness ?? 10,
      technical_breakdown: null,
      innovation_breakdown: null,
      completeness_breakdown: null,
      evaluation_timestamp: score?.evaluation_timestamp ?? null,
    };
  });

  return { data: normalized, error: null };
}
