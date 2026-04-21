export class CartAlreadyCreatedError extends Error {
  constructor() {
    super("Cart already created");
  }
}

export class CartNotFoundError extends Error {
  constructor() {
    super("Cart does not exist");
  }
}

export class CartCheckedOutError extends Error {
  constructor() {
    super("Cannot modify a checked out cart");
  }
}

export class InvalidQuantityError extends Error {
  constructor(message = "Quantity must be greater than 0") {
    super(message);
  }
}

export class ItemNotFoundError extends Error {
  constructor() {
    super("Item does not exist in cart");
  }
}

export class EmptyCartCheckoutError extends Error {
  constructor() {
    super("Cannot checkout an empty cart");
  }
}

export class CartAlreadyEmptyError extends Error {
  constructor() {
    super("Cart is already empty");
  }
}

export class ConcurrencyError extends Error {
  constructor(expected: number, actual: number) {
    super(`Concurrency error: expected version ${expected}, actual version ${actual}`);
  }
}
