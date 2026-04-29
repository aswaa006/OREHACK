import type { Request, Response } from "express";
import { mapSubmissionInput } from "../mappers/request-mappers";
import { createSubmission } from "../services/submission.service";

export async function submissionController(req: Request, res: Response) {
  const input = mapSubmissionInput(req.body as Record<string, unknown>);
  const data = await createSubmission(input);

  res.status(201).json({
    success: true,
    message: "Submission created successfully.",
    data,
  });
}
