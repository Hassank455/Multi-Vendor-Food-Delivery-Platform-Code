import { Router } from "express";
import { container } from "../../container";
import { isAuth, validate } from "../../middlewares";
import * as cartValidators from "./cart.validation";

const router = Router();
const cartController = container.cartController;

router.post(
  "/items",
  isAuth,
  validate(cartValidators.addItemToCartSchema),
  cartController.addItemToCart,
);

// we can the end point like this : /:cartId/items/:menuItemId
router.patch(
  "/items/:menuItemId",
  // isAuth,
  validate(cartValidators.updateCartItemQuantitySchema),
  cartController.updateCartItemQuantity,
);

// increase quantity by 1
router.patch(
  "/items/:menuItemId/increase",
  // isAuth,
  validate(cartValidators.adjustCartItemQuantitySchema),
  cartController.increaseCartItemQuantity,
);

// decrease quantity by 1
router.patch(
  "/items/:menuItemId/decrease",
  // isAuth,
  validate(cartValidators.adjustCartItemQuantitySchema),
  cartController.decreaseCartItemQuantity,
);

router.get("/", isAuth, (req, res) => {
  res.json({ message: "Get cart" });
});

export default router;
