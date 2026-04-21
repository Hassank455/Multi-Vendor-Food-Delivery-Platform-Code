import type { CartEvent } from "../domain/cart.events";
import type {
  CartReadModelRecord,
  CartReadRepository,
} from "../repository/cart.read.repository";

// It receives events one by one, updating the tables to readable format.
/*
Example:

If the CartCreated event creates an empty read model.
If ItemAdded, it adds the item.
If QuantityIncreased, it increases the quantity.
If CartReset, it empties the cart.
If CartCheckedOut, it changes the state to CHECKED_OUT.
*/
export class CartProjection {
  constructor(private readonly cartReadRepository: CartReadRepository) {}

  async apply(event: CartEvent): Promise<void> {
    switch (event.eventType) {
      case "CartCreated": {
        const cart: CartReadModelRecord = {
          cartId: event.aggregateId,
          userId: event.data.userId,
          currency: event.data.currency,
          status: "EMPTY",
          items: [],
          totalQuantity: 0,
          totalPrice: 0,
          version: event.version,
        };

        await this.cartReadRepository.save(cart);
        break;
      }

      case "ItemAdded": {
        const cart = await this.requireCart(event.aggregateId);
        cart.items.push({
          productId: event.data.productId,
          productName: event.data.productName,
          unitPrice: event.data.unitPrice,
          quantity: event.data.quantity,
          lineTotal: event.data.quantity * event.data.unitPrice,
        });
        cart.status = "ACTIVE";
        cart.version = event.version;
        this.recalculate(cart);
        await this.cartReadRepository.save(cart);
        break;
      }

      case "QuantityIncreased": {
        const cart = await this.requireCart(event.aggregateId);
        const item = cart.items.find(
          (entry) => entry.productId === event.data.productId,
        );
        if (!item) throw new Error("Projection item not found");
        item.quantity += event.data.amount;
        item.lineTotal = item.quantity * item.unitPrice;
        cart.status = "ACTIVE";
        cart.version = event.version;
        this.recalculate(cart);
        await this.cartReadRepository.save(cart);
        break;
      }

      case "QuantityDecreased": {
        const cart = await this.requireCart(event.aggregateId);
        const item = cart.items.find(
          (entry) => entry.productId === event.data.productId,
        );
        if (!item) throw new Error("Projection item not found");
        item.quantity -= event.data.amount;
        item.lineTotal = item.quantity * item.unitPrice;
        cart.version = event.version;
        this.recalculate(cart);
        await this.cartReadRepository.save(cart);
        break;
      }

      case "ItemRemoved": {
        const cart = await this.requireCart(event.aggregateId);
        cart.items = cart.items.filter(
          (entry) => entry.productId !== event.data.productId,
        );
        cart.status = cart.items.length === 0 ? "EMPTY" : "ACTIVE";
        cart.version = event.version;
        this.recalculate(cart);
        await this.cartReadRepository.save(cart);
        break;
      }

      case "CartReset": {
        const cart = await this.requireCart(event.aggregateId);
        cart.items = [];
        cart.status = "EMPTY";
        cart.version = event.version;
        this.recalculate(cart);
        await this.cartReadRepository.save(cart);
        break;
      }

      case "CartCheckedOut": {
        const cart = await this.requireCart(event.aggregateId);
        cart.status = "CHECKED_OUT";
        cart.version = event.version;
        this.recalculate(cart);
        await this.cartReadRepository.save(cart);
        break;
      }
    }
  }

  private async requireCart(cartId: string): Promise<CartReadModelRecord> {
    const cart = await this.cartReadRepository.findById(cartId);
    if (!cart) {
      throw new Error(`Projection cart not found: ${cartId}`);
    }
    return cart;
  }

  private recalculate(cart: CartReadModelRecord): void {
    cart.items = cart.items.filter((item) => item.quantity > 0);
    cart.totalQuantity = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    cart.totalPrice = cart.items.reduce((sum, item) => sum + item.lineTotal, 0);

    if (cart.status !== "CHECKED_OUT") {
      cart.status = cart.items.length === 0 ? "EMPTY" : "ACTIVE";
    }
  }
}
