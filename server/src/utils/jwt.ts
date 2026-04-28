import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { JwtClaims } from "../types/http";

export const signJwt = (claims: JwtClaims) => {
  return jwt.sign(claims, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyJwt = (token: string) => {
  return jwt.verify(token, env.jwtSecret) as JwtClaims;
};
