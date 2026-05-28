import { Router } from "express";
import ownerRoutes from "./owner/owner.route";
import menuRoutes from "./menu/menu.route";
import catalogRoutes from "./catalog/catalog.route";

const router = Router();

router.use("/owner/restaurants", ownerRoutes);
router.use("/owner/restaurants", menuRoutes);
router.use("/restaurants", catalogRoutes);

export default router;
