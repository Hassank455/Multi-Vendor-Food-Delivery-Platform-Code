import { Router } from "express";
import { container } from "../../container";
import { isAuth, validate } from "../../middlewares";
import asyncHandler from "../../utils/asyncHandler";
import * as cartValidators from "./cart.validation";

const router = Router();
const cartController = container.cartController;

router.post(
  "/items",
  isAuth,
  validate(cartValidators.addItemToCartSchema),
  asyncHandler(cartController.addItemToCart),
);

// we can the end point like this : /:cartId/items/:menuItemId/increase
router.patch(
  "/items/:menuItemId",
  // isAuth,
  validate(cartValidators.updateCartItemQuantitySchema),
  asyncHandler(cartController.updateCartItemQuantity),
);

router.get("/", isAuth, (req, res) => {
  res.json({ message: "Get cart" });
});

export default router;
