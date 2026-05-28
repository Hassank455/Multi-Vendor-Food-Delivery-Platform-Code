import { buildPaginationMeta } from "../../../common/pagination";
import { MenuRepository } from "./menu.repository";
import {
  CreateMenuItemDto,
  GetOwnerMenuItemsQueryDto,
  MenuItemDto,
  PaginatedOwnerMenuItemsDto,
  UpdateMenuItemDto,
  UpdateMenuItemStatusDto,
} from "./menu.dto";

export class MenuService {
  constructor(private menuRepository: MenuRepository) {}

  async createMenuItem(
    ownerId: number,
    restaurantId: number,
    dto: CreateMenuItemDto,
  ): Promise<MenuItemDto> {
    void this.menuRepository;
    void ownerId;

    return {
      id: 0,
      restaurantId,
      categoryId: dto.categoryId,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      isAvailable: true,
    };
  }

  async getOwnerMenuItems(
    ownerId: number,
    restaurantId: number,
    query: GetOwnerMenuItemsQueryDto,
  ): Promise<PaginatedOwnerMenuItemsDto> {
    void this.menuRepository;
    void ownerId;

    return {
      data: [],
      pagination: buildPaginationMeta(query.page, query.limit, 0),
    };
  }

  async updateMenuItem(
    ownerId: number,
    restaurantId: number,
    menuItemId: number,
    dto: UpdateMenuItemDto,
  ): Promise<MenuItemDto> {
    void this.menuRepository;
    void ownerId;

    return {
      id: menuItemId,
      restaurantId,
      categoryId: dto.categoryId ?? 0,
      name: dto.name ?? "Draft menu item",
      description: dto.description ?? "",
      price: dto.price ?? 0,
      isAvailable: true,
    };
  }

  async updateMenuItemStatus(
    ownerId: number,
    restaurantId: number,
    menuItemId: number,
    dto: UpdateMenuItemStatusDto,
  ): Promise<MenuItemDto> {
    void this.menuRepository;
    void ownerId;

    return {
      id: menuItemId,
      restaurantId,
      categoryId: 0,
      name: "Draft menu item",
      description: "",
      price: 0,
      isAvailable: dto.isAvailable,
    };
  }

  async deleteMenuItem(
    ownerId: number,
    restaurantId: number,
    menuItemId: number,
  ): Promise<{ menuItemId: number; restaurantId: number; deleted: boolean }> {
    void this.menuRepository;
    void ownerId;

    return {
      menuItemId,
      restaurantId,
      deleted: true,
    };
  }
}
