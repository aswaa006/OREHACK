import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { requireAuth } from "../middleware/auth";
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  getEventStats,
  archiveEvent,
} from "../controllers/v2.events.controller";

export const v2EventsRouter = Router();

// Only Admins can manage events
v2EventsRouter.use(requireAuth(["SUPER_ADMIN", "EVENT_ADMIN"]));

v2EventsRouter.post("/", requireAuth(["SUPER_ADMIN"]), asyncHandler(createEvent));
v2EventsRouter.get("/", asyncHandler(getEvents));
v2EventsRouter.get("/:id", asyncHandler(getEvent));
v2EventsRouter.get("/:id/stats", asyncHandler(getEventStats));
v2EventsRouter.put("/:id", requireAuth(["SUPER_ADMIN"]), asyncHandler(updateEvent));
v2EventsRouter.post("/:id/archive", requireAuth(["SUPER_ADMIN"]), asyncHandler(archiveEvent));
