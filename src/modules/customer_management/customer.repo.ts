import prisma from "../../lib/prisma";

import {
  UpdateCustomerProfileDto,
  CreateCustomerReviewDto,
  GetCustomerReviewsQueryDto,
  UpsertPaymentPreferenceDto,
} from "./customer.dto";

export class CustomerRepo {
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

  async getCustomerReviews(
    customerId: number,
    query: GetCustomerReviewsQueryDto,
  ) {
    const skip = (query.page - 1) * query.limit;
    const countQuery = prisma.review.count({
      where: {
        customerId,
      },
    });
    const reviewsQuery = prisma.review.findMany({
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
      skip,
      take: query.limit,
    });
    const [total, reviews] = await prisma.$transaction([
      countQuery,
      reviewsQuery,
    ]);

    return {
      total,
      reviews,
    };
  }
  async deactivateMyAccount(customerId: number) {
    const result = await prisma.customer.updateMany({
      where: { id: customerId, deletedAt: null },
      data: {
        deletedAt: new Date(),
      },
    });
    return result.count > 0;
  }

  async getPaymentPreference(customerId: number) {
    return await prisma.customer.findFirst({
      where: {
        id: customerId,
        deletedAt: null,
      },
      select: {
        paymentPreference: true,
      },
    });
  }

  async upsertPaymentPreference(
    customerId: number,
    dto: UpsertPaymentPreferenceDto,
  ) {
    const result = await prisma.customer.updateMany({
      where: {
        id: customerId,
        deletedAt: null,
      },
      data: {
        paymentPreference: dto.method,
      },
    });

    if (!result.count) {
      return null;
    }

    return await this.getPaymentPreference(customerId);
  }
}
