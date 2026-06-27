import { Router } from "express";
import { RoleEnum } from "../../generated/prisma/enums";
import { allowRoles, isAuth, validate } from "../../middlewares";
import { UserController } from "./user.controller";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.services";
import * as userValidators from "./user.validation";

const router = Router();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post(
  "/admins",
  isAuth,
  allowRoles(RoleEnum.SUPER_ADMIN),
  validate(userValidators.createAdminSchema),
  userController.createAdmin,
);

router.post(
  "/restaurant-owners",
  isAuth,
  allowRoles(RoleEnum.ADMIN, RoleEnum.SUPER_ADMIN),
  validate(userValidators.createRestaurantOwnerSchema),
  userController.createRestaurantOwner,
);

export default router;
