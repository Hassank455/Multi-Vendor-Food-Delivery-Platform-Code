import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "../../../utils/asyncHandler";
import { ForbiddenError } from "../../../errors";
import { CustomRequest } from "../../../common/tdos";
import { MenuService } from "./menu.service";
import {
  CreateMenuItemDto,
  GetOwnerCategoriesQueryDto,
  GetOwnerMenuItemsQueryDto,
  MenuCategoryInputDto,
  UpdateMenuItemDto,
  UpdateMenuItemStatusDto,
} from "./menu.dto";

export class MenuController {
  constructor(private menuService: MenuService) {}

  private getOwnerId(req: CustomRequest) {
    const ownerId = req.user?.id;

    if (!ownerId) {
      throw new ForbiddenError("Restaurant owner authentication is required");
    }

    return ownerId;
  }

  createMenuItem = asyncHandler(async (req: CustomRequest, res: Response) => {
    const ownerId = this.getOwnerId(req);
    const restaurantId = Number(req.params.restaurantId);
    const dto: CreateMenuItemDto = req.body;

    const menuItem = await this.menuService.createMenuItem(
      ownerId,
      restaurantId,
      dto,
    );

    res.status(StatusCodes.CREATED).json({
      message: "Menu item draft created successfully",
      data: menuItem,
    });
  });

  getOwnerMenuItems = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const ownerId = this.getOwnerId(req);
      const restaurantId = Number(req.params.restaurantId);
      const query = req.query as unknown as GetOwnerMenuItemsQueryDto;

      const result = await this.menuService.getOwnerMenuItems(
        ownerId,
        restaurantId,
        query,
      );

      res.status(StatusCodes.OK).json({
        message: "Owner menu items fetched successfully",
        data: result.data,
        pagination: result.pagination,
      });
    },
  );

  updateMenuItem = asyncHandler(async (req: CustomRequest, res: Response) => {
    const ownerId = this.getOwnerId(req);
    const restaurantId = Number(req.params.restaurantId);
    const menuItemId = Number(req.params.menuItemId);
    const dto: UpdateMenuItemDto = req.body;

    const menuItem = await this.menuService.updateMenuItem(
      ownerId,
      restaurantId,
      menuItemId,
      dto,
    );

    res.status(StatusCodes.OK).json({
      message: "Menu item updated successfully",
      data: menuItem,
    });
  });

  updateMenuItemStatus = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const ownerId = this.getOwnerId(req);
      const restaurantId = Number(req.params.restaurantId);
      const menuItemId = Number(req.params.menuItemId);
      const dto: UpdateMenuItemStatusDto = req.body;

      const menuItem = await this.menuService.updateMenuItemStatus(
        ownerId,
        restaurantId,
        menuItemId,
        dto,
      );

      res.status(StatusCodes.OK).json({
        message: "Menu item status updated successfully",
        data: menuItem,
      });
    },
  );

  deleteMenuItem = asyncHandler(async (req: CustomRequest, res: Response) => {
    const ownerId = this.getOwnerId(req);
    const restaurantId = Number(req.params.restaurantId);
    const menuItemId = Number(req.params.menuItemId);

    await this.menuService.deleteMenuItem(ownerId, restaurantId, menuItemId);

    res.status(StatusCodes.NO_CONTENT).send();
  });

  getOwnerCategories = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const ownerId = this.getOwnerId(req);
      const restaurantId = Number(req.params.restaurantId);
      const query = req.query as unknown as GetOwnerCategoriesQueryDto;

      const result = await this.menuService.getOwnerCategories(
        ownerId,
        restaurantId,
        query,
      );

      res.status(StatusCodes.OK).json({
        message: "Owner categories fetched successfully",
        data: result.data,
        pagination: result.pagination,
      });
    },
  );
  createCategory = asyncHandler(async (req: CustomRequest, res: Response) => {
    const ownerId = this.getOwnerId(req);
    const restaurantId = Number(req.params.restaurantId);
    const dto: MenuCategoryInputDto = req.body;

    const category = await this.menuService.createCategory(
      ownerId,
      restaurantId,
      dto,
    );

    res.status(StatusCodes.CREATED).json({
      message: "Menu category created successfully",
      data: category,
    });
  });
}
