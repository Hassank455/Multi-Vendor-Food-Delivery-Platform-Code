import prisma from "../../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import { GetRestaurantsQueryDto, SearchMenuItemsQueryDto } from "./catalog.dto";

export class CatalogRepository {
  async getRestaurants(query: GetRestaurantsQueryDto) {
    const where: Prisma.RestaurantWhereInput = {
      isEnabled: true,
      ...(query.q && {
        name: {
          contains: query.q,
          mode: "insensitive",
        },
      }),
    };

    const skip = (query.page - 1) * query.limit;

    const countQuery = prisma.restaurant.count({
      where,
    });

    const restaurantsQuery = prisma.restaurant.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: [{ rating: "desc" }, { id: "desc" }],
    });

    const [total, restaurants] = await prisma.$transaction([
      countQuery,
      restaurantsQuery,
    ]);
    return { total, restaurants };
  }

  async getRestaurantById(restaurantId: number) {
    return await prisma.restaurant.findFirst({
      where: {
        id: restaurantId,
        isEnabled: true,
      },
    });
  }

  async getRestaurantMenu(
    restaurantId: number,
    query: SearchMenuItemsQueryDto,
  ) {
    const where: Prisma.MenuItemWhereInput = {
      restaurantId,
      isAvailable: true,
      restaurant: {
        isEnabled: true,
      },
      ...(query.categoryId && {
        categoryId: query.categoryId,
      }),
      ...(query.q && {
        name: {
          contains: query.q,
          mode: "insensitive",
        },
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
}
