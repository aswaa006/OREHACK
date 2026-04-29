import { HttpError } from "../utils/http-error";

const readString = (body: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === "string" && value.trim() !== "") {
      return value.trim();
    }
  }
  return null;
};

const readNumber = (body: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = body[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  return null;
};

export type TeamLoginInput = {
  hackathonSlug: string;
  teamId: string;
  teamName?: string;
  password: string;
};

export const mapTeamLoginInput = (body: Record<string, unknown>): TeamLoginInput => {
  const hackathonSlug = readString(body, ["hackathonSlug", "hackathon", "eventId"]);
  const teamId = readString(body, ["teamId", "teamID", "TeamID"]);
  const teamName = readString(body, ["teamName", "Team_Name"]);
  const password = readString(body, ["password", "pass"]);

  if (!hackathonSlug || !teamId || !password) {
    throw new HttpError(400, "Missing required login fields.");
  }

  return { hackathonSlug, teamId, teamName: teamName || undefined, password };
};

export type AdminLoginInput = {
  email: string;
  password: string;
};

export const mapAdminLoginInput = (body: Record<string, unknown>): AdminLoginInput => {
  const email = readString(body, ["email"]);
  const password = readString(body, ["password"]);

  if (!email || !password) {
    throw new HttpError(400, "Email and password are required.");
  }

  return { email, password };
};

export type ProblemSelectionInput = {
  hackathonSlug: string;
  teamId: string;
  problemId: string;
};

export const mapProblemSelectionInput = (
  body: Record<string, unknown>,
): ProblemSelectionInput => {
  const hackathonSlug = readString(body, ["hackathonSlug", "eventId"]);
  const teamId = readString(body, ["teamId", "teamID", "TeamID"]);
  const problemId = readString(body, ["problemId", "problem_id"]);

  if (!hackathonSlug || !teamId || !problemId) {
    throw new HttpError(400, "hackathonSlug, teamId, and problemId are required.");
  }

  return { hackathonSlug, teamId, problemId };
};

export type SubmissionInput = {
  hackathonSlug: string;
  teamId: string;
  repoLink: string;
  problemId?: string;
  problemStatement?: string;
};

export const mapSubmissionInput = (body: Record<string, unknown>): SubmissionInput => {
  const hackathonSlug = readString(body, ["hackathonSlug", "eventId"]);
  const teamId = readString(body, ["teamId", "teamID", "TeamID"]);

  // Mapping note: frontend repoLink/repoUrl/Repo_URL all map to submissions.repository_url.
  const repoLink = readString(body, ["repoLink", "repoUrl", "Repo_URL", "repository_url"]);

  const problemId = readString(body, ["problemId", "problem_id"]);
  const problemStatement = readString(body, ["problemStatement", "Problem_Statement"]);

  if (!hackathonSlug || !teamId || !repoLink) {
    throw new HttpError(400, "hackathonSlug, teamId, and repoLink are required.");
  }

  return { hackathonSlug, teamId, repoLink, problemId: problemId || undefined, problemStatement: problemStatement || undefined };
};

export type EvaluationInput = {
  hackathonSlug: string;
  submissionId: string;
  teamId: string;
  evalRound: number;
  reportJson: unknown;
  score?: number;
  status: "queued" | "running" | "evaluated" | "failed";
};

export const mapEvaluationInput = (body: Record<string, unknown>): EvaluationInput => {
  const hackathonSlug = readString(body, ["hackathonSlug", "eventId"]);
  const submissionId = readString(body, ["submissionId", "submission_id"]);
  const teamId = readString(body, ["teamId", "teamID", "TeamID"]);
  const evalRound = readNumber(body, ["evalRound", "eval_round"]);
  const score = readNumber(body, ["score"]);

  const reportJson = body.reportJson ?? body.report_json;
  const statusRaw = readString(body, ["status"]) || "evaluated";

  if (!hackathonSlug || !submissionId || !teamId || !evalRound || !reportJson) {
    throw new HttpError(400, "Missing required evaluation fields.");
  }

  if (!["queued", "running", "evaluated", "failed"].includes(statusRaw)) {
    throw new HttpError(400, "Invalid submission status.");
  }

  return {
    hackathonSlug,
    submissionId,
    teamId,
    evalRound,
    reportJson,
    score: score ?? undefined,
    status: statusRaw as EvaluationInput["status"],
  };
};

export type JuryScoreInput = {
  hackathonSlug: string;
  teamId: string;
  juryRound: number;
  score: number;
  remarks?: string;
};

export const mapJuryScoreInput = (body: Record<string, unknown>): JuryScoreInput => {
  const hackathonSlug = readString(body, ["hackathonSlug", "eventId"]);
  const teamId = readString(body, ["teamId", "teamID", "TeamID"]);
  const juryRound = readNumber(body, ["juryRound", "jury_round"]);
  const score = readNumber(body, ["score"]);
  const remarks = readString(body, ["remarks"]);

  if (!hackathonSlug || !teamId || !juryRound || score === null) {
    throw new HttpError(400, "Missing required jury score fields.");
  }

  return { hackathonSlug, teamId, juryRound, score, remarks: remarks || undefined };
};
