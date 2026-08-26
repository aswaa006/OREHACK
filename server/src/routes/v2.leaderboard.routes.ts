import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import { getLeaderboard, toggleLeaderboardVisibility } from "../controllers/v2.leaderboard.controller";

export const v2LeaderboardRouter = Router();

v2LeaderboardRouter.use(requireAuth(["SUPER_ADMIN", "EVENT_ADMIN"]));

v2LeaderboardRouter.get("/:eventId", asyncHandler(getLeaderboard));
v2LeaderboardRouter.post("/:eventId/toggle-visibility", requireAuth(["SUPER_ADMIN"]), asyncHandler(toggleLeaderboardVisibility));
