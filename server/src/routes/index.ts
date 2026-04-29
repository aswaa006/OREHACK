import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import { requireStage } from "../middleware/stage-guard";
import { adminLoginController, teamLoginController } from "../controllers/auth.controller";
import { problemSelectionController } from "../controllers/problem-selection.controller";
import { submissionController } from "../controllers/submission.controller";
import { evaluationController } from "../controllers/evaluation.controller";
import { juryScoreController } from "../controllers/jury.controller";
import { computeResultsController } from "../controllers/results.controller";

export const apiRouter = Router();

apiRouter.get("/routes", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API route catalog",
    data: {
      baseUrl: "/api",
      routes: [
        { method: "GET", path: "/health", auth: false },
        { method: "GET", path: "/routes", auth: false },
        { method: "POST", path: "/auth/team/login", auth: false },
        { method: "POST", path: "/auth/admin/login", auth: false },
        { method: "POST", path: "/problems/select", auth: true, roles: ["team"] },
        { method: "POST", path: "/submissions", auth: true, roles: ["team"] },
        { method: "POST", path: "/evaluations", auth: true, roles: ["developer_admin", "hackathon_admin"] },
        { method: "POST", path: "/jury/scores", auth: true, roles: ["jury", "hackathon_admin", "developer_admin"] },
        { method: "POST", path: "/results/compute/:hackathonSlug", auth: true, roles: ["developer_admin", "hackathon_admin"] },
      ],
    },
  });
});

apiRouter.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Backend is healthy." });
});

apiRouter.post(
  "/auth/team/login",
  requireStage("loginEnabled", "Team login is currently disabled for this hackathon."),
  asyncHandler(teamLoginController),
);

apiRouter.post("/auth/admin/login", asyncHandler(adminLoginController));

apiRouter.post(
  "/problems/select",
  requireAuth(["team"]),
  requireStage("stage1Active", "Problem selection is not active."),
  asyncHandler(problemSelectionController),
);

apiRouter.post(
  "/submissions",
  requireAuth(["team"]),
  requireStage("stage4Active", "Submission stage is not active."),
  asyncHandler(submissionController),
);

apiRouter.post(
  "/evaluations",
  requireAuth(["developer_admin", "hackathon_admin"]),
  requireStage("stage4Active", "Evaluation stage is not active."),
  asyncHandler(evaluationController),
);

apiRouter.post(
  "/jury/scores",
  requireAuth(["jury", "hackathon_admin", "developer_admin"]),
  requireStage("stage5Active", "Jury stage is not active."),
  asyncHandler(juryScoreController),
);

apiRouter.post(
  "/results/compute/:hackathonSlug",
  requireAuth(["developer_admin", "hackathon_admin"]),
  requireStage("stage5Active", "Final result stage is not active."),
  asyncHandler(computeResultsController),
);
