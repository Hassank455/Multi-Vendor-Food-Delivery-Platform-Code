import { Router } from "express";
import { isAuth, validate } from "../../../middlewares";
import { restaurantModule } from "../restaurant.module";
import * as ownerValidators from "./owner.validation";

const router = Router();
const ownerController = restaurantModule.ownerController;

router.post(
  "/",
  isAuth,
  validate(ownerValidators.createRestaurantSchema),
  ownerController.createRestaurant,
);

router.get("/me", isAuth, ownerController.getRestaurant);

router.patch(
  "/:restaurantId",
  isAuth,
  validate(ownerValidators.updateRestaurantSchema),
  ownerController.updateRestaurant,
);

router.patch(
  "/:restaurantId/status",
  isAuth,
  validate(ownerValidators.updateRestaurantStatusSchema),
  ownerController.updateRestaurantStatus,
);

export default router;
