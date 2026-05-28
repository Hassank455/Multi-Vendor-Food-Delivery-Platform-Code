import { PaginationMetaDto, PaginationQueryDto } from "../../../common/pagination";

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
  categoryId: number;
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
