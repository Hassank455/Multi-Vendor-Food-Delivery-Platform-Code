import { date } from "zod/v4";
import prisma from "../../lib/prisma";
// import type { Prisma } from "../../generated/prisma/client";
import {
  UpdateCustomerProfileDto,
  CreateCustomerReviewDto,
} from "./customer.dto";

// type PrismaTransaction = Prisma.TransactionClient;

export class CustomerRepo {
  // protected db(tx?: PrismaTransaction) {
  //   return tx ?? prisma;
  // }

  async getCustomerProfileById(customerId: number) {
    return await prisma.customer.findFirst({
      where: { id: customerId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  async updateCustomerProfile(
    customerId: number,
    dto: UpdateCustomerProfileDto,
  ) {
    const result = await prisma.customer.updateMany({
      where: { id: customerId, deletedAt: null },
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
      },
    });
    if (!result.count) {
      return null;
    }
    return await this.getCustomerProfileById(customerId);
  }

  async findCustomerOrderForReview(customerId: number, orderId: number) {
    return await prisma.order.findFirst({
      where: {
        id: orderId,
        customerId,
      },
      select: {
        id: true,
        status: true,
        restaurantId: true,
        review: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async createCustomerReview(
    customerId: number,
    restaurantId: number,
    dto: CreateCustomerReviewDto,
  ) {
    return await prisma.review.create({
      data: {
        customerId,
        restaurantId,
        orderId: dto.orderId,
        rating: dto.rating,
        comment: dto.comment,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        orderId: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getCustomerReviews(customerId: number) {
    return await prisma.review.findMany({
      where: {
        customerId,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        orderId: true,
        restaurant: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });
  }

  // async getPaymentPreference(customerId: number, tx?: PrismaTransaction) {}

  // async upsertPaymentPreference(
  //   customerId: number,
  //   dto: UpsertPaymentPreferenceDto,
  //   tx?: PrismaTransaction,
  // ) {}

  // async deactivateMyAccount(customerId: number, tx?: PrismaTransaction) {}
}
