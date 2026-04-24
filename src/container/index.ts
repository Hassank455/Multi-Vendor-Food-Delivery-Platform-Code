import { CartRepository } from "../modules/cart/cart.repository";
import { CartService } from "../modules/cart/cart.service";
import { CartController } from "../modules/cart/cart.controller";

const cartRepository = new CartRepository();
const cartService = new CartService(cartRepository);
const cartController = new CartController(cartService);

export const container = {
  cartController,
};
