import { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { CustomerAddressService } from "./customer_address.service";
import { StatusCodes } from "http-status-codes";
import {
  CustomerAddressDto,
  UpdateCustomerAddressDto,
} from "./customer_address.dto";

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
  createCustomerAddress = asyncHandler(async (req: Request, res: Response) => {
    const dto: CustomerAddressDto = {
      customerId: req.body.customerId,
      street: req.body.street,
      city: req.body.city,
      buildingNo: req.body.buildingNo,
      postalCode: req.body.postalCode,
      governorate: req.body.governorate,
    };

    const customerAddress = await this.service.createCustomerAddress(dto);

    res.status(StatusCodes.CREATED).json({
      message: "Customer address created successfully",
      data: customerAddress,
    });
  });
  updateCustomerAddress = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const dto: UpdateCustomerAddressDto = {
      street: req.body.street,
      city: req.body.city,
      buildingNo: req.body.buildingNo,
      postalCode: req.body.postalCode,
      governorate: req.body.governorate,
    };
    const customerAddress = await this.service.updateCustomerAddress(
      Number(id),
      dto,
    );
    res.status(StatusCodes.OK).json({
      message: "Customer address updated successfully",
      data: customerAddress,
    });
  });
  deleteCustomerAddress = asyncHandler(
    async (req: Request, res: Response) => {},
  );
}
