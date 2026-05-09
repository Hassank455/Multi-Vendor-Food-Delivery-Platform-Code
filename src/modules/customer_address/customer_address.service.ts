import { CustomerAddressRepo } from "./customer_address.repo";
import { NotFoundError } from "../../errors";

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
}
