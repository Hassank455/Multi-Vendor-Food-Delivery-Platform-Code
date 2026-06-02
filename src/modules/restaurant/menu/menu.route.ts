import { Router } from "express";
import { isAuth, validate } from "../../../middlewares";
import { restaurantModule } from "../restaurant.module";
import * as menuValidators from "./menu.validation";

const router = Router();
const menuController = restaurantModule.menuController;

router.post(
  "/:restaurantId/menu-items",
  isAuth,
  validate(menuValidators.createMenuItemSchema),
  menuController.createMenuItem,
);

router.get(
  "/:restaurantId/menu-items",
  isAuth,
  validate(menuValidators.getOwnerMenuItemsSchema),
  menuController.getOwnerMenuItems,
);

router.patch(
  "/:restaurantId/menu-items/:menuItemId",
  isAuth,
  validate(menuValidators.updateMenuItemSchema),
  menuController.updateMenuItem,
);

router.patch(
  "/:restaurantId/menu-items/:menuItemId/status",
  isAuth,
  validate(menuValidators.updateMenuItemStatusSchema),
  menuController.updateMenuItemStatus,
);

router.delete(
  "/:restaurantId/menu-items/:menuItemId",
  isAuth,
  validate(menuValidators.deleteMenuItemSchema),
  menuController.deleteMenuItem,
);

router.get(
  "/:restaurantId/categories",
  isAuth,
  validate(menuValidators.getOwnerCategoriesSchema),
  menuController.getOwnerCategories,
);

router.post(
  "/:restaurantId/categories",
  isAuth,
  validate(menuValidators.menuCategorySchema),
  menuController.createCategory,
);

export default router;
