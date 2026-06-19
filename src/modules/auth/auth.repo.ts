import prisma from "../../lib/prisma";
import { AuthCodePurpose, RoleEnum } from "../../generated/prisma/enums";
import { CustomerSignupBodyDto } from "./auth.dto";
import type { Prisma } from "../../generated/prisma/client";

type PrismaTransaction = Prisma.TransactionClient;

export class AuthRepo {
  private db(tx?: PrismaTransaction) {
    return tx ?? prisma;
  }
  async findUserByEmail(email: string, tx?: PrismaTransaction) {
    return await this.db(tx).user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
        isActive: true,
        emailVerifiedAt: true,
      },
    });
  }

  async createUser(
    name: string,
    email: string,
    passwordHash: string,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).user.create({
      data: {
        name: name,
        email: email,
        password: passwordHash,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }

  async createCustomer(
    userId: number,
    phone: string,
    gender?: string,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).customer.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        phone: phone,
        gender: gender,
      },
    });
  }

  async createAuthCode(
    userId: number,
    purpose: AuthCodePurpose,
    codeHash: string,
    expiresAt: Date,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).authCode.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        purpose: purpose,
        codeHash: codeHash,
        expiresAt: expiresAt,
      },
      select: {
        id: true,
      },
    });
  }

  async findLatestAuthCodeByUserIdAndPurpose(
    userId: number,
    purpose: AuthCodePurpose,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).authCode.findFirst({
      where: {
        userId,
        purpose,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        codeHash: true,
        expiresAt: true,
        consumedAt: true,
        createdAt: true,
      },
    });
  }

  async verifyUserEmail(userId: number, tx?: PrismaTransaction) {
    return await this.db(tx).user.update({
      where: { id: userId },
      data: {
        emailVerifiedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
      },
    });
  }

  async consumeAuthCode(authCodeId: number, tx?: PrismaTransaction) {
    return await this.db(tx).authCode.update({
      where: { id: authCodeId },
      data: {
        consumedAt: new Date(),
      },
      select: {
        id: true,
      },
    });
  }

  async findCustomerLoginContextByEmail(email: string, tx?: PrismaTransaction) {
    return await this.db(tx).user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
        emailVerifiedAt: true,
        customer: {
          select: {
            id: true,
            userId: true,
            phone: true,
            gender: true,
            paymentPreference: true,
          },
        },
      },
    });
  }

  // ------------------------  Refresh Token ------------------------
  async createRefreshToken(
    userId: number,
    expiresAt: Date,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).refreshToken.create({
      data: {
        userId,
        expiresAt,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
      },
    });
  }

  async updateRefreshTokenHash(
    refreshTokenId: number,
    refreshTokenHash: string,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).refreshToken.update({
      where: { id: refreshTokenId },
      data: {
        refreshTokenHash,
      },
      select: {
        id: true,
      },
    });
  }

  async findRefreshTokenWithCustomerContext(
    refreshTokenId: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).refreshToken.findUnique({
      where: { id: refreshTokenId },
      select: {
        id: true,
        userId: true,
        refreshTokenHash: true,
        expiresAt: true,
        revokedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isActive: true,
            emailVerifiedAt: true,
            customer: {
              select: {
                id: true,
                userId: true,
                phone: true,
                gender: true,
                paymentPreference: true,
              },
            },
          },
        },
      },
    });
  }

  async revokeRefreshToken(refreshTokenId: number, tx?: PrismaTransaction) {
    return await this.db(tx).refreshToken.update({
      where: { id: refreshTokenId },
      data: {
        revokedAt: new Date(),
      },
      select: {
        id: true,
      },
    });
  }
}
