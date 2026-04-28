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
  id: string;
  team_id: string;
  team_name: string | null;
  repository_url: string | null;
  status: string | null;
  final_score: number | null;
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
  submitted_at: string | null;
};

type TeamRow = {
  id: string;
  team_id: string | null;
  team_name: string | null;
};

type ScoreRow = {
  submission_id: string;
  score: number | null;
  generated_at: string | null;
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
    .select("id, team_id, team_name, repository_url, status, final_score, technical_score, max_technical, innovation_score, max_innovation, completeness_score, max_completeness, technical_breakdown, innovation_breakdown, completeness_breakdown, evaluation_timestamp, submitted_at")
    .order("submitted_at", { ascending: false })
    .limit(limit);

  if (options?.hackathonId) {
    query = query.eq("hackathon_slug", options.hackathonId);
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
      .select("id, team_id, team_name")
      .in("id", teamIds);

    for (const team of (teamsData || []) as TeamRow[]) {
      teamById.set(String(team.id), team);
    }
  }

  const scoreBySubmission = new Map<string, ScoreRow>();
  if (submissionIds.length) {
    const { data: scoreData } = await supabase
      .from("evaluation_reports")
      .select("submission_id, score, generated_at")
      .in("submission_id", submissionIds);

    for (const score of (scoreData || []) as ScoreRow[]) {
      scoreBySubmission.set(String(score.submission_id), score);
    }
  }

  const normalized = rows.map((row, index): NormalizedSubmission => {
    const submissionId = String(row.id ?? index);
    const team = row.team_id ? teamById.get(String(row.team_id)) : undefined;
    const score = scoreBySubmission.get(submissionId);

    const finalScore = row.final_score ?? score?.score ?? null;
    const technical = row.technical_score ?? null;
    const innovation = row.innovation_score ?? null;
    const completeness = row.completeness_score ?? null;
    const hasScoring = [finalScore, technical, innovation, completeness].some((value) => value !== null);

    return {
      id: submissionId,
      team_id: String(team?.team_id ?? row.team_id ?? submissionId),
      team_name: row.team_name ?? team?.team_name ?? null,
      repository_url: row.repository_url ?? "",
      submitted_at: row.submitted_at ?? "",
      score: finalScore,
      status: normalizeStatus(row.status, hasScoring),
      final_score: finalScore,
      max_total: (row.max_technical ?? 70) + (row.max_innovation ?? 30) + (row.max_completeness ?? 20),
      technical_score: technical,
      max_technical: row.max_technical ?? 70,
      innovation_score: innovation,
      max_innovation: row.max_innovation ?? 30,
      completeness_score: completeness,
      max_completeness: row.max_completeness ?? 20,
      technical_breakdown: row.technical_breakdown ?? null,
      innovation_breakdown: row.innovation_breakdown ?? null,
      completeness_breakdown: row.completeness_breakdown ?? null,
      evaluation_timestamp: row.evaluation_timestamp ?? score?.generated_at ?? null,
    };
  });

  return { data: normalized, error: null };
}
