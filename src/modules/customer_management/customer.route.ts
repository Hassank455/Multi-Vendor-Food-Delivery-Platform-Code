import { Router } from "express";
import { isAuth, validate } from "../../middlewares";
import { CustomerController } from "./customer.controller";
import { CustomerRepo } from "./customer.repo";
import { CustomerService } from "./customer.service";
import * as customerValidators from "./customer.validation";

const router = Router();

const customerRepo = new CustomerRepo();
const customerService = new CustomerService(customerRepo);
const customerController = new CustomerController(customerService);

router.get("/me", isAuth, customerController.getProfile);

router.patch(
  "/me",
  isAuth,
  validate(customerValidators.updateProfileSchema),
  customerController.updateProfile,
);

router.post(
  "/me/reviews",
  isAuth,
  validate(customerValidators.createCustomerReviewSchema),
  customerController.createCustomerReview,
);

router.get(
  "/me/reviews",
  isAuth,
  validate(customerValidators.getCustomerReviewsSchema),
  customerController.getCustomerReviews,
);

router.patch(
  "/me/deactivate",
  isAuth,
  customerController.deactivateMyAccount,
);

// router.get(
//   "/me/payment-preference",
//   isAuth,
//   validate(customerValidators.getPaymentPreferenceSchema),
//   customerController.getPaymentPreference,
// );

// router.put(
//   "/me/payment-preference",
//   isAuth,
//   validate(customerValidators.upsertPaymentPreferenceSchema),
//   customerController.upsertPaymentPreference,
// );

export default router;
