import type { Request, Response } from "express";
import { mapEvaluationInput } from "../mappers/request-mappers";
import { upsertEvaluation } from "../services/evaluation.service";

export async function evaluationController(req: Request, res: Response) {
  const input = mapEvaluationInput(req.body as Record<string, unknown>);
  const data = await upsertEvaluation(input);

  res.status(200).json({
    success: true,
    message: "Evaluation saved successfully.",
    data,
  });
}
