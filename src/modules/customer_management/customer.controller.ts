import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../../utils/asyncHandler";
import { ForbiddenError } from "../../errors";
import { CustomRequest } from "../../common/tdos";
import { CustomerService } from "./customer.service";
import {
  UpdateCustomerProfileDto,
  CreateCustomerReviewDto,
} from "./customer.dto";

export class CustomerController {
  constructor(private customerService: CustomerService) {}

  private getCustomerId(req: CustomRequest) {
    const customerId = req.customer?.id;

    if (!customerId) {
      throw new ForbiddenError("Customer authentication is required");
    }

    return customerId;
  }

  getProfile = asyncHandler(async (req: CustomRequest, res: Response) => {
    const customerId = this.getCustomerId(req);

    const customer = await this.customerService.getCustomerProfile(customerId);

    res.status(StatusCodes.OK).json({
      message: "Customer profile fetched successfully",
      data: customer,
    });
  });

  updateProfile = asyncHandler(async (req: CustomRequest, res: Response) => {
    const customerId = this.getCustomerId(req);
    const dto: UpdateCustomerProfileDto = req.body;
    const customer = await this.customerService.updateCustomerProfile(
      customerId,
      dto,
    );

    res.status(StatusCodes.OK).json({
      message: "Customer profile updated successfully",
      data: customer,
    });
  });

  createCustomerReview = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const customerId = this.getCustomerId(req);
      const dto: CreateCustomerReviewDto = req.body;
      const review = await this.customerService.createCustomerReview(
        customerId,
        dto,
      );

      res.status(StatusCodes.CREATED).json({
        message: "Customer review created successfully",
        data: review,
      });
    },
  );

  getCustomerReviews = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const customerId = this.getCustomerId(req);
      const reviews = await this.customerService.getCustomerReviews(customerId);

      res.status(StatusCodes.OK).json({
        message: "Customer reviews fetched successfully",
        data: reviews,
      });
    },
  );

  // deactivateMyAccount = asyncHandler(
  //   async (req: CustomRequest, res: Response) => {
  //     this.getCustomerId(req);
  //   },
  // );

  // getPaymentPreference = asyncHandler(
  //   async (req: CustomRequest, res: Response) => {
  //     this.getCustomerId(req);
  //   },
  // );

  // upsertPaymentPreference = asyncHandler(
  //   async (req: CustomRequest, res: Response) => {
  //     this.getCustomerId(req);
  //   },
  // );
}
