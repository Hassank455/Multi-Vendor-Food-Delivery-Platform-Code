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

// we can the end point like this : /:cartId/items/:productId/increase
router.patch(
  "/items/:productId",
  isAuth,
  validate(cartValidators.updateCartItemQuantitySchema),
  cartController.increaseCartItemQuantity,
);

router.get("/", isAuth, (req, res) => {
  res.json({ message: "Get cart" });
});

export default router;
