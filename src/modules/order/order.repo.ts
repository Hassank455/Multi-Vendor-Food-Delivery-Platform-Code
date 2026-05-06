import prisma from "../../lib/prisma";
import type {
  Prisma,
  PaymentMethod,
  CartEventType,
} from "../../generated/prisma/client";

type PrismaTransaction = Prisma.TransactionClient;

export class OrderRepo {
  private db(tx?: PrismaTransaction) {
    return tx ?? prisma;
  }
  async findAddressById(addressId: number, tx?: PrismaTransaction) {
    return await this.db(tx).address.findUnique({
      where: { id: addressId },
    });
  }
}
