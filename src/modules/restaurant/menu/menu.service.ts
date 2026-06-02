import { buildPaginationMeta } from "../../../common/pagination";
import { MenuRepository } from "./menu.repository";
import {
  CreateMenuItemDto,
  GetOwnerCategoriesQueryDto,
  GetOwnerMenuItemsQueryDto,
  MenuCategoryInputDto,
  MenuItemDto,
  OwnerMenuCategoryDto,
  PaginatedOwnerCategoriesDto,
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
    const restaurant = await this.menuRepository.findRestaurantByOwnerId(
      ownerId,
      restaurantId,
    );

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const existingMenuItem =
      await this.menuRepository.findMenuItemByRestaurantId(
        restaurantId,
        menuItemId,
      );

    if (!existingMenuItem) {
      throw new NotFoundError("Menu item not found");
    }

    if (dto.categoryId !== undefined) {
      const category = await this.menuRepository.findCategoryByRestaurantId(
        restaurantId,
        dto.categoryId,
      );

      if (!category) {
        throw new NotFoundError("Menu category not found");
      }
    }

    const updatedMenuItem = await this.menuRepository.updateMenuItem(
      menuItemId,
      dto,
    );

    return updatedMenuItem;
  }

  async updateMenuItemStatus(
    ownerId: number,
    restaurantId: number,
    menuItemId: number,
    dto: UpdateMenuItemStatusDto,
  ): Promise<MenuItemDto> {
    void this.menuRepository;
    void ownerId;

    const restaurant = await this.menuRepository.findRestaurantByOwnerId(
      ownerId,
      restaurantId,
    );

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const existingMenuItem =
      await this.menuRepository.findMenuItemByRestaurantId(
        restaurantId,
        menuItemId,
      );

    if (!existingMenuItem) {
      throw new NotFoundError("Menu item not found");
    }

    const updatedMenuItem = await this.menuRepository.updateMenuItemStatus(
      menuItemId,
      dto,
    );

    return updatedMenuItem;
  }

  async deleteMenuItem(
    ownerId: number,
    restaurantId: number,
    menuItemId: number,
  ): Promise<void> {
    void this.menuRepository;
    void ownerId;

    const restaurant = await this.menuRepository.findRestaurantByOwnerId(
      ownerId,
      restaurantId,
    );

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const existingMenuItem =
      await this.menuRepository.findMenuItemByRestaurantId(
        restaurantId,
        menuItemId,
      );

    if (!existingMenuItem) {
      throw new NotFoundError("Menu item not found");
    }

    await this.menuRepository.softDeleteMenuItem(menuItemId);
  }
  async getOwnerCategories(
    ownerId: number,
    restaurantId: number,
    query: GetOwnerCategoriesQueryDto,
  ): Promise<PaginatedOwnerCategoriesDto> {
    const restaurant = await this.menuRepository.findRestaurantByOwnerId(
      ownerId,
      restaurantId,
    );

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const { total, categories } = await this.menuRepository.getOwnerCategories(
      restaurantId,
      query,
    );

    return {
      data: categories.map((category) => ({
        id: category.id,
        restaurantId: category.restaurantId,
        name: category.name,
        isActive: category.isActive,
      })),
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }
  async createCategory(
    ownerId: number,
    restaurantId: number,
    dto: MenuCategoryInputDto,
  ): Promise<OwnerMenuCategoryDto> {
    const restaurant = await this.menuRepository.findRestaurantByOwnerId(
      ownerId,
      restaurantId,
    );

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const category = await this.menuRepository.createCategory(
      restaurantId,
      dto,
    );

    return category;
  }
}
