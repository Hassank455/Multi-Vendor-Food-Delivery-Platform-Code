import { PaymentMethod, RoleEnum } from "../../generated/prisma/enums";

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

export interface CustomerLoginBodyDto {
  email: string;
  password: string;
}

export interface CustomerLoginResponseDto {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: RoleEnum;
    emailVerifiedAt: Date | null;
    isActive: number;
  };
  customer: {
    id: number;
    userId: number;
    phone: string;
    gender: string | null;
    paymentPreference: PaymentMethod | null;
  };
}
