import { Router } from "express";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { OrderRepo } from "./order.repo";
import { CartRepository } from "../cart/cart.repository";

const router = Router();

const orderRepo = new OrderRepo();
const cartRepo = new CartRepository();
const orderService = new OrderService(orderRepo, cartRepo);
const orderController = new OrderController(orderService);

router.post("/", orderController.placeOrder);

export default router;
