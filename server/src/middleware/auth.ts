import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";
import { HttpError } from "../utils/http-error";
import type { UserRole } from "../types/http";

export const requireAuth = (roles?: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    // BYPASS AUTH FOR TESTING
    req.auth = {
      sub: "bypass-admin-id",
      role: "SUPER_ADMIN",
      email: "admin@orehack.com"
    };
    return next();
  };
};
