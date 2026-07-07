// /// <reference types="jest" />
// import express from "express";
// import request from "supertest";
// import { UnAuthenticatedError } from "../../../../errors";
// import { RoleEnum } from "../../../../generated/prisma/enums";
// import { errorHandler } from "../../../../middlewares/errorHandler";

// type AuthMode = "unauthorized" | "user" | "customer";

// type MockCartService = {
//   getMyCart: jest.Mock;
//   addItemToCart: jest.Mock;
//   updateQuantity: jest.Mock;
//   increaseCartItemQuantity: jest.Mock;
//   decreaseCartItemQuantity: jest.Mock;
//   removeItemFromCart: jest.Mock;
//   clearCart: jest.Mock;
// };

// let authMode: AuthMode = "customer";
// let authenticatedCustomerId = 7;
// let mockCartService: MockCartService;

// function buildCart(customerId = authenticatedCustomerId) {
//   return {
//     id: 1,
//     customerId,
//     restaurantId: null,
//     subTotal: 0,
//     items: [],
//   };
// }

// function createMockCartService(): MockCartService {
//   return {
//     getMyCart: jest.fn().mockResolvedValue(buildCart()),
//     addItemToCart: jest.fn().mockResolvedValue(buildCart()),
//     updateQuantity: jest.fn().mockResolvedValue(buildCart()),
//     increaseCartItemQuantity: jest.fn().mockResolvedValue(buildCart()),
//     decreaseCartItemQuantity: jest.fn().mockResolvedValue(buildCart()),
//     removeItemFromCart: jest.fn().mockResolvedValue(buildCart()),
//     clearCart: jest.fn().mockResolvedValue(buildCart()),
//   };
// }

// async function createTestApp(mode: AuthMode) {
//   jest.resetModules();

//   authMode = mode;
//   authenticatedCustomerId = 7;
//   mockCartService = createMockCartService();

//   jest.doMock("../../../../middlewares", () => {
//     const actual = jest.requireActual("../../../../middlewares");

//     return {
//       ...actual,
//       isAuth: (req: any, res: any, next: any) => {
//         if (authMode === "unauthorized") {
//           next(
//             new UnAuthenticatedError("Please provide the authorization header"),
//           );
//           return;
//         }

//         if (authMode === "user") {
//           req.user = {
//             id: 15,
//             role: RoleEnum.ADMIN,
//           };
//           next();
//           return;
//         }

//         req.user = {
//           id: 12,
//           role: RoleEnum.CUSTOMER,
//         };
//         req.customer = {
//           id: authenticatedCustomerId,
//         };
//         next();
//       },
//     };
//   });

//   jest.doMock("../../../../container", () => {
//     const { CartController } = jest.requireActual("../../cart.controller");

//     return {
//       container: {
//         cartController: new CartController(mockCartService as any),
//       },
//     };
//   });

//   const cartRoute = (await import("../../cart.route")).default;
//   const app = express();

//   app.use(express.json());
//   app.use("/cart", cartRoute);
//   app.use(errorHandler);

//   return {
//     app,
//     service: mockCartService,
//   };
// }

// describe("cart routes", () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//     jest.resetModules();
//   });

//   it("returns 401 for GET /cart without authentication", async () => {
//     const { app, service } = await createTestApp("unauthorized");

//     const response = await request(app).get("/cart");

//     expect(response.status).toBe(401);
//     expect(response.body.message).toBe("Please provide the authorization header");
//     expect(service.getMyCart).not.toHaveBeenCalled();
//   });

//   it("returns 403 for GET /cart when the authenticated user is not a customer", async () => {
//     const { app, service } = await createTestApp("user");

//     const response = await request(app).get("/cart");

//     expect(response.status).toBe(403);
//     expect(response.body.message).toBe("Customer authentication is required");
//     expect(service.getMyCart).not.toHaveBeenCalled();
//   });

