import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { RoleEnum } from "../src/generated/prisma/enums";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Make sure the .env file is loaded.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const DEMO_PASSWORD = "demo123456";

async function bootstrapSuperAdmin() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!superAdminEmail && !superAdminPassword) {
    console.warn(
      "SUPER_ADMIN bootstrap skipped: SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD are not set.",
    );
    return;
  }

  if (!superAdminEmail || !superAdminPassword) {
    throw new Error(
      "SUPER_ADMIN bootstrap requires both SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD.",
    );
  }

  const passwordHash = await bcrypt.hash(superAdminPassword, 10);

  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: {
      name: "Bootstrap Super Admin",
      password: passwordHash,
      role: RoleEnum.SUPER_ADMIN,
      isActive: 1,
      emailVerifiedAt: new Date(),
    },
    create: {
      name: "Bootstrap Super Admin",
      email: superAdminEmail,
      password: passwordHash,
      role: RoleEnum.SUPER_ADMIN,
      isActive: 1,
      emailVerifiedAt: new Date(),
    },
  });
}

async function findOrCreateCustomerAddress(data: {
  customerId: number;
  street: string;
  city: string;
  buildingNo?: string;
  postalCode?: string;
  governorate: string;
}) {
  const existingCustomerAddress = await prisma.customerAddress.findFirst({
    where: {
      customerId: data.customerId,
      street: data.street,
      city: data.city,
      buildingNo: data.buildingNo,
      postalCode: data.postalCode,
      governorate: data.governorate,
    },
  });

  if (existingCustomerAddress) {
    return existingCustomerAddress;
  }

  return await prisma.customerAddress.create({
    data,
  });
}

async function main() {
  await bootstrapSuperAdmin();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const owner = await prisma.user.upsert({
    where: { email: "owner@foodlify.demo" },
    update: {
      name: "Demo Restaurant Owner",
      password: passwordHash,
      role: RoleEnum.RESTAURANT_OWNER,
      isActive: 1,
      emailVerifiedAt: new Date(),
    },
    create: {
      name: "Demo Restaurant Owner",
      email: "owner@foodlify.demo",
      password: passwordHash,
      role: RoleEnum.RESTAURANT_OWNER,
      isActive: 1,
      emailVerifiedAt: new Date(),
    },
  });

  const [customerUserOne, customerUserTwo] = await Promise.all([
    prisma.user.upsert({
      where: { email: "customer1@foodlify.demo" },
      update: {
        name: "Demo Customer One",
        password: passwordHash,
        role: RoleEnum.CUSTOMER,
        isActive: 1,
        emailVerifiedAt: new Date(),
      },
      create: {
        name: "Demo Customer One",
        email: "customer1@foodlify.demo",
        password: passwordHash,
        role: RoleEnum.CUSTOMER,
        isActive: 1,
        emailVerifiedAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: "customer2@foodlify.demo" },
      update: {
        name: "Demo Customer Two",
        password: passwordHash,
        role: RoleEnum.CUSTOMER,
        isActive: 1,
        emailVerifiedAt: new Date(),
      },
      create: {
        name: "Demo Customer Two",
        email: "customer2@foodlify.demo",
        password: passwordHash,
        role: RoleEnum.CUSTOMER,
        isActive: 1,
        emailVerifiedAt: new Date(),
      },
    }),
  ]);

  const [customerOne, customerTwo] = await Promise.all([
    prisma.customer.upsert({
      where: { userId: customerUserOne.id },
      update: {
        phone: "0599000002",
      },
      create: {
        userId: customerUserOne.id,
        phone: "0599000002",
      },
    }),
    prisma.customer.upsert({
      where: { userId: customerUserTwo.id },
      update: {
        phone: "0599000003",
      },
      create: {
        userId: customerUserTwo.id,
        phone: "0599000003",
      },
    }),
  ]);

  const [customerOneAddress, customerTwoAddress] = await Promise.all([
    findOrCreateCustomerAddress({
      customerId: customerOne.id,
      street: "Omar Al Mukhtar Street",
      city: "Gaza",
      buildingNo: "12A",
      postalCode: "00970",
      governorate: "Gaza",
    }),
    findOrCreateCustomerAddress({
      customerId: customerTwo.id,
      street: "Al Wehda Street",
      city: "Gaza",
      buildingNo: "8B",
      postalCode: "00970",
      governorate: "Gaza",
    }),
  ]);

  let restaurant = await prisma.restaurant.findFirst({
    where: { ownerId: owner.id },
  });

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: "Demo Burger House",
        phone: "0599000010",
        address: "Gaza, Al Remal, Omar Al Mukhtar Street",
        ownerId: owner.id,
        rating: 4.7,
      },
    });
  }

  const categoryDefinitions = [
    { name: "Burgers" },
    { name: "Sides" },
  ] as const;

  const categories = [];

  for (const categoryDefinition of categoryDefinitions) {
    let category = await prisma.menuCategory.findFirst({
      where: {
        restaurantId: restaurant.id,
        name: categoryDefinition.name,
      },
    });

    if (!category) {
      category = await prisma.menuCategory.create({
        data: {
          name: categoryDefinition.name,
          restaurantId: restaurant.id,
        },
      });
    }

    categories.push(category);
  }

  const categoryIdsByName = new Map(
    categories.map((category) => [category.name, category.id]),
  );

  const menuItems = [
    {
      name: "Classic Burger",
      description: "Beef patty, lettuce, tomato, onions, and house sauce.",
      categoryName: "Burgers",
      price: 22,
    },
    {
      name: "Cheese Burger",
      description: "Beef patty with double cheese, pickles, and mustard mayo.",
      categoryName: "Burgers",
      price: 24,
    },
    {
      name: "Crispy Chicken Burger",
      description: "Crispy chicken fillet with slaw and spicy mayo.",
      categoryName: "Burgers",
      price: 23,
    },
    {
      name: "Loaded Fries",
      description: "Fries topped with cheese sauce, jalapenos, and herbs.",
      categoryName: "Sides",
      price: 14,
    },
    {
      name: "Onion Rings",
      description: "Golden onion rings served with smoky dip.",
      categoryName: "Sides",
      price: 12,
    },
  ] as const;

  for (const item of menuItems) {
    const categoryId = categoryIdsByName.get(item.categoryName);

    if (!categoryId) {
      throw new Error(`Missing menu category: ${item.categoryName}`);
    }

    const existingItem = await prisma.menuItem.findFirst({
      where: {
        restaurantId: restaurant.id,
        name: item.name,
      },
    });

    if (!existingItem) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          description: item.description,
          restaurantId: restaurant.id,
          categoryId,
          price: item.price,
          isAvailable: true,
        },
      });
    }
  }

  console.log("Seed completed successfully.");
  console.log(`Owner email: ${owner.email}`);
  console.log(
    `Customer emails: ${customerUserOne.email}, ${customerUserTwo.email}`,
  );
  console.log(
    `Customer address IDs: ${customerOneAddress.id} for ${customerUserOne.email}, ${customerTwoAddress.id} for ${customerUserTwo.email}`,
  );
  console.log(`Demo password: ${DEMO_PASSWORD}`);
  console.log(`Restaurant: ${restaurant.name}`);
}

main()
  .catch((error) => {
    console.error("Seed failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
