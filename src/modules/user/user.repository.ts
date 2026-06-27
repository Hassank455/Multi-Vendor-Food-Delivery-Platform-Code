import prisma from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";
import { RoleEnum } from "../../generated/prisma/enums";

type PrismaTransaction = Prisma.TransactionClient;

export class UserRepository {
  private db(tx?: PrismaTransaction) {
    return tx ?? prisma;
  }

  async findUserByEmail(email: string, tx?: PrismaTransaction) {
    return await this.db(tx).user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });
  }

  async createManagedUser(
    name: string,
    email: string,
    passwordHash: string,
    role: RoleEnum,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role,
        isActive: 1,
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerifiedAt: true,
      },
    });
  }
}
