# Transaction API Implementation

This document describes the transaction APIs that aggregate Order and OrderStatus data using MongoDB pipelines with pagination and sorting capabilities.

## 🚀 Overview

The transaction APIs provide comprehensive access to payment transaction data by joining Order and OrderStatus collections using MongoDB aggregation pipelines. All endpoints support pagination, sorting, and filtering.

## 📁 Implementation Structure

```
src/
├── modules/
│   └── payment/
│       ├── transaction.service.ts       # Transaction business logic
│       └── transaction.controller.ts    # Transaction API endpoints
├── dto/
│   └── transaction-query.dto.ts        # Query validation and response DTOs
└── schemas/
    ├── order.schema.ts                 # Order model
    └── order-status.schema.ts          # OrderStatus model
```

## 🌐 API Endpoints

### 1. Get All Transactions (Protected)

**Endpoint:** `GET /transactions`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Query Parameters:**
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 100)
- `sort`: Sort field (default: 'payment_time')
- `order`: Sort order 'asc' or 'desc' (default: 'desc')
- `status`: Filter by payment status
- `payment_mode`: Filter by payment method
- `gateway_name`: Filter by payment gateway

**Available Sort Fields:**
- `payment_time` - Payment timestamp
- `createdAt` - Order creation time
- `updatedAt` - Last update time
- `order_amount` - Order amount
- `transaction_amount` - Transaction amount
- `status` - Payment status
- `school_id` - School identifier
- `custom_order_id` - Custom order ID

**Example Request:**
```bash
GET /transactions?page=1&limit=20&sort=payment_time&order=desc&status=success
```

**Response:**
```json
{
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "order_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "custom_order_id": "ORD_1694123456789_001",
      "school_id": "school_123",
      "trustee_id": "system",
      "student_info": {
        "name": "John Doe",
        "id": "student_123",
        "email": "john@example.com"
      },
      "gateway_name": "edviron",
      "order_amount": 1000,
      "transaction_amount": 1000,
      "payment_mode": "UPI",
      "payment_details": {
        "transaction_id": "txn_abc123",
        "gateway_response": "Payment successful"
      },
      "bank_reference": "bank_ref_123",
      "payment_message": "Payment completed",
      "status": "success",
      "error_message": null,
      "payment_time": "2023-09-08T10:30:00.000Z",
      "order_created_at": "2023-09-08T10:25:00.000Z",
      "status_updated_at": "2023-09-08T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 47,
    "items_per_page": 10,
    "has_next": true,
    "has_prev": false
  },
  "sort": {
    "field": "payment_time",
    "order": "desc"
  }
}
```

### 2. Get Transactions by School (Protected)

**Endpoint:** `GET /transactions/school/:schoolId`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Parameters:**
- `schoolId`: School identifier (required)

**Query Parameters:** Same as GET /transactions

**Example Request:**
```bash
GET /transactions/school/school_123?page=1&limit=10&sort=payment_time&order=desc
```

**Response:** Same structure as GET /transactions but filtered by school

### 3. Get Transaction Status (Protected)

**Endpoint:** `GET /transaction-status/:customOrderId`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Parameters:**
- `customOrderId`: Custom order identifier (required)

**Example Request:**
```bash
GET /transaction-status/ORD_1694123456789_001
```

**Response:**
```json
{
  "custom_order_id": "ORD_1694123456789_001",
  "status": "success",
  "order_amount": 1000,
  "transaction_amount": 1000,
  "payment_mode": "UPI",
  "payment_time": "2023-09-08T10:30:00.000Z",
  "error_message": null,
  "last_updated": "2023-09-08T10:30:00.000Z"
}
```

## 🔄 MongoDB Aggregation Pipeline

### Pipeline Structure

The transaction APIs use MongoDB aggregation pipelines to join Order and OrderStatus collections:

```javascript
[
  // Join OrderStatus collection
  {
    $lookup: {
      from: 'orderstatuses',
      localField: '_id',
      foreignField: 'collect_id',
      as: 'orderStatus'
    }
  },
  // Unwind the joined array
  {
    $unwind: {
      path: '$orderStatus',
      preserveNullAndEmptyArrays: true
    }
  },
  // Apply filters
  {
    $match: {
      // Dynamic match conditions based on query parameters
    }
  },
  // Project required fields
  {
    $project: {
      _id: 1,
      order_id: '$_id',
      custom_order_id: 1,
      school_id: 1,
      // ... other fields
    }
  },
  // Sort results
  {
    $sort: {
      // Dynamic sort based on query parameters
    }
  },
  // Pagination
  { $skip: skip },
  { $limit: limit }
]
```

### Performance Optimizations

1. **Indexed Fields**: Queries use indexed fields for efficient filtering
2. **Projection**: Only required fields are projected to reduce data transfer
3. **Pagination**: Proper skip/limit implementation for large datasets
4. **Count Optimization**: Separate pipeline for total count calculation

