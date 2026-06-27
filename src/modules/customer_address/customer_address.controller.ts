import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { CustomerAddressService } from "./customer_address.service";
import { StatusCodes } from "http-status-codes";
import {
  CreateCustomerAddressDto,
  UpdateCustomerAddressDto,
} from "./customer_address.dto";
import { ForbiddenError } from "../../errors";

export class CustomerAddressController {
  constructor(private customerAddressService: CustomerAddressService) {}

  private getCustomerId(req: Request) {
    const customerId = req.customer?.id;

    if (!customerId) {
      throw new ForbiddenError("Customer authentication is required");
    }

    return customerId;
  }

  getCustomerAddresses = asyncHandler(
    async (req: Request, res: Response) => {
      const customerId = this.getCustomerId(req);
      const customerAddresses =
        await this.customerAddressService.getCustomerAddresses(customerId);

      res.status(StatusCodes.OK).json({
        message: "Customer addresses fetched successfully",
        data: customerAddresses,
      });
    },
  );

  getCustomerAddress = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const customerId = this.getCustomerId(req);

    const customerAddress =
      await this.customerAddressService.getCustomerAddress(
        customerId,
        Number(id),
      );

    res.status(StatusCodes.OK).json({
      message: "Customer address fetched successfully",
      data: customerAddress,
    });
  });

  createCustomerAddress = asyncHandler(
    async (req: Request, res: Response) => {
      const customerId = this.getCustomerId(req);
      const dto: CreateCustomerAddressDto = req.body;

      const customerAddress =
        await this.customerAddressService.createCustomerAddress(customerId, dto);

      res.status(StatusCodes.CREATED).json({
        message: "Customer address created successfully",
        data: customerAddress,
      });
    },
  );

  updateCustomerAddress = asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;
      const customerId = this.getCustomerId(req);
      const dto: UpdateCustomerAddressDto = req.body;

      const customerAddress =
        await this.customerAddressService.updateCustomerAddress(
          customerId,
          Number(id),
          dto,
        );

      res.status(StatusCodes.OK).json({
        message: "Customer address updated successfully",
        data: customerAddress,
      });
    },
  );

  deleteCustomerAddress = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const customerId = this.getCustomerId(req);

    await this.customerAddressService.deleteCustomerAddress(
      customerId,
      Number(id),
    );

    res.status(StatusCodes.OK).json({
      message: "Customer address deleted successfully",
    });
  });
}
