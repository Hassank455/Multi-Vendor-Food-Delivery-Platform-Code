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