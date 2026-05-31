import prisma from "../../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import {
  CreateMenuItemDto,
  GetOwnerMenuItemsQueryDto,
  MenuItemDto,
} from "./menu.dto";

export class MenuRepository {
  async createMenuItem(
    restaurantId: number,
    dto: CreateMenuItemDto,
  ): Promise<MenuItemDto> {
    const menuItem = await prisma.menuItem.create({
      data: {
        // restaurant: {
        //   connect: {
        //     id: restaurantId,
        //     ownerId,
        //   },
        // },
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
}
