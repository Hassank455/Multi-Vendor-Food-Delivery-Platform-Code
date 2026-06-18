import jwt from "jsonwebtoken";
import { RoleEnum } from "../generated/prisma/enums";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  return secret;
}

export type CustomerAccessTokenPayload = {
  customerId: number;
  role: typeof RoleEnum.CUSTOMER;
};

export type NonCustomerRole = Exclude<RoleEnum, typeof RoleEnum.CUSTOMER>;

export type UserAccessTokenPayload = {
  userId: number;
  role: NonCustomerRole;
};

export type AccessTokenPayload =
  | CustomerAccessTokenPayload
  | UserAccessTokenPayload;

export interface RefreshTokenPayload {
  userId: number;
  refreshTokenId: number;
}

// Used for access tokens
export function signAccess(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "2d" });
}

// used for verifying access tokens
export function verifyAccess(token: string): AccessTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
}

// Used for refresh tokens
export function signRefresh(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, getJwtRefreshSecret(), { expiresIn: "7d" });
}

// used for verifying refresh tokens
export function verifyRefresh(token: string): RefreshTokenPayload {
  return jwt.verify(token, getJwtRefreshSecret()) as RefreshTokenPayload;
}

export function decodeUnsafe(token: string): unknown {
  return jwt.decode(token);
}

// Used for password reset
// export function signResetToken(payload: { userId: number }): string {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
// }
