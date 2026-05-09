import { CustomerAddressRepo } from "./customer_address.repo";

export class CustomerAddressService {
  constructor(private customerAddressRepo: CustomerAddressRepo) {}

  get repo() {
    return this.customerAddressRepo;
  }
}
