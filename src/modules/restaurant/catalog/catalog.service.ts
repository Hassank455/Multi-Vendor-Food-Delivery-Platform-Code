import { buildPaginationMeta } from "../../../common/pagination";
import { CatalogRepository } from "./catalog.repository";
import {
  GetRestaurantsQueryDto,
  PaginatedRestaurantMenuItemsDto,
  PaginatedRestaurantsDto,
  RestaurantCatalogItemDto,
  SearchMenuItemsQueryDto,
} from "./catalog.dto";

export class CatalogService {
  constructor(private catalogRepository: CatalogRepository) {}

  async getRestaurants(
    query: GetRestaurantsQueryDto,
  ): Promise<PaginatedRestaurantsDto> {
    void this.catalogRepository;

    return {
      data: [],
      pagination: buildPaginationMeta(query.page, query.limit, 0),
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
    void this.catalogRepository;

    return {
      id: restaurantId,
      name: "Draft restaurant",
      phone: null,
      address: null,
      rating: 0,
    };
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
