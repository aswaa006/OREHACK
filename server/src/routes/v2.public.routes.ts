import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { getPublicEvents, getPublicEvent, registerTeam, loginTeam, submitStageLinks, getTeamDashboard } from "../controllers/v2.public.controller";

export const v2PublicRouter = Router();

// Get active hackathons
v2PublicRouter.get("/events", asyncHandler(getPublicEvents));

// Get single active hackathon
v2PublicRouter.get("/events/:id", asyncHandler(getPublicEvent));

// Register a team for a hackathon
v2PublicRouter.post("/events/:id/register", asyncHandler(registerTeam));

// Login a team for a hackathon
v2PublicRouter.post("/events/:id/login", asyncHandler(loginTeam));

// Submit PPT/Repo links
v2PublicRouter.post("/teams/:teamId/submit", asyncHandler(submitStageLinks));

// Get team dashboard data
v2PublicRouter.get("/teams/:teamId/dashboard", asyncHandler(getTeamDashboard));
