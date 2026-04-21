import { randomUUID } from "node:crypto";
import type { CartState } from "./cart.types";
import type {
  CartCheckedOutEvent,
  CartCreatedEvent,
  CartEvent,
  CartResetEvent,
  ItemAddedEvent,
  ItemRemovedEvent,
  QuantityDecreasedEvent,
  QuantityIncreasedEvent,
} from "./cart.events";
import {
  CartAlreadyCreatedError,
  CartAlreadyEmptyError,
  CartCheckedOutError,
  CartNotFoundError,
  EmptyCartCheckoutError,
  InvalidQuantityError,
  ItemNotFoundError,
} from "./cart.errors";

function generateId(): string {
  return randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

export class CartAggregate {
  private state: CartState;
  private uncommittedEvents: CartEvent[] = [];

  constructor(private readonly id: string) {
    this.state = {
      id,
      userId: null,
      currency: null,
      status: "EMPTY",
      items: {},
      version: 0,
      created: false,
    };
  }

  static rehydrate(id: string, history: CartEvent[]): CartAggregate {
    const cart = new CartAggregate(id);
    for (const event of history) {
      cart.apply(event);
    }
    return cart;
  }

  getState(): CartState {
    return {
      ...this.state,
      items: { ...this.state.items },
    };
  }

  getUncommittedEvents(): CartEvent[] {
    return [...this.uncommittedEvents];
  }

  clearUncommittedEvents(): void {
    this.uncommittedEvents = [];
  }

  // generate event => CartCreated.
  create(userId: string, currency: string): void {
    if (this.state.created) {
      throw new CartAlreadyCreatedError();
    }

    const event: CartCreatedEvent = {
      eventId: generateId(),
      aggregateId: this.id,
      aggregateType: "Cart",
      eventType: "CartCreated",
      version: this.state.version + 1,
      occurredAt: nowIso(),
      data: { userId, currency },
    };

    this.record(event);
  }

  addItem(
    productId: string,
    productName: string,
    unitPrice: number,
    quantity: number,
  ): void {
    this.ensureCartExists();
    this.ensureNotCheckedOut();

    if (quantity <= 0) {
      throw new InvalidQuantityError();
    }

    if (unitPrice < 0) {
      throw new Error("Unit price cannot be negative");
    }

    const existingItem = this.state.items[productId];

    if (!existingItem) {
      const event: ItemAddedEvent = {
        eventId: generateId(),
        aggregateId: this.id,
        aggregateType: "Cart",
        eventType: "ItemAdded",
        version: this.state.version + 1,
        occurredAt: nowIso(),
        data: {
          productId,
          productName,
          unitPrice,
          quantity,
        },
      };

      this.record(event);
      return;
    }

    const event: QuantityIncreasedEvent = {
      eventId: generateId(),
      aggregateId: this.id,
      aggregateType: "Cart",
      eventType: "QuantityIncreased",
      version: this.state.version + 1,
      occurredAt: nowIso(),
      data: {
        productId,
        amount: quantity,
      },
    };

    this.record(event);
  }

  increaseQuantity(productId: string, amount: number): void {
    this.ensureCartExists();
    this.ensureNotCheckedOut();

    if (amount <= 0) {
      throw new InvalidQuantityError("Increase amount must be greater than 0");
    }

    const item = this.state.items[productId];
    if (!item) {
      throw new ItemNotFoundError();
    }

    const event: QuantityIncreasedEvent = {
      eventId: generateId(),
      aggregateId: this.id,
      aggregateType: "Cart",
      eventType: "QuantityIncreased",
      version: this.state.version + 1,
      occurredAt: nowIso(),
      data: {
        productId,
        amount,
      },
    };

    this.record(event);
  }

  decreaseQuantity(productId: string, amount: number): void {
    this.ensureCartExists();
    this.ensureNotCheckedOut();

    if (amount <= 0) {
      throw new InvalidQuantityError("Decrease amount must be greater than 0");
    }

    const item = this.state.items[productId];
    if (!item) {
      throw new ItemNotFoundError();
    }

    if (amount > item.quantity) {
      throw new InvalidQuantityError(
        "Cannot decrease more than current quantity",
      );
    }

    const decreaseEvent: QuantityDecreasedEvent = {
      eventId: generateId(),
      aggregateId: this.id,
      aggregateType: "Cart",
      eventType: "QuantityDecreased",
      version: this.state.version + 1,
      occurredAt: nowIso(),
      data: {
        productId,
        amount,
      },
    };

    this.record(decreaseEvent);

    if (item.quantity - amount === 0) {
      const removeEvent: ItemRemovedEvent = {
        eventId: generateId(),
        aggregateId: this.id,
        aggregateType: "Cart",
        eventType: "ItemRemoved",
        version: this.state.version + 1,
        occurredAt: nowIso(),
        data: {
          productId,
        },
      };

      this.record(removeEvent);
    }
  }

  removeItem(productId: string): void {
    this.ensureCartExists();
    this.ensureNotCheckedOut();

    const item = this.state.items[productId];
    if (!item) {
      throw new ItemNotFoundError();
    }

    const event: ItemRemovedEvent = {
      eventId: generateId(),
      aggregateId: this.id,
      aggregateType: "Cart",
      eventType: "ItemRemoved",
      version: this.state.version + 1,
      occurredAt: nowIso(),
      data: {
        productId,
      },
    };

    this.record(event);
  }

  resetCart(): void {
    this.ensureCartExists();
    this.ensureNotCheckedOut();

    if (Object.keys(this.state.items).length === 0) {
      throw new CartAlreadyEmptyError();
    }

    const event: CartResetEvent = {
      eventId: generateId(),
      aggregateId: this.id,
      aggregateType: "Cart",
      eventType: "CartReset",
      version: this.state.version + 1,
      occurredAt: nowIso(),
      data: {},
    };

    this.record(event);
  }

  checkout(): void {
    this.ensureCartExists();
    this.ensureNotCheckedOut();

    if (Object.keys(this.state.items).length === 0) {
      throw new EmptyCartCheckoutError();
    }

    const event: CartCheckedOutEvent = {
      eventId: generateId(),
      aggregateId: this.id,
      aggregateType: "Cart",
      eventType: "CartCheckedOut",
      version: this.state.version + 1,
      occurredAt: nowIso(),
      data: {
        checkedOutAt: nowIso(),
      },
    };

    this.record(event);
  }

  // The event is applied to the state and then added to uncommittedEvents
  private record(event: CartEvent): void {
    this.apply(event);
    this.uncommittedEvents.push(event);
  }

  // The state changes based on the type of event.
  private apply(event: CartEvent): void {
    switch (event.eventType) {
      case "CartCreated": {
        this.state.created = true;
        this.state.userId = event.data.userId;
        this.state.currency = event.data.currency;
        this.state.status = "EMPTY";
        this.state.version = event.version;
        break;
      }

      case "ItemAdded": {
        this.state.items[event.data.productId] = {
          productId: event.data.productId,
          productName: event.data.productName,
          unitPrice: event.data.unitPrice,
          quantity: event.data.quantity,
        };
        this.state.status = "ACTIVE";
        this.state.version = event.version;
        break;
      }

      case "QuantityIncreased": {
        const item = this.state.items[event.data.productId];
        if (!item) {
          throw new Error(
            "Projection error: item not found while increasing quantity",
          );
        }
        item.quantity += event.data.amount;
        this.state.status = "ACTIVE";
        this.state.version = event.version;
        break;
      }

      case "QuantityDecreased": {
        const item = this.state.items[event.data.productId];
        if (!item) {
          throw new Error(
            "Projection error: item not found while decreasing quantity",
          );
        }
        item.quantity -= event.data.amount;
        this.state.version = event.version;
        break;
      }

      case "ItemRemoved": {
        delete this.state.items[event.data.productId];
        this.state.status =
          Object.keys(this.state.items).length === 0 ? "EMPTY" : "ACTIVE";
        this.state.version = event.version;
        break;
      }

      case "CartReset": {
        this.state.items = {};
        this.state.status = "EMPTY";
        this.state.version = event.version;
        break;
      }

      case "CartCheckedOut": {
        this.state.status = "CHECKED_OUT";
        this.state.version = event.version;
        break;
      }
    }
  }

  private ensureCartExists(): void {
    if (!this.state.created) {
      throw new CartNotFoundError();
    }
  }

  private ensureNotCheckedOut(): void {
    if (this.state.status === "CHECKED_OUT") {
      throw new CartCheckedOutError();
    }
  }
}
