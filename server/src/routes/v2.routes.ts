import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { loginAdmin } from "../controllers/v2.auth.controller";
import { v2PublicRouter } from "./v2.public.routes";
import { v2EventsRouter } from "./v2.events.routes";
import { v2SubmissionsRouter } from "./v2.submissions.routes";
import { v2ScoresRouter } from "./v2.scores.routes";
import { v2AdminRouter } from "./v2.admin.routes";
import { v2TeamsRouter } from "./v2.teams.routes";
import { v2ParticipantsRouter } from "./v2.participants.routes";
import { v2LeaderboardRouter } from "./v2.leaderboard.routes";
import { v2ExportRouter } from "./v2.export.routes";
import { v2UsersRouter } from "./v2.users.routes";

export const v2Router = Router();

// --- Auth ---
v2Router.post("/auth/login", asyncHandler(loginAdmin));
v2Router.post("/auth/logout", (_req, res) => {
  res.json({ success: true, message: "Logged out" });
});

// --- Platform ---
v2Router.use("/admin", v2AdminRouter);

// --- Public APIs ---
v2Router.use("/public", v2PublicRouter);

// --- Events / Hackathons ---
v2Router.use("/events", v2EventsRouter);

// --- Submissions ---
v2Router.use("/submissions", v2SubmissionsRouter);

// --- Teams ---
v2Router.use("/teams", v2TeamsRouter);

// --- Participants ---
v2Router.use("/participants", v2ParticipantsRouter);

// --- Scores & Import ---
v2Router.use("/scores", v2ScoresRouter);

// --- Leaderboard ---
v2Router.use("/leaderboard", v2LeaderboardRouter);

// --- Export ---
v2Router.use("/export", v2ExportRouter);

// --- Users & Audit ---
v2Router.use("/users", v2UsersRouter);
