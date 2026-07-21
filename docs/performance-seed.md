# Performance Database Seeding

## Overview

To evaluate query performance accurately, the database must contain a dataset large enough to produce realistic PostgreSQL execution plans.

This document provides SQL scripts for generating a production-like dataset used during query optimization and performance testing.

## Important Usage Notice

These scripts are intended to run on a dedicated performance-testing database.

The scripts assume that the target tables are empty and that generated primary keys begin from `1`. They should not be executed on a production database or on a database containing existing application data.

Running the scripts multiple times without resetting the database may cause unique-constraint violations, duplicate data, or invalid relationships.

---

## Reset the Performance Database

Before running the seed scripts, reset the target tables and their identity sequences.

> This operation permanently deletes all records from the listed tables. Run it only on a dedicated performance-testing database.

```sql
TRUNCATE TABLE
    "TransactionLog",
    "Transaction",
    "Review",
    "OrderItem",
    "Order",
    "CartEvent",
    "CartItem",
    "Cart",
    "MenuItem",
    "MenuCategory",
    "DiscountCode",
    "CustomerAddress",
    "Restaurant",
    "Customer",
    "refresh_tokens",
    "AuthCode",
    "User"
RESTART IDENTITY CASCADE;
```

---

## Dataset Size

| Table | Records |
|--------|---------:|
| Users | 110,000 |
| Customers | 100,000 |
| Customer Addresses | 100,000 |
| Restaurants | 10,000 |
| Menu Categories | 30,000 |
| Menu Items | 300,000 |
| Carts | 100,000 |
| Cart Items | 300,000 |
| Orders | 2,000,000 |
| Order Items | 6,000,000 |

---

## Script 1 — Seed Users

```sql
INSERT INTO "User" (
    "name",
    "email",
    "password",
    "role",
    "emailVerifiedAt",
    "createdAt",
    "updatedAt",
    "isActive"
)
SELECT
    CASE
        WHEN gs <= 100000
            THEN 'Customer ' || gs
        ELSE
            'Restaurant Owner ' || (gs - 100000)
    END,
    'user' || gs || '@foodlify.test',
    '$2b$12$productionLikeDummyHashedPassword',
    CASE
        WHEN gs <= 100000
            THEN 'CUSTOMER'::"RoleEnum"
        ELSE
            'RESTAURANT_OWNER'::"RoleEnum"
    END,
    NOW() - ((gs % 365) || ' days')::interval,
    NOW() - ((gs % 730) || ' days')::interval,
    NOW(),
    1
FROM generate_series(1, 110000) AS gs;
```

### Notes

- Creates customer and restaurant owner accounts.
- Uses unique emails.

---

## Script 2 — Seed Customers

```sql
INSERT INTO "Customer" (
    "userId",
    "phone",
    "gender",
    "paymentPreference"
)
SELECT
    gs,
    '059' || LPAD(gs::text, 7, '0'),
    CASE
        WHEN gs % 2 = 0 THEN 'MALE'
        ELSE 'FEMALE'
    END,
    CASE
        WHEN gs % 3 = 0 THEN 'CARD'::"PaymentMethod"
        ELSE 'CASH'::"PaymentMethod"
    END
FROM generate_series(1, 100000) AS gs;
```

### Notes

- Creates one customer per user.

---

## Script 3 — Seed Customer Addresses

```sql
INSERT INTO "CustomerAddress" (
    "customerId",
    "street",
    "city",
    "buildingNo",
    "postalCode",
    "governorate",
    "deletedAt"
)
SELECT
    gs,
    'Street ' || ((gs % 500) + 1),
    CASE gs % 5
        WHEN 0 THEN 'Gaza'
        WHEN 1 THEN 'Rafah'
        WHEN 2 THEN 'Khan Younis'
        WHEN 3 THEN 'Deir Al-Balah'
        ELSE 'North Gaza'
    END,
    ((gs % 200) + 1)::text,
    LPAD((gs % 99999)::text, 5, '0'),
    CASE gs % 5
        WHEN 0 THEN 'Gaza'
        WHEN 1 THEN 'Rafah'
        WHEN 2 THEN 'Khan Younis'
        WHEN 3 THEN 'Deir Al-Balah'
        ELSE 'North Gaza'
    END,
    NULL
FROM generate_series(1, 100000) AS gs;
```

---

## Script 4 — Seed Restaurants

```sql
INSERT INTO "Restaurant" (
    "name",
    "phone",
    "address",
    "ownerId",
    "rating",
    "isEnabled",
    "createdAt"
)
SELECT
    'Restaurant ' || gs,
    '056' || LPAD(gs::text, 7, '0'),
    'Restaurant Address ' || gs,
    100000 + gs,
    ROUND(
        (2.5 + ((gs % 26)::numeric / 10))::numeric,
        1
    )::double precision,
    CASE
        WHEN gs % 50 = 0 THEN FALSE
        ELSE TRUE
    END,
    NOW() - ((gs % 1000) || ' days')::interval
FROM generate_series(1, 10000) AS gs;
```

---

## Script 5 — Seed Menu Categories

