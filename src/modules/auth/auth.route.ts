import { Router } from "express";
import { validate } from "../../middlewares";
import { AuthController } from "./auth.controller";
import { AuthRepo } from "./auth.repo";
import { AuthService } from "./auth.service";
import * as authValidators from "./auth.validation";
import { MailService } from "../../services/mail.service";

const router = Router();
const authRepo = new AuthRepo();
const mailService = new MailService();
const authService = new AuthService(authRepo, mailService);
const authController = new AuthController(authService);

router.post(
  "/customer/signup",
  validate(authValidators.customerSignupSchema),
  authController.customerSignup,
);

router.post(
  "/customer/verify-email",
  validate(authValidators.verifyEmailSchema),
  authController.verifyEmail,
);

router.post(
  "/customer/resend-verification-code",
  validate(authValidators.resendVerificationCodeSchema),
  authController.resendVerificationCode,
);

router.post(
  "/customer/login",
  validate(authValidators.loginBodySchema),
  authController.customerLogin,
);

router.post(
  "/customer/refresh",
  validate(authValidators.refreshTokenSchema),
  authController.refreshCustomerToken,
);

router.post(
  "/customer/logout",
  validate(authValidators.logoutTokenSchema),
  authController.logoutCustomer,
);

router.post(
  "/user/login",
  validate(authValidators.loginBodySchema),
  authController.userLogin,
);

router.post(
  "/user/refresh",
  validate(authValidators.refreshTokenSchema),
  authController.userRefreshToken,
);

router.post(
  "/user/logout",
  validate(authValidators.logoutTokenSchema),
  authController.logoutUser,
);

export default router;
