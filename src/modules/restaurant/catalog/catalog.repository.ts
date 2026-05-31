import prisma from "../../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import { GetRestaurantsQueryDto, SearchMenuItemsQueryDto } from "./catalog.dto";

type RestaurantListMode = "default" | "top-rated" | "recommended";

export class CatalogRepository {
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

  async getRestaurants(query: GetRestaurantsQueryDto) {
    return this.getRestaurantList(query, "default");
  }

  async getTopRatedRestaurants(query: GetRestaurantsQueryDto) {
    return this.getRestaurantList(query, "top-rated");
  }

  async getRecommendedRestaurants(query: GetRestaurantsQueryDto) {
    return this.getRestaurantList(query, "recommended");
  }

  private buildRestaurantWhere(
    query: GetRestaurantsQueryDto,
  ): Prisma.RestaurantWhereInput {
    return {
      isEnabled: true,
      ...(query.q && {
        name: {
          contains: query.q,
          mode: "insensitive",
        },
      }),
    };
  }

  private buildRestaurantOrderBy(
    mode: RestaurantListMode,
  ): Prisma.RestaurantOrderByWithRelationInput[] {
    if (mode === "top-rated") {
      return [{ rating: "desc" }, { id: "desc" }];
    } else if (mode === "recommended") {
      return [
        { rating: "desc" },
        {
          reviews: {
            _count: "desc",
          },
        },
        { id: "desc" },
      ];
    }

    return [{ name: "asc" }, { id: "desc" }];
  }

  private async getRestaurantList(
    query: GetRestaurantsQueryDto,
    mode: RestaurantListMode,
  ) {
    const where = this.buildRestaurantWhere(query);
    const skip = (query.page - 1) * query.limit;

    const countQuery = prisma.restaurant.count({
      where,
    });

    const restaurantsQuery = prisma.restaurant.findMany({
      where,
      skip,
      take: query.limit,
      orderBy: this.buildRestaurantOrderBy(mode),
    });

    const [total, restaurants] = await prisma.$transaction([
      countQuery,
      restaurantsQuery,
    ]);

    return {
      total,
      restaurants,
    };
  }
}
