import { OwnerRepository } from "./owner.repository";
import {
  CreateRestaurantDto,
  OwnerRestaurantDto,
  UpdateRestaurantDto,
  UpdateRestaurantStatusDto,
} from "./owner.dto";
import { NotFoundError } from "../../../errors";

export class OwnerService {
  constructor(private ownerRepository: OwnerRepository) {}

  async createRestaurant(
    ownerId: number,
    dto: CreateRestaurantDto,
  ): Promise<OwnerRestaurantDto> {
    void this.ownerRepository;

    return {
      id: 0,
      name: "Draft restaurant",
      phone: null,
      address: null,
      rating: 0,
      isEnabled: false,
      createdAt: new Date(),
    };
  }

  async findOwnerRestaurant(ownerId: number): Promise<OwnerRestaurantDto> {
    const restaurant =
      await this.ownerRepository.findOwnerRestaurant(ownerId);

    if (!restaurant) {
      throw new NotFoundError("Restaurant not found");
    }

    return restaurant;
  }

  async updateRestaurant(
    ownerId: number,
    restaurantId: number,
    dto: UpdateRestaurantDto,
  ): Promise<OwnerRestaurantDto> {
    void this.ownerRepository;

    return {
      id: 0,
      name: "Draft restaurant",
      phone: null,
      address: null,
      rating: 0,
      isEnabled: false,
      createdAt: new Date(),
    };
  }

  async updateRestaurantStatus(
    ownerId: number,
    restaurantId: number,
    dto: UpdateRestaurantStatusDto,
  ): Promise<OwnerRestaurantDto> {
    void this.ownerRepository;

    return {
      id: 0,
      name: "Draft restaurant",
      phone: null,
      address: null,
      rating: 0,
      isEnabled: false,
      createdAt: new Date(),
    };
  }
}
