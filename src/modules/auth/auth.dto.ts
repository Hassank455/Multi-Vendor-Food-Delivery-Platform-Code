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
  verificationCode?: string;
}
