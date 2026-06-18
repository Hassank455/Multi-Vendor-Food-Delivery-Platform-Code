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
  validate(authValidators.customerLoginSchema),
  authController.customerLogin,
);

export default router;


/*
التقسيم المقترح
1. تنظيف jwt.ts وتثبيت token contract
2. إعادة تصميم isAuth.ts بدون dev headers
3. تثبيت customer login على access + refresh
4. إضافة جدول session/refresh token في الـ schema
5. تنفيذ refresh endpoint
6. تنفيذ logout current session
7. مراجعة owner/admin compatibility
8. اختبار الفلو الكامل end-to-end
*/