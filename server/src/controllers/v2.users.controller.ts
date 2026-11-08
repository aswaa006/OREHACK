import type { Request, Response } from "express";
import { pool } from "../db/pool";
import { HttpError } from "../utils/http-error";
import bcrypt from "bcryptjs";

export async function getUsers(_req: Request, res: Response) {
  const result = await pool.query(
    "SELECT id, email, role, created_at FROM users ORDER BY role ASC, created_at DESC"
  );
  res.json({ success: true, data: result.rows });
}

export async function createUser(req: Request, res: Response) {
  const { email, password, role = "EVENT_ADMIN" } = req.body;

  if (!email || !password) {
    throw new HttpError(400, "email and password are required");
  }

  const validRoles = ["SUPER_ADMIN", "EVENT_ADMIN", "PARTICIPANT"];
  if (!validRoles.includes(role)) {
    throw new HttpError(400, `role must be one of: ${validRoles.join(", ")}`);
  }

  const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
  if ((existing.rowCount ?? 0) > 0) throw new HttpError(400, "Email already exists");

  const hash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at",
    [email.toLowerCase(), hash, role]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
}

export async function assignEventAdmin(req: Request, res: Response) {
  const { userId, eventId } = req.body;

  if (!userId || !eventId) {
    throw new HttpError(400, "userId and eventId are required");
  }

  const userCheck = await pool.query("SELECT id, role FROM users WHERE id = $1", [userId]);
  if (userCheck.rowCount === 0) throw new HttpError(404, "User not found");

  await pool.query(
    "INSERT INTO event_admins (event_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
    [eventId, userId]
  );

  res.json({ success: true, message: "Admin assigned to event" });
}

export async function getAuditLogs(req: Request, res: Response) {
  const { page = "1", limit = "50", action = "", entity_type = "" } = req.query;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const offset = (pageNum - 1) * limitNum;

  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (action) {
    conditions.push(`al.action ILIKE $${paramIndex++}`);
    params.push(`%${action}%`);
  }
  if (entity_type) {
    conditions.push(`al.entity_type = $${paramIndex++}`);
    params.push(entity_type);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await pool.query(`SELECT COUNT(*) AS total FROM audit_logs al ${where}`, params);

  const query = `
    SELECT al.id, al.action, al.entity_type, al.entity_id, al.details, al.ip_address, al.created_at,
           u.email AS user_email
    FROM audit_logs al
    LEFT JOIN users u ON u.id = al.user_id
    ${where}
    ORDER BY al.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(limitNum, offset);

  const result = await pool.query(query, params);

  res.json({
    success: true,
    data: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].total, 10),
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(countResult.rows[0].total / limitNum),
    },
  });
}
