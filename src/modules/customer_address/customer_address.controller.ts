import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { CustomerAddressService } from "./customer_address.service";
import { StatusCodes } from "http-status-codes";

export class CustomerAddressController {
  constructor(private customerAddressService: CustomerAddressService) {}

  get service() {
    return this.customerAddressService;
  }

  getCustomerAddresses = asyncHandler(async (req: Request, res: Response) => {
    const { customerId } = req.body;
    const customerAddresses =
      await this.service.getCustomerAddresses(customerId);
    res.status(StatusCodes.OK).json({
      message: "Customer addresses fetched successfully",
      data: customerAddresses,
    });
  });
  getCustomerAddress = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { customerId } = req.body;

    const customerAddress = await this.service.getCustomerAddress(
      customerId,
      Number(id),
    );
    res.status(StatusCodes.OK).json({
      message: "Customer address fetched successfully",
      data: customerAddress,
    });
  });
  createCustomerAddress = asyncHandler(
    async (req: Request, res: Response) => {},
  );
  updateCustomerAddress = asyncHandler(
    async (req: Request, res: Response) => {},
  );
  deleteCustomerAddress = asyncHandler(
    async (req: Request, res: Response) => {},
  );
}
