import {
  PaginationMetaDto,
  PaginationQueryDto,
} from "../../../common/pagination";

export interface RestaurantCatalogItemDto {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  rating: number;
  isEnabled: boolean;
}

export interface RestaurantMenuCatalogItemDto {
  id: number;
  category: {
    id: number;
    name: string;
  };
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

export interface GetRestaurantsQueryDto extends PaginationQueryDto {
  q?: string;
}

export interface SearchMenuItemsQueryDto extends PaginationQueryDto {
  q?: string;
  categoryId?: number;
}

export interface PaginatedRestaurantsDto {
  data: RestaurantCatalogItemDto[];
  pagination: PaginationMetaDto;
}

export interface PaginatedRestaurantMenuItemsDto {
  data: RestaurantMenuCatalogItemDto[];
  pagination: PaginationMetaDto;
}
