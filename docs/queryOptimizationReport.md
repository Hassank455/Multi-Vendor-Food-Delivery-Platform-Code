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