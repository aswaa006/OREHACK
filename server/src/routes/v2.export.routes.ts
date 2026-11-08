import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import {
  exportParticipantsCsv,
  exportEvaluationCsv,
  exportLeaderboardCsv,
  exportBackendCsv,
  getBackendExportData,
} from "../controllers/v2.export.controller";

export const v2ExportRouter = Router();

v2ExportRouter.use(requireAuth(["SUPER_ADMIN", "EVENT_ADMIN"]));

v2ExportRouter.get("/:eventId/participants", asyncHandler(exportParticipantsCsv));
v2ExportRouter.get("/:eventId/evaluation", asyncHandler(exportEvaluationCsv));
v2ExportRouter.get("/:eventId/leaderboard", asyncHandler(exportLeaderboardCsv));
v2ExportRouter.get("/:eventId/backend", asyncHandler(exportBackendCsv));
v2ExportRouter.get("/:eventId/backend-data", asyncHandler(getBackendExportData));
