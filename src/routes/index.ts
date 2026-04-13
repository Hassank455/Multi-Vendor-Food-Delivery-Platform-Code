import { Router } from "express";
import cartRoutes from "../domain_modules/cart/cart.route";

const router = Router();

router.use("/cart", cartRoutes);

export default router;