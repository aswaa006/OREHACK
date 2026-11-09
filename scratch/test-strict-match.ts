import { validateToolScoreMatch, normalizeRepoUrl, normalizeTeamName, calculateCombinedScores } from "../src/lib/orehack-db";
import type { OrehackTeam, OrehackToolScoreRow } from "../src/lib/orehack-db";

// Test suite for strict matching logic
console.log("=== RUNNING STRICT REPO & TEAM MATCHING VERIFICATION ===");

const mockTeams: OrehackTeam[] = [
  {
    id: "1",
    team_special_id: "TEAM-01",
    team_name: "Code Warriors",
    leader_name: "Alice Smith",
    phone: "9876543210",
    repo_link: "https://github.com/alice/code-warriors-disaster-app.git",
    r1_score: 30,
    r2_jury_score: 40,
    r2_score: 28, // without tool: 40/50 * 35 = 28
    side_quest_score: 20,
    total_score: 78,
    is_approved: true,
  },
  {
    id: "2",
    team_special_id: "TEAM-02",
    team_name: "Byte Builders",
    leader_name: "Bob Jones",
    phone: "9876543211",
    repo_link: "", // No repo submitted
    r1_score: 25,
    r2_jury_score: 35,
    r2_score: 24.5,
    side_quest_score: 15,
    total_score: 64.5,
    is_approved: true,
  },
];

// Case 1: Exact match of both Team Name and Repo URL (with minor normalization differences like https, trailing slash, .git)
const row1: OrehackToolScoreRow = {
  team_name: "  code warriors  ",
  problem_statement: "Emergency Disaster Management",
  repo_url: "http://github.com/alice/code-warriors-disaster-app/",
  progress: "100%",
  total_scores: 26,
  tech_scores: 9,
  innov_scores: 9,
  completeness_scores: 8,
  reasoning: "Excellent full-stack implementation with realtime incident map",
};

const res1 = validateToolScoreMatch(row1, mockTeams);
console.log("Test 1 (Valid Name & Matching Repo):", res1.status === "verified" ? "PASS" : "FAIL", res1);
if (res1.status !== "verified") {
  throw new Error("Test 1 failed: Expected verified match");
}

// Case 2: Matching Team Name but DIFFERENT Repo URL
const row2: OrehackToolScoreRow = {
  team_name: "Code Warriors",
  problem_statement: "Emergency Disaster Management",
  repo_url: "https://github.com/someone-else/different-repo",
  progress: "80%",
  total_scores: 20,
  tech_scores: 7,
  innov_scores: 7,
  completeness_scores: 6,
  reasoning: "Mismatched repo test",
};

const res2 = validateToolScoreMatch(row2, mockTeams);
console.log("Test 2 (Matching Name but Mismatched Repo):", res2.status === "repo_mismatch" ? "PASS" : "FAIL", res2);
if (res2.status !== "repo_mismatch") {
  throw new Error("Test 2 failed: Expected repo_mismatch");
}

// Case 3: Matching Team Name but team has no repo submitted yet
const row3: OrehackToolScoreRow = {
  team_name: "Byte Builders",
  problem_statement: "Emergency Disaster Management",
  repo_url: "https://github.com/bob/byte-builders",
  progress: "70%",
  total_scores: 18,
  tech_scores: 6,
  innov_scores: 6,
  completeness_scores: 6,
  reasoning: "Team has no repo in system",
};

const res3 = validateToolScoreMatch(row3, mockTeams);
console.log("Test 3 (Matching Name but No Registered Repo):", res3.status === "no_team_repo" ? "PASS" : "FAIL", res3);
if (res3.status !== "no_team_repo") {
  throw new Error("Test 3 failed: Expected no_team_repo");
}

// Case 4: Non-existent Team
const row4: OrehackToolScoreRow = {
  team_name: "Unknown Aliens",
  problem_statement: "Emergency Disaster Management",
  repo_url: "https://github.com/aliens/invade",
  progress: "0%",
  total_scores: 0,
  tech_scores: 0,
  innov_scores: 0,
  completeness_scores: 0,
  reasoning: "Not found",
};

const res4 = validateToolScoreMatch(row4, mockTeams);
console.log("Test 4 (Team Not Found):", res4.status === "not_found" ? "PASS" : "FAIL", res4);
if (res4.status !== "not_found") {
  throw new Error("Test 4 failed: Expected not_found");
}

// Case 5: Verify Formula Calculation
// Team 1: Jury = 40/50 (70% = 28.00), Tool = 26/30 (30% = 13.00) -> R2 = 41.00/50.
// Total = R1(30) + R2(41) + SQ(20) = 91.00/110.
const calc = calculateCombinedScores({ r1: 30, r2_jury: 40, r2_tool: 26, sidequest: 20 });
console.log("Test 5 (Combined Score Calculation):", calc);
if (calc.r2_score !== 41 || calc.total_score !== 91) {
  throw new Error(`Test 5 failed: Expected r2=41, total=91, got r2=${calc.r2_score}, total=${calc.total_score}`);
}

console.log("ALL STRICT VERIFICATION TESTS PASSED SUCCESSFULLY! ✅");
