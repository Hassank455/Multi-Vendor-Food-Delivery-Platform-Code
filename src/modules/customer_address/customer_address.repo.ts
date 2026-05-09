import prisma from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";
import { CustomerAddressDto } from "./customer_address.dto";

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

  async createCustomerAddress(dto: CustomerAddressDto, tx?: PrismaTransaction) {
    return await this.db(tx).customerAddress.create({
      data: {
        customerId: dto.customerId,
        street: dto.street,
        city: dto.city,
        buildingNo: dto.buildingNo,
        postalCode: dto.postalCode,
        governorate: dto.governorate,
      },
    });
  }
}
