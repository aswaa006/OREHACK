import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import { previewBackendImport, confirmBackendImport } from "../controllers/v2.backend-import.controller";

export const v2BackendImportRouter = Router();

v2BackendImportRouter.use(requireAuth(["SUPER_ADMIN", "EVENT_ADMIN"]));

v2BackendImportRouter.post("/import/:eventId/preview", asyncHandler(previewBackendImport));
v2BackendImportRouter.post("/import/:eventId/confirm", asyncHandler(confirmBackendImport));