```sql
INSERT INTO "MenuCategory" (
    "name",
    "restaurantId",
    "isActive"
)
SELECT
    category_name,
    restaurant_id,
    TRUE
FROM (
    SELECT
        restaurant_id,
        category_number,
        CASE category_number
            WHEN 1 THEN 'Main Meals'
            WHEN 2 THEN 'Drinks'
            WHEN 3 THEN 'Desserts'
        END AS category_name
    FROM generate_series(1, 10000) AS restaurant_id
    CROSS JOIN generate_series(1, 3) AS category_number
) AS categories;
```

---

## Script 6 — Seed Menu Items

```sql
INSERT INTO "MenuItem" (
    "name",
    "description",
    "restaurantId",
    "categoryId",
    "price",
    "isAvailable",
    "deletedAt"
)
SELECT
    'Menu Item ' || item_number ||
        ' - Restaurant ' || restaurant_id,

    'Generated menu item for performance testing',

    restaurant_id,

    ((restaurant_id - 1) * 3)
        + (((item_number - 1) % 3) + 1),

    (
        5
        + ((restaurant_id + item_number) % 95)
        + (((restaurant_id * item_number) % 100)::double precision / 100)
    ),

    CASE
        WHEN item_number % 20 = 0 THEN FALSE
        ELSE TRUE
    END,

    NULL
FROM generate_series(1, 10000) AS restaurant_id
CROSS JOIN generate_series(1, 30) AS item_number;
```

---

## Script 7 — Seed Carts

```sql
INSERT INTO "Cart" (
    "customerId",
    "restaurantId",
    "subTotal"
)
SELECT
    customer_id,
    ((customer_id - 1) % 10000) + 1,
    0
FROM generate_series(1, 100000) AS customer_id;
```

---

## Script 8 — Seed Cart Items

```sql
INSERT INTO "CartItem" (
    "cart_id",
    "menu_item_id",
    "quantity",
    "price"
)
SELECT
    c."id",
    ((c."restaurantId" - 1) * 30) + item_position,
    ((c."id" + item_position) % 4) + 1,
    mi."price"
FROM "Cart" c
CROSS JOIN generate_series(1, 3) AS item_position
JOIN "MenuItem" mi
    ON mi."id" =
       ((c."restaurantId" - 1) * 30) + item_position;

UPDATE "Cart" c
SET "subTotal" = totals.sub_total
FROM (
    SELECT
        "cart_id",
        SUM("price" * "quantity")::numeric(10, 2) AS sub_total
    FROM "CartItem"
    GROUP BY "cart_id"
) AS totals
WHERE c."id" = totals."cart_id";       
```

---

## Script 9 — Seed Orders

```sql
INSERT INTO "Order" (
    "customerId",
    "customerAddressId",
    "restaurantId",
    "status",
    "createdAt",
    "paymentMethod",
    "totalPrice",
    "discountPercentage",
    "priceAfterDiscount"
)
SELECT
    customer_id,

    customer_id,

    ((customer_id - 1) % 10000) + 1,

    CASE order_number % 6
        WHEN 0 THEN 'PENDING'::"OrderStatus"
        WHEN 1 THEN 'CONFIRMED'::"OrderStatus"
        WHEN 2 THEN 'PREPARING'::"OrderStatus"
        WHEN 3 THEN 'OUT_FOR_DELIVERY'::"OrderStatus"
        WHEN 4 THEN 'DELIVERED'::"OrderStatus"
        ELSE 'CANCELLED'::"OrderStatus"
    END,

    NOW()
        - (
            (
                (customer_id * 20 + order_number) % 730
            ) || ' days'
        )::interval
        - (
            (
                customer_id + order_number
            ) % 24 || ' hours'
        )::interval,

    CASE
        WHEN order_number % 3 = 0
            THEN 'CARD'::"PaymentMethod"
        ELSE
            'CASH'::"PaymentMethod"
    END,

    0,

    CASE
        WHEN order_number % 10 = 0 THEN 10
        ELSE NULL
    END,

    NULL

FROM generate_series(1, 100000) AS customer_id
CROSS JOIN generate_series(1, 20) AS order_number;
```

---

## Script 10 — Seed Order Items

```sql
INSERT INTO "OrderItem" (
    "order_id",
    "menu_item_id",
    "quantity",
    "snapshot_price"
)
SELECT
    o."id",

    ((o."restaurantId" - 1) * 30)
        + (
            (
                o."id" + item_position - 2
            ) % 30
        )
        + 1,

    ((o."id" + item_position) % 4) + 1,

    mi."price"

FROM "Order" o

CROSS JOIN generate_series(1, 3) AS item_position

JOIN "MenuItem" mi
    ON mi."id" =
       (
           ((o."restaurantId" - 1) * 30)
           + (
               (
                   o."id" + item_position - 2
               ) % 30
           )
           + 1
       );

UPDATE "Order" o
SET
    "totalPrice" = totals.total_price,

    "priceAfterDiscount" =
        CASE
            WHEN o."discountPercentage" IS NOT NULL
            THEN
                totals.total_price
                - (
                    totals.total_price
                    * o."discountPercentage"
                    / 100.0
                )
            ELSE NULL
        END

FROM (
    SELECT
        "order_id",
        SUM("snapshot_price" * "quantity") AS total_price
    FROM "OrderItem"
    GROUP BY "order_id"
) AS totals

WHERE o."id" = totals."order_id";       
```

