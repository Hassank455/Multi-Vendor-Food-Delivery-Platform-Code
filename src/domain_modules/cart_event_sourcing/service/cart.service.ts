import type { CreateCartDto } from "../cart.dto";
import type { CartEventStoreRepository } from "../repository/cart.event-store.repository";
import type { CartReadRepository } from "../repository/cart.read.repository";
import { CartProjection } from "./cart.projection";
import { CartAggregate } from "../domain/cart.aggregate";

export class CartService {
  constructor(
    private readonly eventStoreRepository: CartEventStoreRepository,
    private readonly cartReadRepository: CartReadRepository,
    private readonly cartProjection: CartProjection,
  ) {}

  async createCart(command: CreateCartDto): Promise<void> {
    const cart = await this.loadCart(command.cartId);
    cart.create(command.userId, command.currency);
    await this.persist(cart);
  }

  // read cart history from event store and rehydrate aggregate
  private async loadCart(cartId: string): Promise<CartAggregate> {
    const history = await this.eventStoreRepository.getEventsByCartId(cartId);
    return CartAggregate.rehydrate(cartId, history);
  }

  // The event is saved in event_store.
  private async persist(cart: CartAggregate): Promise<void> {
    const events = cart.getUncommittedEvents();
    if (events.length === 0) return;

    const currentState = cart.getState();
    const expectedVersion = currentState.version - events.length;

    await this.eventStoreRepository.append(events, expectedVersion);

    for (const event of events) {
      await this.cartProjection.apply(event);
    }

    cart.clearUncommittedEvents();
  }
}
