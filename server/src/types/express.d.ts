import type { JwtClaims } from "./http";

declare global {
  namespace Express {
    interface Request {
      auth?: JwtClaims;
    }
  }
}

export {};
