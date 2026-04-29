import type { NextFunction, Request, Response } from "express";
import { getHackathonFlags } from "../services/hackathon.service";
import { HttpError } from "../utils/http-error";

type StageFlagKey =
  | "loginEnabled"
  | "stage1Active"
  | "stage2Active"
  | "stage3Active"
  | "stage4Active"
  | "stage5Active";

const readHackathonSlug = (req: Request) => {
  const bodySlug = typeof req.body?.hackathonSlug === "string" ? req.body.hackathonSlug : null;
  const paramSlug = typeof req.params?.hackathonSlug === "string" ? req.params.hackathonSlug : null;
  const querySlug = typeof req.query?.hackathonSlug === "string" ? req.query.hackathonSlug : null;
  return (bodySlug || paramSlug || querySlug || req.auth?.hackathonSlug || "").trim();
};

export const requireStage = (flagKey: StageFlagKey, blockedMessage: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const hackathonSlug = readHackathonSlug(req);
      if (!hackathonSlug) {
        throw new HttpError(400, "hackathonSlug is required.");
      }

      const flags = await getHackathonFlags(hackathonSlug);
      if (!flags[flagKey]) {
        throw new HttpError(403, blockedMessage);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
