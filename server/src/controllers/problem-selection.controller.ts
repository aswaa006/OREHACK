import type { Request, Response } from "express";
import { mapProblemSelectionInput } from "../mappers/request-mappers";
import { selectProblem } from "../services/problem-selection.service";

export async function problemSelectionController(req: Request, res: Response) {
  const input = mapProblemSelectionInput(req.body as Record<string, unknown>);
  const data = await selectProblem(input);

  res.status(201).json({
    success: true,
    message: "Problem selected successfully.",
    data,
  });
}
