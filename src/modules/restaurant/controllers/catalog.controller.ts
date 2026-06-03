import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../../../utils/asyncHandler";
import { CatalogService } from "../services/catalog.service";
import {
  GetRestaurantsQueryDto,
  SearchMenuItemsQueryDto,
} from "../restaurant.dto";

export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  getRestaurants = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as GetRestaurantsQueryDto;
    const result = await this.catalogService.getRestaurants(query);

    res.status(StatusCodes.OK).json({
      message: "Restaurants fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  });

  getTopRatedRestaurants = asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as GetRestaurantsQueryDto;
    const result = await this.catalogService.getTopRatedRestaurants(query);

    res.status(StatusCodes.OK).json({
      message: "Top rated restaurants fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  });

  getRestaurantById = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    const restaurant =
      await this.catalogService.getRestaurantById(restaurantId);

    res.status(StatusCodes.OK).json({
      message: "Restaurant fetched successfully",
      data: restaurant,
    });
  });

  getRestaurantMenu = asyncHandler(async (req: Request, res: Response) => {
    const restaurantId = Number(req.params.restaurantId);
    const query = req.query as unknown as SearchMenuItemsQueryDto;
    const result = await this.catalogService.getRestaurantMenu(
      restaurantId,
      query,
    );

    res.status(StatusCodes.OK).json({
      message: "Restaurant menu fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  });

  getRecommendedRestaurants = asyncHandler(
    async (req: Request, res: Response) => {
      const query = req.query as unknown as GetRestaurantsQueryDto;

      const result = await this.catalogService.getRecommendedRestaurants(query);

      res.status(StatusCodes.OK).json({
        message: "Recommended restaurants fetched successfully",
        data: result.data,
        pagination: result.pagination,
      });
    },
  );
}
