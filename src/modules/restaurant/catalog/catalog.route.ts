import { Router } from "express";
import { validate } from "../../../middlewares";
import { restaurantModule } from "../restaurant.module";
import * as catalogValidators from "./catalog.validation";

const router = Router();
const catalogController = restaurantModule.catalogController;

router.get(
  "/",
  validate(catalogValidators.getRestaurantsSchema),
  catalogController.getRestaurants,
);

router.get(
  "/top-rated",
  validate(catalogValidators.getTopRatedRestaurantsSchema),
  catalogController.getTopRatedRestaurants,
);

router.get(
  "/:restaurantId",
  validate(catalogValidators.getRestaurantByIdSchema),
  catalogController.getRestaurantById,
);

router.get(
  "/:restaurantId/menu",
  validate(catalogValidators.getRestaurantMenuSchema),
  catalogController.getRestaurantMenu,
);

export default router;
