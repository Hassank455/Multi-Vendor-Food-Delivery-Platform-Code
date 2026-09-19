# Foodlify Load Testing with Apache JMeter

## Overview

This document explains how to perform load testing for the Foodlify backend using **Apache JMeter**.

The test simulates real customer behavior by executing the following workflow:

```
Login
    ↓
Add To Cart
    ↓
Place Order
```

Each virtual user logs in using a unique account, adds an item to the cart, and places an order.

---

# Architecture

The load test simulates a complete customer journey from authentication to placing an order.

```text
                           users.csv
                               │
                               ▼
                    CSV Data Set Config
                               │
                     (Read unique user data)
                               │
                               ▼
                     Login (POST /login)
                               │
                               ▼
                  JSON Extractor (JWT Token)
                               │
                     accessToken Variable
                               │
               ┌───────────────┴────────────────┐
               │                                │
               ▼                                ▼
    Authorization Header             customerAddressId
   Bearer ${accessToken}              From CSV File
               │                                │
               └───────────────┬────────────────┘
                               │
                               ▼
                  Add To Cart (POST /cart/items)
                               │
                               ▼
                  Place Order (POST /orders)
                               │
                               ▼
                    Aggregate / Summary Report
                               │
                               ▼
                     Performance Metrics
```

---

## Execution Flow

For every virtual user:

1. Read a unique user from the CSV file.
2. Login using the user's credentials.
3. Extract the JWT access token from the login response.
4. Store the token in a JMeter variable.
5. Use the token in authenticated requests.
6. Add an item to the cart.
7. Place an order using the customer's address.
8. Record the request statistics.

---

## Components

| Component | Purpose |
|----------|---------|
| CSV Data Set Config | Supplies unique users and customer addresses. |
| Login Request | Authenticates the customer. |
| JSON Extractor | Extracts the JWT access token. |
| HTTP Header Manager | Adds required HTTP headers and Authorization token. |
| Add To Cart | Adds a menu item to the customer's cart. |
| Place Order | Creates an order from the customer's cart. |
| Aggregate Report | Displays latency, throughput, percentiles, and errors. |
| Summary Report | Shows overall execution statistics. |
| Simple Data Writer | Saves raw execution results to a CSV file. |
| View Results Tree | Used only for debugging individual requests. |

---

## Authentication Flow

```text
Login Request
      │
      ▼
Receive JSON Response
      │
      ▼
JSON Extractor
      │
      ▼
${accessToken}
      │
      ▼
Authorization: Bearer ${accessToken}
      │
      ▼
Authenticated Requests
```

---

## Data Flow

```text
users.csv
    │
    ├── email
    ├── password
    └── customerAddressId
          │
          ▼
CSV Variables
          │
          ├── ${email}
          ├── ${password}
          └── ${customerAddressId}
                  │
                  ▼
      Login → Add To Cart → Place Order
```

---

# Test Scenario

### Workflow

```
Customer Login
        ↓
Extract JWT Access Token
        ↓
Add Item To Cart
        ↓
Place Order
```

---

# Test Configuration

## Thread Group

| Setting | Value |
|---------|------:|
| Concurrent Users | 500 |
| Ramp-up | 30 seconds |
| Loop Count | 1 (or 2 if testing 1000 requests) |

Meaning:

- 500 users
- All users start gradually over 30 seconds
- Every user performs the whole workflow once.

---

# CSV Data Set Config

A CSV file is used to simulate different customers.

Example:

```csv
email,password,customerAddressId
seed.customer0001@foodlify.demo,demo123456,1
seed.customer0002@foodlify.demo,demo123456,2
seed.customer0003@foodlify.demo,demo123456,3
```

Configuration:

```
Filename:
users.csv

Variable Names:
email,password,customerAddressId

Recycle on EOF:
False

Stop Thread on EOF:
True

Sharing Mode:
All Threads
```

This guarantees that every virtual user logs in with a different account.

---

# HTTP Header Manager

Global headers:

```
Content-Type: application/json
Accept: application/json
```

Requests requiring authentication:

```
Authorization:
Bearer ${accessToken}
```

---

# Login Request

```
POST /api/v1/auth/customer/login
```

Body:

```json
{
    "email": "${email}",
    "password": "${password}"
}
```

Expected Response:

```json
{
    "message": "...",
    "data": {
        "accessToken": "...",
        "refreshToken": "...",
        ...
    }
}
```

---

# JSON Extractor

After Login, extract the JWT access token.

Configuration:

```
Variable Name:
accessToken

JSON Path:
$.data.accessToken

Match Number:
1
```

The extracted token is later used in authenticated requests.

---

# Add To Cart

```
POST /api/v1/cart/items
```

Headers

```
Authorization:
Bearer ${accessToken}
```

Body

```json
{
    "menuItemId":3,
    "quantity":4
}
```

Expected Response

```
201 Created
```

---

# Place Order

```
POST /api/v1/orders
```

Headers

```
Authorization:
Bearer ${accessToken}
```

Body

```json
{
    "customerAddressId": ${customerAddressId},
    "paymentMethod":"CASH"
}
```

Expected Response

```
201 Created
```

---

# Test Flow

```
Thread

↓

Read CSV Row

↓

Login

↓

Extract JWT

↓

Add To Cart

↓

Place Order

↓

Finish
```

Every thread performs the workflow independently.

---

# Listeners

The following listeners were used during development.

### Aggregate Report

Used to measure:

- Average Response Time
- Percentiles
- Throughput
- Error Rate

---

### Summary Report

Used to monitor:

- Total Requests
- Throughput
- Average Response Time
- Error Percentage

---

### View Results Tree

Used only during debugging.

It helps inspect:

- Request Body
- Request Headers
- Response Body
- Response Headers

> Do not use this listener in large load tests because it consumes a lot of memory.

---

### Simple Data Writer

Stores all request results in a CSV file for later analysis.

---

# Test Results

Example

| Request | Samples | Avg | Error |
|---------|---------:|----:|------:|
| Login | 500 | 67 ms | 0% |
| Add To Cart | 500 | 8 ms | 0% |
| Place Order | 500 | xx ms | 0% |

---

# Notes

- Every virtual user uses a unique account.
- JWT token is extracted automatically.
- Authentication is handled dynamically.
- Every user has its own customer address.
- No hardcoded tokens are used.
- The workflow simulates real customer behavior.

---

# Future Improvements

- Random Menu Items
- Random Quantity
- Dynamic Address Selection
- Checkout with multiple payment methods
- Stress Testing
- Spike Testing
- Endurance Testing
- Distributed Load Testing