---

## Refresh PostgreSQL Statistics

```sql
ANALYZE "User";
ANALYZE "Customer";
ANALYZE "CustomerAddress";
ANALYZE "Restaurant";
ANALYZE "MenuCategory";
ANALYZE "MenuItem";
ANALYZE "Cart";
ANALYZE "CartItem";
ANALYZE "Order";
ANALYZE "OrderItem";
```

---

## Verify Generated Record Counts

After running all seed scripts, execute the following query to verify the total number of records created in each table:

```sql
SELECT
    'User' AS table_name,
    COUNT(*) AS actual_count,
    110000::bigint AS expected_count,
    COUNT(*) = 110000 AS is_valid
FROM "User"

UNION ALL

SELECT
    'Customer',
    COUNT(*),
    100000::bigint,
    COUNT(*) = 100000
FROM "Customer"

UNION ALL

SELECT
    'CustomerAddress',
    COUNT(*),
    100000::bigint,
    COUNT(*) = 100000
FROM "CustomerAddress"

UNION ALL

SELECT
    'Restaurant',
    COUNT(*),
    10000::bigint,
    COUNT(*) = 10000
FROM "Restaurant"

UNION ALL

SELECT
    'MenuCategory',
    COUNT(*),
    30000::bigint,
    COUNT(*) = 30000
FROM "MenuCategory"

UNION ALL

SELECT
    'MenuItem',
    COUNT(*),
    300000::bigint,
    COUNT(*) = 300000
FROM "MenuItem"

UNION ALL

SELECT
    'Cart',
    COUNT(*),
    100000::bigint,
    COUNT(*) = 100000
FROM "Cart"

UNION ALL

SELECT
    'CartItem',
    COUNT(*),
    300000::bigint,
    COUNT(*) = 300000
FROM "CartItem"

UNION ALL

SELECT
    'Order',
    COUNT(*),
    2000000::bigint,
    COUNT(*) = 2000000
FROM "Order"

UNION ALL

SELECT
    'OrderItem',
    COUNT(*),
    6000000::bigint,
    COUNT(*) = 6000000
FROM "OrderItem"

ORDER BY table_name;
```

The query displays:

- `actual_count`: The current number of records in the table.
- `expected_count`: The number of records expected after successful seeding.
- `is_valid`: Indicates whether the actual count matches the expected count.

All rows should return `true` in the `is_valid` column.

---

## Verify Referential Data Integrity

The following checks verify that the generated records are correctly connected to their parent entities.

### Customers without valid users

```sql
SELECT COUNT(*) AS invalid_customers
FROM "Customer" c
LEFT JOIN "User" u
    ON u."id" = c."userId"
WHERE u."id" IS NULL;
```

### Restaurants without valid owners

```sql
SELECT COUNT(*) AS invalid_restaurants
FROM "Restaurant" r
LEFT JOIN "User" u
    ON u."id" = r."ownerId"
WHERE u."id" IS NULL;
```

### Menu items assigned to a category from another restaurant

```sql
SELECT COUNT(*) AS invalid_menu_items
FROM "MenuItem" mi
JOIN "MenuCategory" mc
    ON mc."id" = mi."categoryId"
WHERE mi."restaurantId" <> mc."restaurantId";
```

### Cart items assigned to a different restaurant

```sql
SELECT COUNT(*) AS invalid_cart_items
FROM "CartItem" ci
JOIN "Cart" c
    ON c."id" = ci."cart_id"
JOIN "MenuItem" mi
    ON mi."id" = ci."menu_item_id"
WHERE c."restaurantId" <> mi."restaurantId";
```

### Order items assigned to a different restaurant

```sql
SELECT COUNT(*) AS invalid_order_items
FROM "OrderItem" oi
JOIN "Order" o
    ON o."id" = oi."order_id"
JOIN "MenuItem" mi
    ON mi."id" = oi."menu_item_id"
WHERE o."restaurantId" <> mi."restaurantId";
```

### Incorrect cart subtotals

```sql
SELECT COUNT(*) AS carts_with_invalid_subtotal
FROM "Cart" c
JOIN (
    SELECT
        "cart_id",
        SUM("price" * "quantity")::numeric(10, 2) AS calculated_subtotal
    FROM "CartItem"
    GROUP BY "cart_id"
) totals
    ON totals."cart_id" = c."id"
WHERE c."subTotal" <> totals.calculated_subtotal;
```

### Incorrect order totals

```sql
SELECT COUNT(*) AS orders_with_invalid_total
FROM "Order" o
JOIN (
    SELECT
        "order_id",
        SUM("snapshot_price" * "quantity") AS calculated_total
    FROM "OrderItem"
    GROUP BY "order_id"
) totals
    ON totals."order_id" = o."id"
WHERE ABS(o."totalPrice" - totals.calculated_total) > 0.001;
```

Every integrity check should return `0`.