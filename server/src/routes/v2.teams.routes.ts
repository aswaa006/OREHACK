import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import { getTeams, getTeam, toggleScoreLock, updateTeamSubmission, evaluateTeam, updateTeam } from "../controllers/v2.teams.controller";

export const v2TeamsRouter = Router();

v2TeamsRouter.use(requireAuth(["SUPER_ADMIN", "EVENT_ADMIN"]));

v2TeamsRouter.get("/", asyncHandler(getTeams));
v2TeamsRouter.get("/:id", asyncHandler(getTeam));
v2TeamsRouter.put("/:id", asyncHandler(updateTeam));
v2TeamsRouter.post("/:id/toggle-lock", asyncHandler(toggleScoreLock));
v2TeamsRouter.put("/:id/submission", asyncHandler(updateTeamSubmission));
v2TeamsRouter.put("/:id/scores", asyncHandler(evaluateTeam));
