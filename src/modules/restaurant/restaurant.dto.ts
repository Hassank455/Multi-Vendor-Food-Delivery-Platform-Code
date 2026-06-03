import { PaginationMetaDto, PaginationQueryDto } from "../../common/pagination";

// catalog DTOs
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

// owner DTOs
export type RestaurantStatus = "ENABLED" | "DISABLED";

export interface CreateRestaurantDto {
  name: string;
  phone?: string | null;
  address?: string | null;
}

export interface UpdateRestaurantDto {
  name?: string;
  phone?: string | null;
  address?: string | null;
}

export interface UpdateRestaurantStatusDto {
  isEnabled: boolean;
}

export interface OwnerRestaurantDto {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  rating: number;
  isEnabled: boolean;
  createdAt: Date;
}

// menu item DTOs
export interface CreateMenuItemDto {
  name: string;
  description: string;
  categoryId: number;
  price: number;
}

export interface UpdateMenuItemDto {
  name?: string;
  description?: string;
  categoryId?: number;
  price?: number;
}

export interface UpdateMenuItemStatusDto {
  isAvailable: boolean;
}

export interface MenuItemDto {
  id: number;
  restaurantId: number;
  category: {
    id: number;
    name: string;
  };
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
}

export interface GetOwnerMenuItemsQueryDto extends PaginationQueryDto {
  categoryId?: number;
  isAvailable?: boolean;
}

export interface PaginatedOwnerMenuItemsDto {
  data: MenuItemDto[];
  pagination: PaginationMetaDto;
}

// menu category DTOs
export interface OwnerMenuCategoryDto {
  id: number;
  restaurantId: number;
  name: string;
  isActive: boolean;
}

export interface GetOwnerCategoriesQueryDto extends PaginationQueryDto {
  isActive?: boolean;
}

export interface PaginatedOwnerCategoriesDto {
  data: OwnerMenuCategoryDto[];
  pagination: PaginationMetaDto;
}

export interface MenuCategoryInputDto {
  name: string;
}

export interface UpdateMenuCategoryStatusDto {
  isActive: boolean;
}
