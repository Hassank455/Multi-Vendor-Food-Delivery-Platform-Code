export type BaseCartEvent = {
  eventId: string;
  aggregateId: string;
  aggregateType: "Cart";
  eventType: string;
  version: number;
  occurredAt: string;
};

export type CartCreatedEvent = BaseCartEvent & {
  eventType: "CartCreated";
  data: {
    userId: string;
    currency: string;
  };
};

export type ItemAddedEvent = BaseCartEvent & {
  eventType: "ItemAdded";
  data: {
    productId: string;
    productName: string;
    unitPrice: number;
    quantity: number;
  };
};

export type QuantityIncreasedEvent = BaseCartEvent & {
  eventType: "QuantityIncreased";
  data: {
    productId: string;
    amount: number;
  };
};

export type QuantityDecreasedEvent = BaseCartEvent & {
  eventType: "QuantityDecreased";
  data: {
    productId: string;
    amount: number;
  };
};

export type ItemRemovedEvent = BaseCartEvent & {
  eventType: "ItemRemoved";
  data: {
    productId: string;
  };
};

export type CartResetEvent = BaseCartEvent & {
  eventType: "CartReset";
  data: {};
};

export type CartCheckedOutEvent = BaseCartEvent & {
  eventType: "CartCheckedOut";
  data: {
    checkedOutAt: string;
  };
};

export type CartEvent =
  | CartCreatedEvent
  | ItemAddedEvent
  | QuantityIncreasedEvent
  | QuantityDecreasedEvent
  | ItemRemovedEvent
  | CartResetEvent
  | CartCheckedOutEvent;
