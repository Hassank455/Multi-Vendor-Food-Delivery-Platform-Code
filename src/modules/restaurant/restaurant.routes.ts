import { Router } from "express";
import { isAuth, validate } from "../../middlewares";
import { restaurantModule } from "./restaurant.module";
import {
  createMenuCategorySchema,
  createMenuItemSchema,
  createRestaurantSchema,
  deleteMenuItemSchema,
  getOwnerCategoriesSchema,
  getOwnerMenuItemsSchema,
  getRecommendedRestaurantsSchema,
  getRestaurantByIdSchema,
  getRestaurantMenuSchema,
  getRestaurantsSchema,
  getTopRatedRestaurantsSchema,
  updateMenuCategorySchema,
  updateMenuCategoryStatusSchema,
  updateMenuItemSchema,
  updateMenuItemStatusSchema,
  updateRestaurantSchema,
  updateRestaurantStatusSchema,
} from "./restaurant.validation";

const router = Router();
const { ownerController, menuController, catalogController } = restaurantModule;

// restaurant/owner -> This section is for the restaurant owner.
// write-heavy and tied to permissions.
router.post(
  "/owner/restaurants",
  isAuth,
  validate(createRestaurantSchema),
  ownerController.createRestaurant,
);

router.get("/owner/restaurants/me", isAuth, ownerController.getRestaurant);

router.patch(
  "/owner/restaurants/:restaurantId",
  isAuth,
  validate(updateRestaurantSchema),
  ownerController.updateRestaurant,
);

router.patch(
  "/owner/restaurants/:restaurantId/status",
  isAuth,
  validate(updateRestaurantStatusSchema),
  ownerController.updateRestaurantStatus,
);

// restaurant/menu -> This section is specific to the menu management of a particular restaurant.
router.post(
  "/owner/restaurants/:restaurantId/menu-items",
  isAuth,
  validate(createMenuItemSchema),
  menuController.createMenuItem,
);

router.get(
  "/owner/restaurants/:restaurantId/menu-items",
  isAuth,
  validate(getOwnerMenuItemsSchema),
  menuController.getOwnerMenuItems,
);

router.patch(
  "/owner/restaurants/:restaurantId/menu-items/:menuItemId",
  isAuth,
  validate(updateMenuItemSchema),
  menuController.updateMenuItem,
);

router.patch(
  "/owner/restaurants/:restaurantId/menu-items/:menuItemId/status",
  isAuth,
  validate(updateMenuItemStatusSchema),
  menuController.updateMenuItemStatus,
);

router.delete(
  "/owner/restaurants/:restaurantId/menu-items/:menuItemId",
  isAuth,
  validate(deleteMenuItemSchema),
  menuController.deleteMenuItem,
);

router.get(
  "/owner/restaurants/:restaurantId/categories",
  isAuth,
  validate(getOwnerCategoriesSchema),
  menuController.getOwnerCategories,
);

router.post(
  "/owner/restaurants/:restaurantId/categories",
  isAuth,
  validate(createMenuCategorySchema),
  menuController.createCategory,
);

router.patch(
  "/owner/restaurants/:restaurantId/categories/:categoryId",
  isAuth,
  validate(updateMenuCategorySchema),
  menuController.updateCategory,
);

router.patch(
  "/owner/restaurants/:restaurantId/categories/:categoryId/status",
  isAuth,
  validate(updateMenuCategoryStatusSchema),
  menuController.updateCategoryStatus,
);

// restaurant/catalog -> This section is for reading and exploration.
router.get(
  "/restaurants",
  validate(getRestaurantsSchema),
  catalogController.getRestaurants,
);

router.get(
  "/restaurants/top-rated",
  validate(getTopRatedRestaurantsSchema),
  catalogController.getTopRatedRestaurants,
);

router.get(
  "/restaurants/recommendations",
  validate(getRecommendedRestaurantsSchema),
  catalogController.getRecommendedRestaurants,
);

router.get(
  "/restaurants/:restaurantId",
  validate(getRestaurantByIdSchema),
  catalogController.getRestaurantById,
);

router.get(
  "/restaurants/:restaurantId/menu",
  validate(getRestaurantMenuSchema),
  catalogController.getRestaurantMenu,
);

export default router;
