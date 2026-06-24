import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../../utils/asyncHandler";
import { ForbiddenError } from "../../errors";
import { CustomerService } from "./customer.service";
import {
  UpdateCustomerProfileDto,
  CreateCustomerReviewDto,
  GetCustomerReviewsQueryDto,
  UpsertPaymentPreferenceDto,
} from "./customer.dto";

export class CustomerController {
  constructor(private customerService: CustomerService) {}

  private getCustomerId(req: Request) {
    const customerId = req.customer?.id;

    if (!customerId) {
      throw new ForbiddenError("Customer authentication is required");
    }

    return customerId;
  }

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const customerId = this.getCustomerId(req);

    const customer = await this.customerService.getCustomerProfile(customerId);

    res.status(StatusCodes.OK).json({
      message: "Customer profile fetched successfully",
      data: customer,
    });
  });

  updateProfile = asyncHandler(async (req: Request, res: Response) => {
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
    async (req: Request, res: Response) => {
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
    async (req: Request, res: Response) => {
      const customerId = this.getCustomerId(req);
      // explain this line
      // The query parameters are cast to the expected DTO type
      // we are typed as unknown first to bypass the type checking, then we assert it as the expected DTO type, this is because the query parameters are always of type string, and we need to convert them to the expected types in the DTO, for example, page and limit should be numbers, but they come as strings in the query parameters, so we need to convert them to numbers before passing them to the service layer
      const query = req.query as unknown as GetCustomerReviewsQueryDto;

      const reviews = await this.customerService.getCustomerReviews(
        customerId,
        query,
      );

      res.status(StatusCodes.OK).json({
        message: "Customer reviews fetched successfully",
        data: reviews.data,
        pagination: reviews.pagination,
      });
    },
  );

  deactivateMyAccount = asyncHandler(
    async (req: Request, res: Response) => {
      const customerId = this.getCustomerId(req);

      await this.customerService.deactivateMyAccount(customerId);

      res.status(StatusCodes.OK).json({
        message: "Customer account deactivated successfully",
      });
    },
  );

  getPaymentPreference = asyncHandler(
    async (req: Request, res: Response) => {
      const customerId = this.getCustomerId(req);
      const paymentPreference =
        await this.customerService.getPaymentPreference(customerId);

      res.status(StatusCodes.OK).json({
        message: "Customer payment preference fetched successfully",
        data: paymentPreference,
      });
    },
  );

  upsertPaymentPreference = asyncHandler(
    async (req: Request, res: Response) => {
      const customerId = this.getCustomerId(req);
      const dto: UpsertPaymentPreferenceDto = req.body;
      const paymentPreference =
        await this.customerService.upsertPaymentPreference(customerId, dto);

      res.status(StatusCodes.OK).json({
        message: "Customer payment preference updated successfully",
        data: paymentPreference,
      });
    },
  );
}
