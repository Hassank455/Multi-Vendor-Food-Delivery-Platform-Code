import { Request, Response } from "express";
import { OrderService } from "./order.service";
import asyncHandler from "../../utils/asyncHandler";

export class OrderController {
  placeOrder = asyncHandler(async (req: Request, res: Response) => {});
}
