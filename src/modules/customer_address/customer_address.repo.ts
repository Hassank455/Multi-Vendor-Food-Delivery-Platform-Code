import prisma from "../../lib/prisma";
import type { Prisma } from "../../generated/prisma/client";
import {
  CreateCustomerAddressDto,
  UpdateCustomerAddressDto,
} from "./customer_address.dto";

type PrismaTransaction = Prisma.TransactionClient;

export class CustomerAddressRepo {
  protected db(tx?: PrismaTransaction) {
    return tx ?? prisma;
  }

  async getCustomerAddresses(customerId: number, tx?: PrismaTransaction) {
    return await this.db(tx).customerAddress.findMany({
      where: {
        customerId,
        deletedAt: null,
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
        deletedAt: null,
      },
    });
  }

  async createCustomerAddress(
    customerId: number,
    dto: CreateCustomerAddressDto,
    tx?: PrismaTransaction,
  ) {
    return await this.db(tx).customerAddress.create({
      data: {
        customerId,
        street: dto.street,
        city: dto.city,
        buildingNo: dto.buildingNo,
        postalCode: dto.postalCode,
        governorate: dto.governorate,
      },
    });
  }

  async updateCustomerAddress(
    customerId: number,
    id: number,
    dto: UpdateCustomerAddressDto,
    tx?: PrismaTransaction,
  ) {
    const result = await this.db(tx).customerAddress.updateMany({
      where: {
        id,
        customerId,
        deletedAt: null,
      },
      data: {
        street: dto.street,
        city: dto.city,
        buildingNo: dto.buildingNo,
        postalCode: dto.postalCode,
        governorate: dto.governorate,
      },
    });

    if (!result.count) {
      return null;
    }

    return await this.db(tx).customerAddress.findFirst({
      where: {
        id,
        customerId,
        deletedAt: null,
      },
    });
  }

  async softDeleteCustomerAddress(
    customerId: number,
    id: number,
    tx?: PrismaTransaction,
  ) {
    const deletedAt = new Date();
    const result = await this.db(tx).customerAddress.updateMany({
      where: {
        id,
        customerId,
        deletedAt: null,
      },
      data: {
        deletedAt: deletedAt,
      },
    });
    // Return true if a record was updated (i.e., soft-deleted), false otherwise
    return result.count > 0;
  }
}
