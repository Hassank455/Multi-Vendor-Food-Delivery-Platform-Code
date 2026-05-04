import { Router } from "express";
import cartRoutes from "../modules/cart/cart.route";
import orderRoutes from "../modules/order/order.route";

const router = Router();

router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);

export default router;
