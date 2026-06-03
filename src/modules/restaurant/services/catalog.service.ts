import { buildPaginationMeta } from "../../../common/pagination";
import { CatalogRepository } from "../repos/catalog.repo";
import {
  GetRestaurantsQueryDto,
  PaginatedRestaurantMenuItemsDto,
  PaginatedRestaurantsDto,
  RestaurantCatalogItemDto,
  SearchMenuItemsQueryDto,
} from "../restaurant.dto";
import { NotFoundError } from "../../../errors";

export class CatalogService {
  constructor(private catalogRepository: CatalogRepository) {}

  async getRestaurants(
    query: GetRestaurantsQueryDto,
  ): Promise<PaginatedRestaurantsDto> {
    const { total, restaurants } =
      await this.catalogRepository.getRestaurants(query);

    return {
      data: restaurants,
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getTopRatedRestaurants(
    query: GetRestaurantsQueryDto,
  ): Promise<PaginatedRestaurantsDto> {
    const { restaurants, total } =
      await this.catalogRepository.getTopRatedRestaurants(query);

    return {
      data: restaurants,
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getRecommendedRestaurants(
    query: GetRestaurantsQueryDto,
  ): Promise<PaginatedRestaurantsDto> {
    const { restaurants, total } =
      await this.catalogRepository.getRecommendedRestaurants(query);

    return {
      data: restaurants,
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }

  async getRestaurantById(
    restaurantId: number,
  ): Promise<RestaurantCatalogItemDto> {
    const restaurant =
      await this.catalogRepository.getRestaurantById(restaurantId);

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    return restaurant;
  }

  async getRestaurantMenu(
    restaurantId: number,
    query: SearchMenuItemsQueryDto,
  ): Promise<PaginatedRestaurantMenuItemsDto> {
    const restaurant =
      await this.catalogRepository.getRestaurantById(restaurantId);

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    const { total, menuItems } = await this.catalogRepository.getRestaurantMenu(
      restaurantId,
      query,
    );

    return {
      data: menuItems,
      pagination: buildPaginationMeta(query.page, query.limit, total),
    };
  }
}
