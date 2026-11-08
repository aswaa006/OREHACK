import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import { getUsers, createUser, assignEventAdmin, getAuditLogs } from "../controllers/v2.users.controller";

export const v2UsersRouter = Router();

v2UsersRouter.use(requireAuth(["SUPER_ADMIN"]));

v2UsersRouter.get("/", asyncHandler(getUsers));
v2UsersRouter.post("/", asyncHandler(createUser));
v2UsersRouter.post("/assign", asyncHandler(assignEventAdmin));
v2UsersRouter.get("/audit-logs", asyncHandler(getAuditLogs));
