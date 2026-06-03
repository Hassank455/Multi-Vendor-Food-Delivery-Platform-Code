import prisma from "../../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import {
  CreateMenuItemDto,
  GetOwnerCategoriesQueryDto,
  GetOwnerMenuItemsQueryDto,
  MenuCategoryInputDto,
  MenuItemDto,
  UpdateMenuCategoryStatusDto,
  UpdateMenuItemDto,
  UpdateMenuItemStatusDto,
} from "../restaurant.dto";

export class MenuRepository {
  async createMenuItem(
    restaurantId: number,
    dto: CreateMenuItemDto,
  ): Promise<MenuItemDto> {
    const menuItem = await prisma.menuItem.create({
      data: {
        restaurantId: restaurantId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        isAvailable: true,
        restaurantId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      isAvailable: menuItem.isAvailable,
      restaurantId: menuItem.restaurantId,
      category: {
        id: menuItem.category.id,
        name: menuItem.category.name,
      },
    };
  }

  async findCategoryByRestaurantId(restaurantId: number, categoryId: number) {
    return await prisma.menuCategory.findFirst({
      where: {
        id: categoryId,
        restaurantId,
      },
      select: {
        id: true,
        name: true,
        restaurantId: true,
      },
    });
  }

  async getOwnerMenuItems(
    restaurantId: number,
    query: GetOwnerMenuItemsQueryDto,
  ) {
    const where: Prisma.MenuItemWhereInput = {
      restaurantId,
      deletedAt: null,
      ...(query.categoryId && {
        categoryId: query.categoryId,
      }),
      ...(query.isAvailable !== undefined && {
        isAvailable: query.isAvailable,
      }),
    };

    const skip = (query.page - 1) * query.limit;

    const countQuery = prisma.menuItem.count({
      where,
    });

    const menuItemsQuery = prisma.menuItem.findMany({
      where,
      skip,
      take: query.limit,
      select: {
        id: true,
        restaurantId: true,
        name: true,
        description: true,
        price: true,
        isAvailable: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        {
          category: {
            name: "asc",
          },
        },
        {
          name: "asc",
        },
      ],
    });

    const [total, menuItems] = await prisma.$transaction([
      countQuery,
      menuItemsQuery,
    ]);

    return {
      total,
      menuItems,
    };
  }

  async findRestaurantByOwnerId(ownerId: number, restaurantId: number) {
    return await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        ownerId,
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
      },
    });
  }

  async updateMenuItem(
    menuItemId: number,
    dto: UpdateMenuItemDto,
  ): Promise<MenuItemDto> {
    return await prisma.menuItem.update({
      where: {
        id: menuItemId,
        deletedAt: null,
      },
      data: {
        ...(dto.categoryId !== undefined && {
          categoryId: dto.categoryId,
        }),
        ...(dto.name !== undefined && {
          name: dto.name,
        }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.price !== undefined && {
          price: dto.price,
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        isAvailable: true,
        restaurantId: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findMenuItemByRestaurantId(restaurantId: number, menuItemId: number) {
    return await prisma.menuItem.findFirst({
      where: {
        id: menuItemId,
        restaurantId,
        deletedAt: null,
      },
      select: {
        id: true,
        restaurantId: true,
        categoryId: true,
        name: true,
      },
    });
  }

  async updateMenuItemStatus(menuItemId: number, dto: UpdateMenuItemStatusDto) {
    return await prisma.menuItem.update({
      where: {
        id: menuItemId,
        deletedAt: null,
      },
      data: {
        isAvailable: dto.isAvailable,
      },
      select: {
        id: true,
        restaurantId: true,
        name: true,
        description: true,
        price: true,
        isAvailable: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async softDeleteMenuItem(menuItemId: number) {
    return await prisma.menuItem.updateMany({
      where: {
        id: menuItemId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getOwnerCategories(
    restaurantId: number,
    query: GetOwnerCategoriesQueryDto,
  ) {
    const where: Prisma.MenuCategoryWhereInput = {
      restaurantId,
      ...(query.isActive !== undefined && {
        isActive: query.isActive,
      }),
    };

    const skip = (query.page - 1) * query.limit;

    const countQuery = prisma.menuCategory.count({
      where,
    });

    const categoriesQuery = prisma.menuCategory.findMany({
      where,
      skip,
      take: query.limit,
      select: {
        id: true,
        restaurantId: true,
        name: true,
        isActive: true,
      },
    });

    const [total, categories] = await prisma.$transaction([
      countQuery,
      categoriesQuery,
    ]);

    return {
      total,
      categories,
    };
  }

  async createCategory(restaurantId: number, dto: MenuCategoryInputDto) {
    return await prisma.menuCategory.create({
      data: {
        restaurantId,
        name: dto.name,
        isActive: true,
      },
      select: {
        id: true,
        restaurantId: true,
        name: true,
        isActive: true,
      },
    });
  }

  async findCategoryByIdAndRestaurantId(
    restaurantId: number,
    categoryId: number,
  ) {
    return await prisma.menuCategory.findFirst({
      where: {
        id: categoryId,
        restaurantId,
      },
      select: {
        id: true,
        restaurantId: true,
        name: true,
        isActive: true,
      },
    });
  }

  async updateCategory(categoryId: number, dto: MenuCategoryInputDto) {
    return await prisma.menuCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        name: dto.name,
      },
      select: {
        id: true,
        restaurantId: true,
        name: true,
        isActive: true,
      },
    });
  }

  async updateCategoryStatus(
    categoryId: number,
    dto: UpdateMenuCategoryStatusDto,
  ) {
    return await prisma.menuCategory.update({
      where: {
        id: categoryId,
      },
      data: {
        isActive: dto.isActive,
      },
      select: {
        id: true,
        restaurantId: true,
        name: true,
        isActive: true,
      },
    });
  }
}
