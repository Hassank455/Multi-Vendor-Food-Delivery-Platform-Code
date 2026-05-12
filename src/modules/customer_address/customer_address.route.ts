import { Router } from "express";
import { CustomerAddressController } from "./customer_address.controller";
import { CustomerAddressService } from "./customer_address.service";
import { CustomerAddressRepo } from "./customer_address.repo";
import { isAuth, validate } from "../../middlewares";
import * as customerAddressValidators from "./customer_address.validation";

const router = Router();

const customerAddressRepo = new CustomerAddressRepo();
const customerAddressService = new CustomerAddressService(customerAddressRepo);
const customerAddressController = new CustomerAddressController(
  customerAddressService,
);

router.get(
  "/",
  isAuth,
  validate(customerAddressValidators.getCustomerAddressesSchema),
  customerAddressController.getCustomerAddresses,
);
router.get(
  "/:id",
  isAuth,
  validate(customerAddressValidators.getCustomerAddressSchema),
  customerAddressController.getCustomerAddress,
);
router.post(
  "/",
  isAuth,
  validate(customerAddressValidators.createCustomerAddressSchema),
  customerAddressController.createCustomerAddress,
);
router.patch(
  "/:id",
  isAuth,
  validate(customerAddressValidators.updateCustomerAddressSchema),
  customerAddressController.updateCustomerAddress,
);
router.delete(
  "/:id",
  isAuth,
  validate(customerAddressValidators.deleteCustomerAddressSchema),
  customerAddressController.deleteCustomerAddress,
);

export default router;
