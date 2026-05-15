import { Request, Response } from "express";
import { OrderService } from "./order.service";
import asyncHandler from "../../utils/asyncHandler";
import { PlaceOrderDto } from "./order.dto";
import { StatusCodes } from "http-status-codes";
import { CustomRequest } from "../../common/tdos";
import { ForbiddenError } from "../../errors";

export class OrderController {
  constructor(private orderService: OrderService) {}

  private getCustomerId(req: CustomRequest) {
    const customerId = req.customer?.id;

    if (!customerId) {
      throw new ForbiddenError("Customer authentication is required");
    }

    return customerId;
  }
  placeOrder = asyncHandler(async (req: CustomRequest, res: Response) => {
    const customerId = this.getCustomerId(req);
    const dto: PlaceOrderDto = {
      customerAddressId: req.body.customerAddressId,
      paymentMethod: req.body.paymentMethod,
    };
    const order = await this.orderService.placeOrder(customerId, dto);
    res
      .status(StatusCodes.CREATED)
      .json({ message: "Order placed successfully", data: order });
  });

  getCustomerOrders = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const customerId = this.getCustomerId(req);
      const orders = await this.orderService.getCustomerOrders(customerId);

      res.status(StatusCodes.OK).json({
        message: "Customer orders fetched successfully",
        data: orders,
      });
    },
  );

  getCustomerOrderById = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const customerId = this.getCustomerId(req);
      const orderId = Number(req.params.id);
      const order = await this.orderService.getCustomerOrderById(
        customerId,
        orderId,
      );
      res.status(StatusCodes.OK).json({
        message: "Customer order fetched successfully",
        data: order,
      });
    },
  );

  // cancel order, only if it's in PENDING and CONFIRMED status
  cancelCustomerOrder = asyncHandler(async (req: CustomRequest, res: Response) => {
    const customerId = this.getCustomerId(req);
    const orderId = Number(req.params.id);

    const order = await this.orderService.cancelCustomerOrder(customerId, orderId);

    res.status(StatusCodes.OK).json({
      message: "Order cancelled successfully",
      data: order,
    });
  });
  getRestaurantOrders = asyncHandler(
    async (req: CustomRequest, res: Response) => {},
  );
  getRestaurantOrderDetails = asyncHandler(
    async (req: CustomRequest, res: Response) => {},
  );
  updateOrderStatus = asyncHandler(
    async (req: CustomRequest, res: Response) => {},
  );
}
