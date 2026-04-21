import { Router } from "express";
import cartRoutes from "../domain_modules/cart/cart.route";
import cartEventSourcingRoutes from "../domain_modules/cart_event_sourcing/cart.route";

const router = Router();

router.use("/cart", cartRoutes);
router.use("/cart_event_sourcing", cartEventSourcingRoutes);

export default router;
