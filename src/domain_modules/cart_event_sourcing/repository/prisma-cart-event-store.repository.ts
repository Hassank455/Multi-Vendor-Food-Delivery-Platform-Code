import { Prisma } from "../../../generated/prisma/client";
import type { PrismaClient } from "../../../generated/prisma/client";
import type { CartEvent } from "../domain/cart.events";
import { ConcurrencyError } from "../domain/cart.errors";
import { mapEventRecordToDomain } from "../persistence/cart.persistence";
import type { CartEventStoreRepository } from "./cart.event-store.repository";

// It is responsible for storing events within the event_store table.
export class PrismaCartEventStoreRepository implements CartEventStoreRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Reads the latest event for the same cartId.
  // Calculates the currentVersion --> If currentVersion !== expectedVersion, throws a ConcurrencyError.
  // If everything is correct, saves all events at once in eventStore.createMany(...).
  // This prevents concurrent writes. If two requests attempt to modify the same cart simultaneously, only one will succeed if the versions are no longer identical.
  async append(events: CartEvent[], expectedVersion: number): Promise<void> {
    if (events.length === 0) return;

    const cartId = events[0].aggregateId;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const latestEvent = await tx.eventStore.findFirst({
        where: { aggregateId: cartId },
        orderBy: { version: "desc" },
      });

      const currentVersion = latestEvent?.version ?? 0;

      if (currentVersion !== expectedVersion) {
        throw new ConcurrencyError(expectedVersion, currentVersion);
      }

      await tx.eventStore.createMany({
        data: events.map((event) => ({
          id: event.eventId,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          eventType: event.eventType,
          eventData: event.data as Prisma.InputJsonValue,
          occurredAt: new Date(event.occurredAt),
          version: event.version,
        })),
      });
    });
  }

  async getEventsByCartId(cartId: string): Promise<CartEvent[]> {
    const records = await this.prisma.eventStore.findMany({
      where: { aggregateId: cartId },
      orderBy: { version: "asc" },
    });

    return records.map(mapEventRecordToDomain);
  }

  async getAllEvents(): Promise<CartEvent[]> {
    const records = await this.prisma.eventStore.findMany({
      orderBy: [{ aggregateId: "asc" }, { version: "asc" }],
    });

    return records.map(mapEventRecordToDomain);
  }
}
