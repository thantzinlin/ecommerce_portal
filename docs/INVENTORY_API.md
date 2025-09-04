# Inventory Management API Documentation

## Overview

This document describes the API endpoints for managing inventory when purchased items arrive.

## Base URL

```
https://your-api-domain.com/api/v1
```

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <your-jwt-token>
```

## Purchase Orders

### 1. Get Purchase Orders

```http
GET /purchase-orders
```

**Query Parameters:**

- `page` (number): Page number for pagination
- `perPage` (number): Items per page
- `status` (string): Filter by status (pending, ordered, shipped, received, cancelled)
- `supplier` (string): Filter by supplier name
- `fromDate` (string): Filter from date (YYYY-MM-DD)
- `toDate` (string): Filter to date (YYYY-MM-DD)

**Response:**

```json
{
  "returncode": "200",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "orderNumber": "PO-2024-001",
      "supplierId": "64f8a1b2c3d4e5f6a7b8c9d1",
      "supplierName": "ABC Suppliers",
      "items": [
        {
          "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
          "productId": "64f8a1b2c3d4e5f6a7b8c9d3",
          "productName": "iPhone 15 Pro",
          "productSku": "IPH15PRO-001",
          "quantity": 50,
          "unitCost": 899.99,
          "totalCost": 44999.5,
          "receivedQuantity": 0,
          "status": "pending"
        }
      ],
      "totalAmount": 44999.5,
      "status": "ordered",
      "orderDate": "2024-01-15T10:00:00Z",
      "expectedDeliveryDate": "2024-01-25T10:00:00Z",
      "actualDeliveryDate": null,
      "notes": "Standard delivery",
      "createdBy": "64f8a1b2c3d4e5f6a7b8c9d4",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pageCounts": 5,
  "total": 50
}
```

### 2. Get Single Purchase Order

```http
GET /purchase-orders/{id}
```

**Response:**

```json
{
  "returncode": "200",
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "orderNumber": "PO-2024-001",
    "supplierId": "64f8a1b2c3d4e5f6a7b8c9d1",
    "supplierName": "ABC Suppliers",
    "items": [
      {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "productId": "64f8a1b2c3d4e5f6a7b8c9d3",
        "productName": "iPhone 15 Pro",
        "productSku": "IPH15PRO-001",
        "quantity": 50,
        "unitCost": 899.99,
        "totalCost": 44999.5,
        "receivedQuantity": 0,
        "status": "pending",
        "currentStock": 10
      }
    ],
    "totalAmount": 44999.5,
    "status": "shipped",
    "orderDate": "2024-01-15T10:00:00Z",
    "expectedDeliveryDate": "2024-01-25T10:00:00Z",
    "actualDeliveryDate": null,
    "notes": "Standard delivery",
    "createdBy": "64f8a1b2c3d4e5f6a7b8c9d4",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### 3. Create Purchase Order

```http
POST /purchase-orders
```

**Request Body:**

```json
{
  "supplierId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "items": [
    {
      "productId": "64f8a1b2c3d4e5f6a7b8c9d3",
      "quantity": 50,
      "unitCost": 899.99
    }
  ],
  "expectedDeliveryDate": "2024-01-25T10:00:00Z",
  "notes": "Standard delivery"
}
```

### 4. Update Purchase Order Status

```http
PUT /purchase-orders/{id}/status
```

**Request Body:**

```json
{
  "status": "shipped"
}
```

### 5. Receive Inventory

```http
PUT /purchase-orders/{id}/receive-inventory
```

**Request Body:**

```json
{
  "purchaseOrderId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "receivedDate": "2024-01-25T10:00:00Z",
  "items": [
    {
      "itemId": "64f8a1b2c3d4e5f6a7b8c9d2",
      "receivedQuantity": 45,
      "notes": "5 items damaged during shipping",
      "qualityCheck": "passed"
    }
  ]
}
```

**Response:**

```json
{
  "returncode": "200",
  "data": {
    "message": "Inventory received successfully",
    "updatedProducts": [
      {
        "productId": "64f8a1b2c3d4e5f6a7b8c9d3",
        "productName": "iPhone 15 Pro",
        "previousStock": 10,
        "newStock": 55,
        "receivedQuantity": 45
      }
    ]
  }
}
```

## Inventory Management

### 1. Get Inventory Statistics

```http
GET /inventory/stats
```

**Response:**

```json
{
  "returncode": "200",
  "data": {
    "totalProducts": 150,
    "lowStockProducts": 12,
    "outOfStockProducts": 3,
    "totalValue": 125000.5,
    "pendingOrders": 8,
    "shippedOrders": 5
  }
}
```

### 2. Get Low Stock Products

```http
GET /inventory/low-stock
```

**Response:**

```json
{
  "returncode": "200",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
      "name": "iPhone 15 Pro",
      "currentStock": 5,
      "lowStockThreshold": 10,
      "reorderPoint": 15,
      "lastRestocked": "2024-01-20T10:00:00Z",
      "supplierName": "ABC Suppliers"
    }
  ]
}
```

### 3. Update Product Stock

```http
PUT /products/{id}/stock
```

**Request Body:**

```json
{
  "stockQuantity": 55,
  "adjustmentType": "received", // received, sold, damaged, returned
  "adjustmentQuantity": 45,
  "notes": "Received from purchase order PO-2024-001"
}
```

## Real-world Implementation Workflow

### 1. Purchase Order Creation

1. **Identify Low Stock**: System automatically identifies products below reorder point
2. **Create Purchase Order**: Manager creates PO with supplier
3. **Order Confirmation**: Supplier confirms order and provides tracking
4. **Status Updates**: System tracks order through lifecycle

### 2. Inventory Receiving Process

1. **Notification**: System alerts when order is shipped
2. **Quality Check**: Staff inspects received items
3. **Quantity Verification**: Compare received vs ordered quantities
4. **Stock Update**: Automatically update product inventory
5. **Documentation**: Record any discrepancies or damages

### 3. Automated Features

- **Low Stock Alerts**: Email notifications when products reach reorder point
- **Auto-reorder**: Automatic PO creation for fast-moving items
- **Inventory Valuation**: Real-time calculation of inventory value
- **Stock Movement History**: Complete audit trail of all stock changes

## Error Handling

### Common Error Responses

```json
{
  "returncode": "400",
  "returnmessage": "Invalid quantity received",
  "errors": [
    "Received quantity cannot exceed ordered quantity",
    "Quality check is required for all items"
  ]
}
```

```json
{
  "returncode": "404",
  "returnmessage": "Purchase order not found"
}
```

```json
{
  "returncode": "409",
  "returnmessage": "Purchase order already received"
}
```

## Best Practices

1. **Always validate quantities** before updating stock
2. **Implement quality checks** for received items
3. **Maintain audit trail** of all inventory movements
4. **Use transaction-based updates** to ensure data consistency
5. **Implement rollback mechanisms** for failed operations
6. **Send notifications** for critical inventory events
7. **Regular inventory audits** to verify system accuracy
