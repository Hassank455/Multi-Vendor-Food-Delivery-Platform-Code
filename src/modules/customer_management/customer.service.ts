import { NotFoundError, BadRequestError } from "../../errors";
import { OrderStatus } from "../../generated/prisma/client";
import {
  UpdateCustomerProfileDto,
  CreateCustomerReviewDto,
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

  async getCustomerReviews(customerId: number) {
    return await this.customerRepo.getCustomerReviews(customerId);
  }

  // async getPaymentPreference(customerId: number) {
  //   return await this.customerRepo.getPaymentPreference(customerId);
  // }

  // async upsertPaymentPreference(
  //   customerId: number,
  //   dto: UpsertPaymentPreferenceDto,
  // ) {
  //   return await this.customerRepo.upsertPaymentPreference(customerId, dto);
  // }

  // async deactivateMyAccount(customerId: number) {
  //   return await this.customerRepo.deactivateMyAccount(customerId);
  // }
}
