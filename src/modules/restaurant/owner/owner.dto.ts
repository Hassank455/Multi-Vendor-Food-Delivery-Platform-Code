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


