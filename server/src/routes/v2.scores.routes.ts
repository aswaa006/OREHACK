import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import {
  exportParticipantsCsv,
  previewScoreImport,
  confirmScoreImport,
  getImportHistory,
  getImportDetail,
} from "../controllers/v2.scores.controller";

export const v2ScoresRouter = Router();

v2ScoresRouter.use(requireAuth(["SUPER_ADMIN", "EVENT_ADMIN"]));

// Participant export (clean CSV for Python CLI)
v2ScoresRouter.get("/export/:eventId/participants", asyncHandler(exportParticipantsCsv));

// Score import flow
v2ScoresRouter.post("/import/:eventId/preview", asyncHandler(previewScoreImport));
v2ScoresRouter.post("/import/:eventId/confirm", asyncHandler(confirmScoreImport));

// Import history
v2ScoresRouter.get("/imports/:eventId", asyncHandler(getImportHistory));
v2ScoresRouter.get("/import-detail/:importId", asyncHandler(getImportDetail));