## 📊 Query Parameters Validation

### TransactionQueryDto
```typescript
{
  page?: number;          // Min: 1, Default: 1
  limit?: number;         // Min: 1, Max: 100, Default: 10
  sort?: string;          // Allowed values: see sort fields above
  order?: string;         // 'asc' or 'desc', Default: 'desc'
  status?: string;        // Filter by payment status
  payment_mode?: string;  // Filter by payment method
  gateway_name?: string;  // Filter by gateway
}
```

### Validation Rules
- Page numbers start from 1
- Maximum 100 items per page to prevent performance issues
- Sort fields are restricted to predefined safe values
- Order must be either 'asc' or 'desc'

## 🧪 Testing Examples

### 1. Get All Transactions with Pagination
```bash
curl -X GET "http://localhost:3000/transactions?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Get Transactions Sorted by Amount
```bash
curl -X GET "http://localhost:3000/transactions?sort=order_amount&order=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Filter by Status and Payment Mode
```bash
curl -X GET "http://localhost:3000/transactions?status=success&payment_mode=UPI" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get School Transactions
```bash
curl -X GET "http://localhost:3000/transactions/school/school_123?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Get Transaction Status
```bash
curl -X GET "http://localhost:3000/transaction-status/ORD_1694123456789_001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚨 Error Responses

### Validation Errors
```json
{
  "statusCode": 400,
  "message": [
    "page must not be less than 1",
    "limit must not be greater than 100"
  ],
  "error": "Bad Request"
}
```

### Transaction Not Found
```json
{
  "statusCode": 404,
  "message": "Transaction with custom_order_id 'INVALID_ID' not found"
}
```

### Unauthorized Access
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## 📈 Response Structure Details

### Transaction Data Fields
- `_id`: MongoDB document ID
- `order_id`: Same as _id, for clarity
- `custom_order_id`: Human-readable order identifier
- `school_id`: School identifier
- `trustee_id`: Trustee identifier
- `student_info`: Embedded student information
- `gateway_name`: Payment gateway used
- `order_amount`: Original order amount
- `transaction_amount`: Actual transaction amount
- `payment_mode`: Payment method (UPI, Card, etc.)
- `payment_details`: Additional payment information
- `status`: Current payment status
- `payment_time`: When payment was processed
- `order_created_at`: Order creation timestamp
- `status_updated_at`: Last status update timestamp

### Pagination Metadata
- `current_page`: Current page number
- `total_pages`: Total number of pages
- `total_items`: Total number of transactions
- `items_per_page`: Number of items per page
- `has_next`: Whether next page exists
- `has_prev`: Whether previous page exists

## 🔍 Advanced Filtering

### Multiple Filters
```bash
GET /transactions?status=success&payment_mode=UPI&gateway_name=edviron&page=2
```

### Date Range Filtering (Future Enhancement)
```bash
# Potential future enhancement
GET /transactions?start_date=2023-09-01&end_date=2023-09-30
```

### Amount Range Filtering (Future Enhancement)
```bash
# Potential future enhancement
GET /transactions?min_amount=100&max_amount=5000
```

## 🔒 Security Considerations

### Authentication
- All endpoints require JWT authentication
- JWT tokens must be valid and not expired
- Users can only access transactions they're authorized for

### Data Protection
- Sensitive payment details are included but can be filtered
- Student information is included for transaction context
- No raw payment gateway responses exposed

### Rate Limiting
- Consider implementing rate limiting for high-volume usage
- Monitor query performance and add indexes as needed

## 🚀 Performance Considerations

### Database Indexes
Ensure these indexes exist for optimal performance:
```javascript
// Orders collection
db.orders.createIndex({ "school_id": 1 })
db.orders.createIndex({ "custom_order_id": 1 })
db.orders.createIndex({ "createdAt": -1 })

// OrderStatus collection
db.orderstatuses.createIndex({ "collect_id": 1 })
db.orderstatuses.createIndex({ "status": 1 })
db.orderstatuses.createIndex({ "payment_time": -1 })
db.orderstatuses.createIndex({ "payment_mode": 1 })
```

### Query Optimization
- Use projection to limit returned fields
- Implement proper pagination to handle large datasets
- Consider caching for frequently accessed data
- Monitor slow queries and optimize as needed

### Scalability
- Aggregation pipelines are optimized for MongoDB's query engine
- Consider read replicas for high-read scenarios
- Implement connection pooling for database connections

## 📊 Monitoring and Logging

### Log Examples
```
[TransactionService] Retrieved 10 transactions (page 1/5)
[TransactionService] Retrieved 15 transactions for school school_123 (page 1/2)
[TransactionService] Retrieved transaction status for order: ORD_1694123456789_001
```

### Metrics to Monitor
- Query execution times
- Most frequently accessed endpoints
- Popular sort and filter combinations
- Error rates and types

This transaction API implementation provides comprehensive access to payment data with enterprise-grade performance, security, and scalability features.