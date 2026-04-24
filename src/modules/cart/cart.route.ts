import { Router } from "express";
import { CartController } from "./cart.controller";
import { isAuth } from "../../middlewares";

const router = Router();
const cartController = new CartController();

router.post("/items", isAuth, cartController.addItemToCart);

router.get("/", isAuth, (req, res) => {
  res.json({ message: "Get cart" });
});

export default router;
