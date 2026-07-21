# 📈 Query Optimization Report – Food Delivery App

This document outlines SQL query performance improvements implemented across various modules in the food delivery app. The results are based on performance tests run on a dataset simulating production-scale data.

---

## 1. Test Dataset Preparation

To evaluate query performance under production-like conditions, a large relational dataset was generated directly in PostgreSQL using `generate_series`.

The dataset contains:

| Entity | Record Count |
|---|---:|
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

The data was generated using bulk `INSERT INTO ... SELECT` statements instead of individual inserts. This significantly reduced database round trips and provided a consistent dataset suitable for query execution-plan analysis.

Relationships were generated deterministically to ensure:

- Every customer belongs to an active user.
- Every restaurant belongs to a restaurant-owner user.
- Every menu item belongs to a category from the same restaurant.
- Every cart item belongs to the restaurant selected by the cart.
- Every order item belongs to the restaurant selected by the order.
- Cart subtotals and order totals match their related items.

After generating the dataset, PostgreSQL statistics were refreshed using `ANALYZE` to ensure that the query planner had accurate table statistics.

---

## Cart Module

### Function Name: `findCartByCustomerId`

**Purpose:**  
Fetch the cart associated with a specific customer.

**Repository Method:**

```ts
async findCartByCustomerId(
  customerId: number,
  tx?: PrismaTransaction,
) {
  return this.db(tx).cart.findUnique({
    where: {
      customerId,
    },
  });
}
```

**Generated SQL:**

```sql
SELECT
    "id",
    "customerId",
    "restaurantId",
    "subTotal"
FROM "Cart"
WHERE "customerId" = $1
LIMIT 1;
```

**Time Before Optimization:**  
—

The query was already optimized before testing because `customerId` was defined as a unique column.

**Optimization Technique:**

- Used `findUnique()` since each customer can own only one cart, allowing PostgreSQL to perform a direct lookup.
- Leveraged the existing unique index on `customerId`, enabling an efficient **Index Scan** instead of a sequential table scan.
- Added an index on `restaurantId` to optimize queries that filter or join carts by restaurant. This index is not used by this query but improves other cart-related operations such as retrieving all carts for a specific restaurant.

**Time After Optimization:**  
Median: `0.200 ms`  
Average: `0.209 ms`

**Execution Plan:**  
`Index Scan using Cart_customerId_key`

##

### Function Name: `findCartItem`

**Purpose:**  
Retrieve a specific cart item using the cart ID and menu item ID.

---

### Repository Method

```ts
async findCartItem(
  cartId: number,
  menuItemId: number,
  tx?: PrismaTransaction,
) {
  return this.db(tx).cartItem.findUnique({
    where: {
      cartId_menuItemId: {
        cartId,
        menuItemId,
      },
    },
  });
}
```

---

### Generated SQL

```sql
SELECT
    "id",
    "cart_id",
    "menu_item_id",
    "quantity",
    "price"
FROM "CartItem"
WHERE
    "cart_id" = $1
    AND "menu_item_id" = $2
LIMIT 1;
```

---

### Time Before Optimization

**—**

The query was already optimized before performance testing because a composite unique index already existed on `(cartId, menuItemId)`.

---

### Optimization Technique

- Used Prisma `findUnique()` to retrieve a single cart item using its unique key.
- Leveraged the existing composite unique index on `(cartId, menuItemId)`, allowing PostgreSQL to perform an efficient **Index Scan** instead of scanning all `300,000` cart item records.
- The composite unique constraint also prevents duplicate menu items from being added to the same cart.

---

### Time After Optimization

| Metric | Value |
|---------|-------:|
| Median Planning Time | **0.209 ms** |
| Average Planning Time | **0.479 ms** |
| Median Execution Time | **0.374 ms** |
| Average Execution Time | **0.422 ms** |
| Scan Type | **Index Scan** |
| Index Used | `CartItem_cart_id_menu_item_id_key` |
| Shared Buffer Hits | **4** |

---

### Execution Plan

```text
Index Scan using CartItem_cart_id_menu_item_id_key

Index Cond:
(cart_id = ?)
AND
(menu_item_id = ?)
```

---

### Result

The query is already well optimized.

PostgreSQL successfully uses the composite unique index `CartItem_cart_id_menu_item_id_key` to perform a direct indexed lookup. No additional indexes are required for this query because the existing composite index fully covers the search condition.

---

## Order Module

### Function Name: `getCustomerOrders`

**Purpose:**  
Retrieve paginated customer orders and calculate the total number of matching orders.

---

### Repository Method

```ts
async getCustomerOrders(
  customerId: number,
  query: GetCustomerOrdersQueryDto,
  tx?: PrismaTransaction,
) {
  const where: Prisma.OrderWhereInput = {
    customerId,
    ...(query.status && { status: query.status }),
  };

  const skip = (query.page - 1) * query.limit;

  const countQuery = this.db(tx).order.count({
    where,
  });

  const ordersQuery = this.db(tx).order.findMany({
    where,
    skip,
    take: query.limit,
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
        },
      },
      items: {
        include: {
          menuItem: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const [total, orders] = tx
    ? await Promise.all([countQuery, ordersQuery])
    : await prisma.$transaction([countQuery, ordersQuery]);

  return {
    total,
    orders,
  };
}
```

---

### Generated SQL

#### Count Query

```sql
SELECT COUNT(*)
FROM "Order"
WHERE "customerId" = $1;
```

#### Fetch Orders Query

```sql
SELECT
    "id",
    "customerId",
    "customerAddressId",
    "restaurantId",
    "status",
    "createdAt",
    "paymentMethod",
    "totalPrice",
    "discountPercentage",
    "priceAfterDiscount"
FROM "Order"
WHERE "customerId" = $1
ORDER BY "createdAt" DESC
LIMIT $2
OFFSET $3;
```

---

### Time Before Optimization

| Query | Median Execution Time |
|---------|----------------------:|
| Count Orders | **56.795 ms** |
| Fetch Orders | **58.313 ms** |

The queries performed a **Parallel Sequential Scan** over approximately **2 million** order records.

---

### Optimization Technique

- Added a composite B-tree index on `(customerId, createdAt DESC)`.
- Allowed PostgreSQL to locate a customer's orders directly instead of scanning the entire `Order` table.
- Optimized both the count query and the paginated query ordered by `createdAt DESC`.
- Reduced the number of scanned rows from approximately **2,000,000** to only the matching customer orders.

**Index**

```sql
CREATE INDEX "Order_customerId_createdAt_idx"
ON "Order" ("customerId", "createdAt" DESC);
```

---

### Time After Optimization

| Query | Median Execution Time |
|---------|----------------------:|
| Count Orders | **0.605 ms** |
| Fetch Orders | **0.948 ms** |

---

### Execution Plan

**Count Query**

```text
Bitmap Index Scan using Order_customerId_createdAt_idx
→ Bitmap Heap Scan
→ Aggregate
```

**Fetch Query**

```text
Bitmap Index Scan using Order_customerId_createdAt_idx
→ Bitmap Heap Scan
→ Sort
→ Limit
```

---

### Result

The composite index significantly improved both queries.

- Count query execution time decreased from **56.795 ms** to **0.605 ms** (~94× faster).
- Fetch query execution time decreased from **58.313 ms** to **0.948 ms** (~61× faster).

The optimizer now performs indexed lookups instead of scanning the entire `Order` table, resulting in sub-millisecond response times for customer order retrieval.