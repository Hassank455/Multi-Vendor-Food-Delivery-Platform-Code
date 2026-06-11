import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "superrefreshsecret";

export interface AccessTokenPayload {
  userId: number;
  customerId?: number;
  role: string;
}

export function signAccess(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "2d" });
}

export function signRefresh(payload: { userId: number }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: "4d" });
}

export function signResetToken(payload: { userId: number }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyAccess(token: string): AccessTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
}

export function verifyRefresh(token: string): { userId: number } {
  return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number };
}

export function decodeUnsafe(token: string): any {
  return jwt.decode(token);
}
