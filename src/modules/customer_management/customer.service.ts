import { buildPaginationMeta } from "../../common/pagination";
import { NotFoundError, BadRequestError } from "../../errors";
import { OrderStatus } from "../../generated/prisma/client";
import {
  UpdateCustomerProfileDto,
  CreateCustomerReviewDto,
  GetCustomerReviewsQueryDto,
  PaginatedCustomerReviewsDto,
  PaymentPreferenceDto,
  UpsertPaymentPreferenceDto,
} from "./customer.dto";
import { CustomerRepo } from "./customer.repo";

export class CustomerService {
  constructor(private customerRepo: CustomerRepo) {}

  async getCustomerProfile(customerId: number) {
    const customer = await this.customerRepo.getCustomerProfileById(customerId);
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }
    return customer;
  }

  async updateCustomerProfile(
    customerId: number,
    dto: UpdateCustomerProfileDto,
  ) {
    const updatedCustomer = await this.customerRepo.updateCustomerProfile(
      customerId,
      dto,
    );
    if (!updatedCustomer) {
      throw new NotFoundError("Customer not found");
    }
    return updatedCustomer;
  }
  async createCustomerReview(customerId: number, dto: CreateCustomerReviewDto) {
    const order = await this.customerRepo.findCustomerOrderForReview(
      customerId,
      dto.orderId,
    );
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.status !== OrderStatus.DELIVERED) {
      throw new BadRequestError("You can only review delivered orders");
    }

    if (order.review) {
      throw new BadRequestError("Review already exists for this order");
    }
    return await this.customerRepo.createCustomerReview(
      customerId,
      order.restaurantId,
      dto,
    );
  }

  async getCustomerReviews(
    customerId: number,
    query: GetCustomerReviewsQueryDto,
  ): Promise<PaginatedCustomerReviewsDto> {
    const { reviews, total } = await this.customerRepo.getCustomerReviews(
      customerId,
      query,
    );
    return {
      data: reviews,
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async deactivateMyAccount(customerId: number) {
    const deactivated = await this.customerRepo.deactivateMyAccount(customerId);

    if (!deactivated) {
      throw new NotFoundError("Customer not found");
    }

    return deactivated;
  }

  async getPaymentPreference(customerId: number): Promise<PaymentPreferenceDto> {
    const customer = await this.customerRepo.getPaymentPreference(customerId);

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    return {
      method: customer.paymentPreference,
    };
  }

  async upsertPaymentPreference(
    customerId: number,
    dto: UpsertPaymentPreferenceDto,
  ): Promise<PaymentPreferenceDto> {
    const customer = await this.customerRepo.upsertPaymentPreference(
      customerId,
      dto,
    );

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    return {
      method: customer.paymentPreference,
    };
  }
}
