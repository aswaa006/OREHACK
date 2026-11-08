import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import { createSubmission, getSubmissions } from "../controllers/v2.submissions.controller";

export const v2SubmissionsRouter = Router();

// Public route for wizard submission
v2SubmissionsRouter.post("/", asyncHandler(createSubmission));

// Protected route for admins
v2SubmissionsRouter.get("/", requireAuth(["SUPER_ADMIN", "EVENT_ADMIN"]), asyncHandler(getSubmissions));
