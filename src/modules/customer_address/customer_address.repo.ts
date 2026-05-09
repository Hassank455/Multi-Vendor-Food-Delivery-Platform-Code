import prisma from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";

type PrismaTransaction = Prisma.TransactionClient;

export class CustomerAddressRepo {
  protected db(tx?: PrismaTransaction) {
    return tx ?? prisma;
  }
}
