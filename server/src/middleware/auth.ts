import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt";
import { HttpError } from "../utils/http-error";
import type { UserRole } from "../types/http";

export const requireAuth = (roles?: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new HttpError(401, "Missing authorization token."));
    }

    const token = header.slice("Bearer ".length).trim();

    try {
      const claims = verifyJwt(token);
      req.auth = claims;

      if (roles && roles.length > 0 && !roles.includes(claims.role)) {
        return next(new HttpError(403, "You do not have access to this resource."));
      }

      return next();
    } catch {
      return next(new HttpError(401, "Invalid or expired token."));
    }
  };
};
