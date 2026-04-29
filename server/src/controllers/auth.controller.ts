import type { Request, Response } from "express";
import { mapAdminLoginInput, mapTeamLoginInput } from "../mappers/request-mappers";
import { adminLogin, teamLogin } from "../services/auth.service";

export async function teamLoginController(req: Request, res: Response) {
  const input = mapTeamLoginInput(req.body as Record<string, unknown>);
  const data = await teamLogin(input);

  res.status(200).json({
    success: true,
    message: "Team login successful.",
    data,
  });
}

export async function adminLoginController(req: Request, res: Response) {
  const input = mapAdminLoginInput(req.body as Record<string, unknown>);
  const data = await adminLogin(input);

  res.status(200).json({
    success: true,
    message: "Admin login successful.",
    data,
  });
}
