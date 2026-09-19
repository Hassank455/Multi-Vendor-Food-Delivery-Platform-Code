import * as z from "zod";

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

export interface PaginationQueryDto {
  page: number;
  limit: number;
}

export interface PaginationMetaDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(MAX_LIMIT)
    .default(DEFAULT_LIMIT),
});

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMetaDto {
  // calculate the total number of pages
  // we use Math.ceil to round up to the nearest integer, so if there are 11 items and the limit is 10, we will have 2 pages
  // example:
  // total = 0, limit = 10  => totalPages = 0
  // total = 1, limit = 10  => totalPages = 1
  // total = 10, limit = 10 => totalPages = 1
  // total = 11, limit = 10 => totalPages = 2
  // total = 25, limit = 10 => totalPages = 3
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
