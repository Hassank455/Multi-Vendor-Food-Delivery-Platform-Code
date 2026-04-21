import { Router } from "express";
import prisma from "../../lib/prisma";
import { CartController } from "./cart.controller";
import { validateAddItem, validateCreateCart } from "./cart.validation";
import { PrismaCartEventStoreRepository } from "./repository/prisma-cart-event-store.repository";
import { PrismaCartReadRepository } from "./repository/prisma-cart-read.repository";

import { CartProjection } from "./service/cart.projection";
import { CartService } from "./service/cart.service";

const router = Router();

const eventStoreRepository = new PrismaCartEventStoreRepository(prisma);
const readRepository = new PrismaCartReadRepository(prisma);
const projection = new CartProjection(readRepository);
const cartService = new CartService(
  eventStoreRepository,
  readRepository,
  projection,
);
const controller = new CartController(cartService);

router.post("/carts", validateCreateCart, controller.createCart);
router.get("/carts/:cartId", controller.getCart);
router.get("/carts/:cartId/events", controller.getCartEvents);
router.post("/carts/:cartId/items", validateAddItem, controller.addItem);

export default router;
