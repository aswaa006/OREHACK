import type { Request, Response } from "express";
import { pool } from "../db/pool";
import bcrypt from "bcryptjs";
import { signJwt } from "../utils/jwt";
import { HttpError } from "../utils/http-error";

export async function loginAdmin(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new HttpError(400, "Email and password are required.");
  }

  const result = await pool.query(
    "SELECT id, email, password_hash, role FROM users WHERE email = $1",
    [email.toLowerCase()]
  );

  if (result.rowCount === 0) {
    throw new HttpError(401, "Invalid credentials.");
  }

  const user = result.rows[0];

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new HttpError(401, "Invalid credentials.");
  }

  const token = signJwt({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    }
  });
}
