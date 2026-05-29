import { buildPaginationMeta } from "../../../common/pagination";
import { CatalogRepository } from "./catalog.repository";
import {
  GetRestaurantsQueryDto,
  PaginatedRestaurantMenuItemsDto,
  PaginatedRestaurantsDto,
  RestaurantCatalogItemDto,
  SearchMenuItemsQueryDto,
} from "./catalog.dto";
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
    void this.catalogRepository;

    return {
      data: [],
      pagination: buildPaginationMeta(query.page, query.limit, 0),
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
    void this.catalogRepository;
    void restaurantId;

    return {
      data: [],
      pagination: buildPaginationMeta(query.page, query.limit, 0),
    };
  }

  async searchRestaurantMenuItems(
    restaurantId: number,
    query: SearchMenuItemsQueryDto,
  ): Promise<PaginatedRestaurantMenuItemsDto> {
    void this.catalogRepository;
    void restaurantId;

    return {
      data: [],
      pagination: buildPaginationMeta(query.page, query.limit, 0),
    };
  }
}
