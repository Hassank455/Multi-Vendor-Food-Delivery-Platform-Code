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
  isAuth,
  validate(orderValidators.placeOrderSchema),
  orderController.placeOrder,
);

router.get("/", isAuth, orderController.getCustomerOrders);
router.get(
  "/restaurant",
  isAuth,
  validate(orderValidators.getRestaurantOrdersSchema),
  orderController.getRestaurantOrders,
); // TODO: here we can also add filters like status and date range etc.
router.get(
  "/restaurant/:id",
  isAuth,
  validate(orderValidators.getRestaurantOrderDetailsSchema),
  orderController.getRestaurantOrderDetails,
);
router.patch(
  "/restaurant/:id/status",
  isAuth,
  validate(orderValidators.updateRestaurantOrderStatusSchema),
  orderController.updateOrderStatus,
);

router.get(
  "/:id",
  isAuth,
  validate(orderValidators.getCustomerOrderByIdSchema),
  orderController.getCustomerOrderById,
);

router.patch(
  "/:id/cancel",
  isAuth,
  validate(orderValidators.cancelOrderSchema),
  orderController.cancelCustomerOrder,
);

export default router;
