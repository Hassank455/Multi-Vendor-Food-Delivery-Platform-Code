import prisma from "../../../lib/prisma";
import type { Prisma } from "../../../generated/prisma/client";
import { GetRestaurantsQueryDto } from "./catalog.dto";

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
}
