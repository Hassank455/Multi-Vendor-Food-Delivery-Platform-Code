import prisma from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

type PrismaTransaction = Prisma.TransactionClient;

export class CustomerAddressRepo {
  protected db(tx?: PrismaTransaction) {
    return tx ?? prisma;
  }

  async getCustomerAddresses(customerId: number, tx?: PrismaTransaction) {
    return await this.db(tx).customerAddress.findMany({
      where: {
        customerId,
      },
    });
  }

  async getCustomerAddress(
    customerId: number,
    id: number,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).customerAddress.findFirst({
      where: {
        id,
        customerId,
      },
    });
  }
}
