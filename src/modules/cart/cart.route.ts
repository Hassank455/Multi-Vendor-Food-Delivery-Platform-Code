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

router.get("/", isAuth, (req, res) => {
  res.json({ message: "Get cart" });
});

export default router;
