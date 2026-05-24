import { PaginationMetaDto, PaginationQueryDto } from "../../common/pagination";

export interface UpdateCustomerProfileDto {
  name?: string;
  email?: string;
  phone?: string;
}

export interface CreateCustomerReviewDto {
  orderId: number;
  rating: number;
  comment?: string | null;
}

export interface GetCustomerReviewsQueryDto extends PaginationQueryDto {}

export interface CustomerReviewListItemDto {
  id: number;
  rating: number;
  comment: string | null;
  orderId: number;
  restaurant: {
    id: number;
    name: string;
  };
}

export interface PaginatedCustomerReviewsDto {
  data: CustomerReviewListItemDto[];
  pagination: PaginationMetaDto;
}
