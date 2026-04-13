import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding with SQL...");

    await prisma.$executeRawUnsafe(`
    -- USERS
    INSERT INTO "User" (id, name, email, phone, password, created_at)
    VALUES
      (1, 'John Doe', 'john@test.com', '123456789', 'hashed', NOW()),
      (2, 'Jane Doe', 'jane@test.com', '987654321', 'hashed', NOW()),
      (3, 'Owner User', 'owner@test.com', '555555555', 'hashed', NOW())
    ON CONFLICT (id) DO NOTHING;
  `);

    await prisma.$executeRawUnsafe(`
    -- ROLES
    INSERT INTO "Role" (id, name)
    VALUES
      (1, 'customer'),
      (2, 'owner')
    ON CONFLICT (id) DO NOTHING;
  `);

    await prisma.$executeRawUnsafe(`
    -- USER ROLES
    INSERT INTO "UserRole" (user_id, role_id)
    VALUES
      (1, 1),
      (2, 1),
      (3, 2)
    ON CONFLICT DO NOTHING;
  `);

    await prisma.$executeRawUnsafe(`
    -- RESTAURANT
    INSERT INTO "Restaurant" (id, name, owner_id, address, rating)
    VALUES
      (1, 'Foodlify', 3, 'Main Street', 4.5)
    ON CONFLICT (id) DO NOTHING;
  `);

    await prisma.$executeRawUnsafe(`
    -- MENU
    INSERT INTO "Menu" (id, name, restaurant_id)
    VALUES
      (1, 'Main Menu', 1)
    ON CONFLICT (id) DO NOTHING;
  `);

    await prisma.$executeRawUnsafe(`
    -- MENU ITEMS
    INSERT INTO "MenuItem" (id, name, description, price, stock, menu_id)
    VALUES
      (1, 'Burger', 'Beef burger', 10, 50, 1),
      (2, 'Pizza', 'Cheese pizza', 15, 40, 1),
      (3, 'Pasta', 'Italian pasta', 12, 30, 1)
    ON CONFLICT (id) DO NOTHING;
  `);

    await prisma.$executeRawUnsafe(`
    -- DISCOUNT
    INSERT INTO "DiscountCode" (id, code, discount_amount, discount_type, expires_at, is_active)
    VALUES
      (1, 'DISCOUNT10', 10, 'percentage', NOW() + interval '7 days', true)
    ON CONFLICT (id) DO NOTHING;
  `);

    await prisma.$executeRawUnsafe(`
    -- CART
    INSERT INTO "Cart" (id, user_id, status, discount_id, created_at)
    VALUES
      (1, 1, 'active', 1, NOW()),
      (2, 2, 'active', NULL, NOW())
    ON CONFLICT (id) DO NOTHING;
  `);

    await prisma.$executeRawUnsafe(`
    -- CART ITEMS
    INSERT INTO "CartItem" (cart_id, menu_item_id, quantity, price)
    VALUES
      (1, 1, 2, 10),
      (1, 2, 1, 15),
      (2, 3, 3, 12)
    ON CONFLICT DO NOTHING;
  `);

    await prisma.$executeRawUnsafe(`
    -- ORDER STATUS
    INSERT INTO "OrderStatus" (id, name)
    VALUES
      (1, 'pending'),
      (2, 'completed')
    ON CONFLICT (id) DO NOTHING;
  `);

    await prisma.$executeRawUnsafe(`
    -- PAYMENT STATUS
    INSERT INTO "PaymentStatus" (id, name)
    VALUES
      (1, 'pending'),
      (2, 'paid'),
      (3, 'failed')
    ON CONFLICT (id) DO NOTHING;
  `);

    await prisma.$executeRawUnsafe(`
    -- PAYMENT METHODS
    INSERT INTO "PaymentMethod" (id, name)
    VALUES
      (1, 'cash'),
      (2, 'card')
    ON CONFLICT (id) DO NOTHING;
  `);

    console.log("SQL seeding completed");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });