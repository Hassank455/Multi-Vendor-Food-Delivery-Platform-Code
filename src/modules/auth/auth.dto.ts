import { RoleEnum } from "../../generated/prisma/enums";

export interface CustomerSignupBodyDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender?: string;
}

export interface CustomerSignupResponseDto {
  userId: number;
  customerId: number;
  email: string;
  role: RoleEnum;
}

export interface VerifyEmailBodyDto {
  email: string;
  code: string;
}

export interface VerifyEmailResponseDto {
  userId: number;
  email: string;
  emailVerifiedAt: Date;
}

export interface ResendVerificationCodeBodyDto {
  email: string;
}
