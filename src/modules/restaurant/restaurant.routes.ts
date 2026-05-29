import { Router } from "express";
import ownerRoutes from "./owner/owner.route";
import menuRoutes from "./menu/menu.route";
import catalogRoutes from "./catalog/catalog.route";

const router = Router();

// restaurant/owner -> This section is for the restaurant owner.
// write-heavy and tied to permissions.
router.use("/owner/restaurants", ownerRoutes);
// restaurant/menu -> This section is specific to the menu management of a particular restaurant.
router.use("/owner/restaurants", menuRoutes);
// restaurant/catalog -> This section is for reading and exploration.
router.use("/restaurants", catalogRoutes);

export default router;
