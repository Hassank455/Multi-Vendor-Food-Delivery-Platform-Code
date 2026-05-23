import { Router } from "express";
import cartRoutes from "../modules/cart/cart.route";
import customerAddressRoutes from "../modules/customer_address/customer_address.route";
import orderRoutes from "../modules/order/order.route";
import customerRoutes from "../modules/customer_management/customer.route";

const router = Router();

router.use("/cart", cartRoutes);
router.use("/customer-addresses", customerAddressRoutes);
router.use("/orders", orderRoutes);
router.use("/customers", customerRoutes);

export default router;
