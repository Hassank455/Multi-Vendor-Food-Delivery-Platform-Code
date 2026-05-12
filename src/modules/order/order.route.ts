import { Router } from "express";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { OrderRepo } from "./order.repo";
import { CartRepository } from "../cart/cart.repository";
import * as orderValidators from "./order.validation";
import { isAuth, validate } from "../../middlewares";
import { CustomerAddressRepo } from "../customer_address/customer_address.repo";

const router = Router();

const orderRepo = new OrderRepo();
const cartRepo = new CartRepository();
const customerAddressRepo = new CustomerAddressRepo();
const orderService = new OrderService(orderRepo, cartRepo, customerAddressRepo);
const orderController = new OrderController(orderService);

router.post(
  "/",
  validate(orderValidators.placeOrderSchema),
  orderController.placeOrder,
);

export default router;
