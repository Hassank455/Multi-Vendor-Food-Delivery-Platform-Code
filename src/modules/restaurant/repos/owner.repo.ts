import prisma from "../../../lib/prisma";

export class OwnerRepository {
  async findOwnerRestaurant(ownerId: number) {
    return await prisma.restaurant.findUnique({
      where: {
        ownerId,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        rating: true,
        isEnabled: true,
        createdAt: true,
      },
    });
  }
}
