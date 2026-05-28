import { OwnerRepository } from "./owner.repository";
import {
  CreateRestaurantDto,
  OwnerRestaurantDto,
  UpdateRestaurantDto,
  UpdateRestaurantStatusDto,
} from "./owner.dto";

export class OwnerService {
  constructor(private ownerRepository: OwnerRepository) {}

  async createRestaurant(
    ownerId: number,
    dto: CreateRestaurantDto,
  ): Promise<OwnerRestaurantDto> {
    void this.ownerRepository;

    return {
      id: 0,
      ownerId,
      name: dto.name,
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      status: "DISABLED",
    };
  }

  async getMyRestaurant(ownerId: number): Promise<OwnerRestaurantDto> {
    void this.ownerRepository;

    return {
      id: 0,
      ownerId,
      name: "Draft restaurant",
      phone: null,
      address: null,
      status: "DISABLED",
    };
  }

  async updateRestaurant(
    ownerId: number,
    restaurantId: number,
    dto: UpdateRestaurantDto,
  ): Promise<OwnerRestaurantDto> {
    void this.ownerRepository;

    return {
      id: restaurantId,
      ownerId,
      name: dto.name ?? "Draft restaurant",
      phone: dto.phone ?? null,
      address: dto.address ?? null,
      status: "DISABLED",
    };
  }

  async updateRestaurantStatus(
    ownerId: number,
    restaurantId: number,
    dto: UpdateRestaurantStatusDto,
  ): Promise<OwnerRestaurantDto> {
    void this.ownerRepository;

    return {
      id: restaurantId,
      ownerId,
      name: "Draft restaurant",
      phone: null,
      address: null,
      status: dto.isEnabled ? "ENABLED" : "DISABLED",
    };
  }
}
