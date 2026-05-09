import { Request, Response } from "express";
import { OrderService } from "./order.service";
import asyncHandler from "../../utils/asyncHandler";
import { PlaceOrderDto } from "./order.dto";
import { StatusCodes } from "http-status-codes";

export class OrderController {
  constructor(private orderService: OrderService) {}
  placeOrder = asyncHandler(async (req: Request, res: Response) => {
    const dto: PlaceOrderDto = {
      customerId: req.body.customerId,
      addressId: req.body.addressId,
      paymentMethod: req.body.paymentMethod,
    };
    const order = await this.orderService.placeOrder(dto);
    res
      .status(StatusCodes.CREATED)
      .json({ message: "Order placed successfully", data: order });
  });
}
