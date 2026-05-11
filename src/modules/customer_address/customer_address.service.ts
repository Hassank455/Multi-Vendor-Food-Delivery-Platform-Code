import { CustomerAddressRepo } from "./customer_address.repo";
import { NotFoundError } from "../../errors";
import {
  CreateCustomerAddressDto,
  UpdateCustomerAddressDto,
} from "./customer_address.dto";

export class CustomerAddressService {
  constructor(private customerAddressRepo: CustomerAddressRepo) {}

  async getCustomerAddresses(customerId: number) {
    return this.customerAddressRepo.getCustomerAddresses(customerId);
  }

  async getCustomerAddress(customerId: number, id: number) {
    const customerAddress = await this.customerAddressRepo.getCustomerAddress(
      customerId,
      id,
    );

    if (!customerAddress) {
      throw new NotFoundError("Customer address not found");
    }

    return customerAddress;
  }

  async createCustomerAddress(
    customerId: number,
    dto: CreateCustomerAddressDto,
  ) {
    return await this.customerAddressRepo.createCustomerAddress(customerId, dto);
  }

  async updateCustomerAddress(
    customerId: number,
    id: number,
    dto: UpdateCustomerAddressDto,
  ) {
    const customerAddress = await this.customerAddressRepo.updateCustomerAddress(
      customerId,
      id,
      dto,
    );

    if (!customerAddress) {
      throw new NotFoundError("Customer address not found");
    }

    return customerAddress;
  }

  async deleteCustomerAddress(customerId: number, id: number) {
    const deleted = await this.customerAddressRepo.softDeleteCustomerAddress(
      customerId,
      id,
    );

    if (!deleted) {
      throw new NotFoundError("Customer address not found");
    }

    return deleted;
  }
}
