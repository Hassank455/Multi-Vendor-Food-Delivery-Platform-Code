import { RoleEnum } from "../../generated/prisma/enums";

export interface CreateManagedUserBodyDto {
  name: string;
  email: string;
  password: string;
}

export interface ManagedUserResponseDto {
  id: number;
  name: string;
  email: string;
  role: RoleEnum;
  isActive: number;
  emailVerifiedAt: Date | null;
}
