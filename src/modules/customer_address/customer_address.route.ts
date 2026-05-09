import { Router } from "express";
import { CustomerAddressController } from "./customer_address.controller";
import { CustomerAddressService } from "./customer_address.service";
import { CustomerAddressRepo } from "./customer_address.repo";

const router = Router();

const customerAddressRepo = new CustomerAddressRepo();
const customerAddressService = new CustomerAddressService(customerAddressRepo);
const customerAddressController = new CustomerAddressController(
  customerAddressService,
);

router.get("/", customerAddressController.getCustomerAddresses);
router.get("/:id", customerAddressController.getCustomerAddress);
router.post("/", customerAddressController.createCustomerAddress);
router.patch("/:id", customerAddressController.updateCustomerAddress);
router.delete("/:id", customerAddressController.deleteCustomerAddress);

export default router;
