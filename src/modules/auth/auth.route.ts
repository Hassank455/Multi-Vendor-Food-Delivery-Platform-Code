import { Router } from "express";
import { validate } from "../../middlewares";
import { AuthController } from "./auth.controller";
import { AuthRepo } from "./auth.repo";
import { AuthService } from "./auth.service";
import * as authValidators from "./auth.validation";

const router = Router();
const authRepo = new AuthRepo();
const authService = new AuthService(authRepo);
const authController = new AuthController(authService);

router.post(
  "/customer/signup",
  validate(authValidators.customerSignupSchema),
  authController.customerSignup,
);

export default router;
