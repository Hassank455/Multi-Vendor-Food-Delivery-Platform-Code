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
import { NotFoundError } from "../../../errors";

export class MenuService {
  constructor(private menuRepository: MenuRepository) {}

  async createMenuItem(
    ownerId: number,
    restaurantId: number,
    dto: CreateMenuItemDto,
  ): Promise<MenuItemDto> {
    const restaurant = await this.menuRepository.findRestaurantByOwnerId(
      ownerId,
      restaurantId,
    );

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const category = await this.menuRepository.findCategoryByRestaurantId(
      restaurantId,
      dto.categoryId,
    );

    if (!category) {
      throw new NotFoundError("Menu category not found");
    }

    const menuItem = await this.menuRepository.createMenuItem(
      restaurantId,
      dto,
    );

    return menuItem;
  }

  async getOwnerMenuItems(
    ownerId: number,
    restaurantId: number,
    query: GetOwnerMenuItemsQueryDto,
  ): Promise<PaginatedOwnerMenuItemsDto> {
    const restaurant = await this.menuRepository.findRestaurantByOwnerId(
      ownerId,
      restaurantId,
    );

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }
    const { total, menuItems } = await this.menuRepository.getOwnerMenuItems(
      restaurantId,
      query,
    );
    return {
      data: menuItems,
      pagination: buildPaginationMeta(query.page, query.limit, total),
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
      category: {
        id: dto.categoryId ?? 0,
        name: "Draft category",
      },
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
      category: {
        id: 0,
        name: "Draft category",
      },
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
