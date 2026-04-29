import type { Request, Response } from "express";
import { HttpError } from "../utils/http-error";
import { computeFinalResults } from "../services/results.service";

export async function computeResultsController(req: Request, res: Response) {
  const hackathonSlug = (req.params.hackathonSlug || req.body?.hackathonSlug || "").trim();

  if (!hackathonSlug) {
    throw new HttpError(400, "hackathonSlug is required.");
  }

  const data = await computeFinalResults(hackathonSlug);

  res.status(200).json({
    success: true,
    message: "Final results computed successfully.",
    data,
  });
}
