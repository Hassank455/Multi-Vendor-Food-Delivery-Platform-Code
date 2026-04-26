import prisma from "../../lib/prisma";

export class CartRepository {
  async createCart(customerId: number) {
    return await prisma.cart.create({
      data: {
        customerId,
      },
    });
  }

  async findCartByCustomerId(customerId: number) {
    return await prisma.cart.findUnique({
      where: {
        customerId,
      },
    });
  }
}
