import { CustomerAddressRepo } from "./customer_address.repo";
import { NotFoundError } from "../../errors";
import {
  CustomerAddressDto,
  UpdateCustomerAddressDto,
} from "./customer_address.dto";
import { LoggerService } from "../../services/logger.service";

const logger = new LoggerService("customerAddress");

export class CustomerAddressService {
  constructor(private customerAddressRepo: CustomerAddressRepo) {}

  get repo() {
    return this.customerAddressRepo;
  }

  async getCustomerAddresses(customerId: number) {
    return this.repo.getCustomerAddresses(customerId);
  }

  async getCustomerAddress(customerId: number, id: number) {
    const customerAddress = await this.repo.getCustomerAddress(customerId, id);

    if (!customerAddress) {
      throw new NotFoundError("Customer address not found");
    }

    return customerAddress;
  }

  async createCustomerAddress(dto: CustomerAddressDto) {
    return await this.repo.createCustomerAddress(dto);
  }

  async updateCustomerAddress(id: number, dto: UpdateCustomerAddressDto) {
    const customerAddress = await this.repo.updateCustomerAddress(id, dto);

    if (!customerAddress) {
      throw new NotFoundError("Customer address not found");
    }

    return customerAddress;
  }

  async deleteCustomerAddress(customerId: number, id: number) {
    const deleted = await this.repo.softDeleteCustomerAddress(customerId, id);

    if (!deleted) {
      throw new NotFoundError("Customer address not found");
    }

    return deleted;
  }
}
