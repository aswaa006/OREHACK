import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import { getParticipants, getParticipant } from "../controllers/v2.participants.controller";

export const v2ParticipantsRouter = Router();

v2ParticipantsRouter.use(requireAuth(["SUPER_ADMIN", "EVENT_ADMIN"]));

v2ParticipantsRouter.get("/", asyncHandler(getParticipants));
v2ParticipantsRouter.get("/:id", asyncHandler(getParticipant));
