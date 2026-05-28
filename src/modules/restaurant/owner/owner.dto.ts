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
  ownerId: number;
  name: string;
  phone: string | null;
  address: string | null;
  status: RestaurantStatus;
}
