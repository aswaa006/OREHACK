import type { Request, Response } from "express";
import { HttpError } from "../utils/http-error";
import { mapJuryScoreInput } from "../mappers/request-mappers";
import { createJuryScore } from "../services/jury.service";

export async function juryScoreController(req: Request, res: Response) {
  if (!req.auth?.sub) {
    throw new HttpError(401, "Missing authenticated jury identity.");
  }

  const input = mapJuryScoreInput(req.body as Record<string, unknown>);
  const data = await createJuryScore(input, req.auth.sub);

  res.status(201).json({
    success: true,
    message: "Jury score saved successfully.",
    data,
  });
}
