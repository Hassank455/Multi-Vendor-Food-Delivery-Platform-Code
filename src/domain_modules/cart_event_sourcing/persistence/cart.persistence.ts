import type {
  CartItemReadModel as PrismaCartItemReadModel,
  CartReadModel as PrismaCartReadModel,
  EventStore as PrismaEventStore,
} from "../../../generated/prisma/client";
import type { CartEvent } from "../domain/cart.events";
import type { CartReadModelRecord } from "../repository/cart.read.repository";

// Prisma converts the event_store record to CartEvent
export function mapEventRecordToDomain(record: PrismaEventStore): CartEvent {
  return {
    eventId: record.id,
    aggregateId: record.aggregateId,
    aggregateType: "Cart",
    eventType: record.eventType,
    version: record.version,
    occurredAt: record.occurredAt.toISOString(),
    data: record.eventData as CartEvent["data"],
  } as CartEvent;
}

// The read model converts Prisma into an internal format that the system understands.
export function mapCartReadModelToRecord(
  cart: PrismaCartReadModel & { items: PrismaCartItemReadModel[] },
): CartReadModelRecord {
  return {
    cartId: cart.cartId,
    userId: cart.userId,
    currency: cart.currency,
    status: cart.status as CartReadModelRecord["status"],
    items: cart.items
      .map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
      }))
      .sort((left, right) => left.productId.localeCompare(right.productId)),
    totalQuantity: cart.totalQuantity,
    totalPrice: Number(cart.totalPrice),
    version: cart.version,
  };
}