//   it("returns the authenticated customer's cart for GET /cart", async () => {
//     const { app, service } = await createTestApp("customer");
//     const emptyCart = buildCart();

//     service.getMyCart.mockResolvedValueOnce(emptyCart);

//     const response = await request(app).get("/cart");

//     expect(response.status).toBe(200);
//     expect(response.body.data).toEqual(emptyCart);
//     expect(service.getMyCart).toHaveBeenCalledWith(authenticatedCustomerId);
//   });

//   it("adds an item without requiring customerId in the body", async () => {
//     const { app, service } = await createTestApp("customer");
//     const updatedCart = {
//       ...buildCart(),
//       restaurantId: 3,
//       subTotal: 40,
//       items: [
//         {
//           menuItemId: 9,
//           name: "Burger",
//           quantity: 2,
//           unitPrice: 20,
//           totalPrice: 40,
//           isAvailable: true,
//         },
//       ],
//     };

//     service.addItemToCart.mockResolvedValueOnce(updatedCart);

//     const response = await request(app)
//       .post("/cart/items")
//       .send({ menuItemId: 9, quantity: 2 });

//     expect(response.status).toBe(201);
//     expect(response.body.data).toEqual(updatedCart);
//     expect(service.addItemToCart).toHaveBeenCalledWith(
//       authenticatedCustomerId,
//       {
//         menuItemId: 9,
//         quantity: 2,
//       },
//     );
//   });

//   it("ignores a customerId sent in the body and uses the authenticated customer instead", async () => {
//     const { app, service } = await createTestApp("customer");

//     await request(app)
//       .post("/cart/items")
//       .send({ customerId: 999, menuItemId: 8, quantity: 1 })
//       .expect(201);

//     expect(service.addItemToCart).toHaveBeenCalledWith(
//       authenticatedCustomerId,
//       {
//         menuItemId: 8,
//         quantity: 1,
//       },
//     );
//   });

//   it("updates an item quantity without customerId in the body", async () => {
//     const { app, service } = await createTestApp("customer");

//     const response = await request(app)
//       .patch("/cart/items/11")
//       .send({ quantity: 4 });

//     expect(response.status).toBe(200);
//     expect(service.updateQuantity).toHaveBeenCalledWith(
//       authenticatedCustomerId,
//       {
//         menuItemId: 11,
//         quantity: 4,
//       },
//     );
//   });

//   it("increases an item quantity for the authenticated customer", async () => {
//     const { app, service } = await createTestApp("customer");

//     const response = await request(app).patch("/cart/items/5/increase").send({});

//     expect(response.status).toBe(200);
//     expect(service.increaseCartItemQuantity).toHaveBeenCalledWith(
//       authenticatedCustomerId,
//       {
//         menuItemId: 5,
//       },
//     );
//   });

//   it("decreases an item quantity for the authenticated customer", async () => {
//     const { app, service } = await createTestApp("customer");

//     const response = await request(app).patch("/cart/items/5/decrease").send({});

//     expect(response.status).toBe(200);
//     expect(service.decreaseCartItemQuantity).toHaveBeenCalledWith(
//       authenticatedCustomerId,
//       {
//         menuItemId: 5,
//       },
//     );
//   });

//   it("removes an item without requiring customerId in the body", async () => {
//     const { app, service } = await createTestApp("customer");

//     const response = await request(app).delete("/cart/items/6");

//     expect(response.status).toBe(200);
//     expect(service.removeItemFromCart).toHaveBeenCalledWith(
//       authenticatedCustomerId,
//       {
//         menuItemId: 6,
//       },
//     );
//   });

//   it("clears the authenticated customer's cart without requiring customerId in the body", async () => {
//     const { app, service } = await createTestApp("customer");

//     const response = await request(app).delete("/cart/clear");

//     expect(response.status).toBe(200);
//     expect(service.clearCart).toHaveBeenCalledWith(authenticatedCustomerId);
//   });
// });
