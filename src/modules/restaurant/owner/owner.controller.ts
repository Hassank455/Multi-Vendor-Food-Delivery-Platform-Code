import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../../../utils/asyncHandler";
import { ForbiddenError } from "../../../errors";
import { CustomRequest } from "../../../common/tdos";
import { OwnerService } from "./owner.service";
import {
  CreateRestaurantDto,
  UpdateRestaurantDto,
  UpdateRestaurantStatusDto,
} from "./owner.dto";

export class OwnerController {
  constructor(private ownerService: OwnerService) {}

  private getOwnerId(req: CustomRequest) {
    const ownerId = req.user?.id;

    if (!ownerId) {
      throw new ForbiddenError("Restaurant owner authentication is required");
    }

    return ownerId;
  }

  createRestaurant = asyncHandler(async (req: CustomRequest, res: Response) => {
    const ownerId = this.getOwnerId(req);
    const dto: CreateRestaurantDto = req.body;

    const restaurant = await this.ownerService.createRestaurant(ownerId, dto);

    res.status(StatusCodes.CREATED).json({
      message: "Restaurant draft created successfully",
      data: restaurant,
    });
  });

  getMyRestaurant = asyncHandler(async (req: CustomRequest, res: Response) => {
    const ownerId = this.getOwnerId(req);
    const restaurant = await this.ownerService.getMyRestaurant(ownerId);

    res.status(StatusCodes.OK).json({
      message: "Owner restaurant fetched successfully",
      data: restaurant,
    });
  });

  updateRestaurant = asyncHandler(async (req: CustomRequest, res: Response) => {
    const ownerId = this.getOwnerId(req);
    const restaurantId = Number(req.params.restaurantId);
    const dto: UpdateRestaurantDto = req.body;

    const restaurant = await this.ownerService.updateRestaurant(
      ownerId,
      restaurantId,
      dto,
    );

    res.status(StatusCodes.OK).json({
      message: "Restaurant updated successfully",
      data: restaurant,
    });
  });

  updateRestaurantStatus = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const ownerId = this.getOwnerId(req);
      const restaurantId = Number(req.params.restaurantId);
      const dto: UpdateRestaurantStatusDto = req.body;

      const restaurant = await this.ownerService.updateRestaurantStatus(
        ownerId,
        restaurantId,
        dto,
      );

      res.status(StatusCodes.OK).json({
        message: "Restaurant status updated successfully",
        data: restaurant,
      });
    },
  );
}
