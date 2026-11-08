import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import {
  getDashboardStats,
  getActiveHackathons,
  getRecentSubmissions,
  getRecentActivity,
} from "../controllers/v2.admin.controller";

export const v2AdminRouter = Router();

v2AdminRouter.use(requireAuth(["SUPER_ADMIN", "EVENT_ADMIN"]));

v2AdminRouter.get("/dashboard", asyncHandler(getDashboardStats));
v2AdminRouter.get("/hackathons/active", asyncHandler(getActiveHackathons));
v2AdminRouter.get("/submissions/recent", asyncHandler(getRecentSubmissions));
v2AdminRouter.get("/activity", asyncHandler(getRecentActivity));
