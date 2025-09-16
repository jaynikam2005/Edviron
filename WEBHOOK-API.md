# Webhook API Implementation

This document describes the webhook endpoint implementation for receiving payment status updates from Edviron's payment gateway.

## 🚀 Overview

The webhook system receives payment status updates, validates payloads, updates OrderStatus records in MongoDB, logs all webhook events, and returns appropriate responses to the payment gateway.

## 📁 Implementation Structure

```
src/
├── modules/
│   └── payment/
│       ├── payment.controller.ts    # Webhook endpoint
│       └── webhook.service.ts       # Webhook processing logic
├── dto/
│   └── webhook.dto.ts              # Webhook validation DTOs
└── schemas/
    ├── order-status.schema.ts      # OrderStatus model
    └── webhook-logs.schema.ts      # WebhookLogs model
```

## 🌐 Webhook Endpoint

### POST /payment/webhook (Public)

**Description:** Receives webhook payloads from Edviron payment gateway, processes payment status updates, and logs all events.

**Endpoint:** `POST /payment/webhook`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "status": "success",
  "order_info": {
    "order_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "custom_order_id": "ORD_1694123456789_001",
    "school_id": "school_123",
    "amount": 1000,
    "currency": "INR"
  },
  "transaction_id": "txn_abc123def456",
  "payment_method": "UPI",
  "amount": 1000,
  "gateway_response": "Payment completed successfully",
  "metadata": {
    "gateway_transaction_id": "gw_txn_789",
    "payment_time": "2023-09-08T10:30:00Z"
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Webhook processed successfully",
  "processed_at": "2023-09-08T10:30:15.123Z"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Order not found",
  "processed_at": "2023-09-08T10:30:15.123Z"
}
```

## 📋 Webhook Payload Validation

### Required Fields
- `status`: Payment status (string, required)
- `order_info`: Order information object (required)
  - `order_id`: Order identifier (string, required)

### Optional Fields
- `transaction_id`: Gateway transaction ID
- `payment_method`: Payment method used
- `amount`: Transaction amount
- `gateway_response`: Gateway response message
- `metadata`: Additional data from gateway

### Order Info Fields
- `custom_order_id`: Custom order identifier
- `school_id`: School identifier
- `amount`: Order amount
- `currency`: Payment currency

## 🔄 Webhook Processing Flow

### 1. Payload Validation
- Validates incoming webhook payload using DTOs
- Ensures required fields are present
- Validates data types and formats

### 2. Webhook Logging
- Logs all incoming webhooks to `WebhookLogs` collection
- Records processing status and timestamps
- Captures error messages for failed processing

### 3. Order Lookup
- Searches for orders using multiple strategies:
  1. MongoDB `_id` (if order_id is valid ObjectId)
  2. `custom_order_id` field match
  3. `order_id` as `custom_order_id` fallback

### 4. OrderStatus Update
- Updates existing OrderStatus record or creates new one
- Maps webhook status to internal status values
- Records payment details and timestamps

### 5. Response Generation
- Returns 200 OK with processing status
- Includes timestamp and success/error message

## 📊 Status Mapping

### Webhook Status → OrderStatus Mapping
```typescript
{
  'success': 'success',
  'completed': 'success',
  'paid': 'success',
  'failed': 'failed',
  'error': 'failed',
  'cancelled': 'cancelled',
  'canceled': 'cancelled',
  'pending': 'pending',
  'processing': 'pending'
}
```

## 💾 Database Operations

### OrderStatus Record Structure
```typescript
{
  collect_id: ObjectId,           // Reference to Order
  order_amount: number,           // Original order amount
  transaction_amount: number,     // Actual transaction amount
  payment_mode: string,           // Payment method
  payment_details: {
    transaction_id: string,
    gateway_response: string,
    metadata: object
  },
  status: string,                 // Mapped status
  payment_time: Date,             // Processing timestamp
  error_message?: string          // Error details if failed
}
```

### WebhookLogs Record Structure
```typescript
{
  raw_payload: object,            // Complete webhook payload
  timestamp: Date,                // Received timestamp
  webhook_source: 'edviron_payment',
  event_type: string,             // e.g., 'payment_success'
  processing_status: string,      // 'received', 'processed', 'error'
  error_message?: string,         // Error details if any
  createdAt: Date,               // Auto-generated
  updatedAt: Date                // Auto-generated
}
```

## 🔍 Webhook Management Endpoints

### 1. Get Webhook Logs (Protected)

**Endpoint:** `GET /payment/webhook-logs?limit=50`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Query Parameters:**
- `limit`: Number of logs to retrieve (default: 50)

**Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "raw_payload": { /* webhook payload */ },
    "timestamp": "2023-09-08T10:30:00.000Z",
    "webhook_source": "edviron_payment",
    "event_type": "payment_success",
    "processing_status": "processed",
    "createdAt": "2023-09-08T10:30:00.000Z"
  }
]
```

### 2. Get Webhook Logs by Status (Protected)

**Endpoint:** `GET /payment/webhook-logs/status/:status`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Parameters:**
- `status`: Processing status ('received', 'processed', 'error', 'order_not_found')

## 🧪 Testing Examples

### 1. Successful Payment Webhook
```bash
curl -X POST http://localhost:3000/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "status": "success",
    "order_info": {
      "order_id": "ORD_1694123456789_001",
      "school_id": "school_123",
      "amount": 1000
    },
    "transaction_id": "txn_abc123",
    "payment_method": "UPI",
    "amount": 1000
  }'
```

### 2. Failed Payment Webhook
```bash
curl -X POST http://localhost:3000/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "status": "failed",
    "order_info": {
      "order_id": "ORD_1694123456789_001",
      "school_id": "school_123",
      "amount": 1000
    },
    "gateway_response": "Insufficient funds"
  }'
```

### 3. Get Webhook Logs
```bash
curl -X GET "http://localhost:3000/payment/webhook-logs?limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Get Error Logs
```bash
curl -X GET http://localhost:3000/payment/webhook-logs/status/error \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚨 Error Scenarios

### 1. Order Not Found
```json
{
  "success": false,
  "message": "Order not found",
  "processed_at": "2023-09-08T10:30:15.123Z"
}
```

### 2. Validation Error
```json
{
  "statusCode": 400,
  "message": [
    "status should not be empty",
    "order_info should not be empty"
  ],
  "error": "Bad Request"
}
```

### 3. Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "processed_at": "2023-09-08T10:30:15.123Z"
}
```

## 📊 Logging and Monitoring

### Log Levels
- **INFO**: Successful webhook processing
- **WARN**: Order not found scenarios
- **ERROR**: Processing failures and exceptions
- **DEBUG**: Detailed webhook logging operations

### Log Examples
```
[WebhookService] Processing webhook for order: ORD_1694123456789_001
[WebhookService] Updated existing OrderStatus: 64f8a1b2c3d4e5f6a7b8c9d0
[WebhookService] Webhook processed successfully for order: 64f8a1b2c3d4e5f6a7b8c9d0
[WebhookService] Order not found for webhook: {"order_id":"invalid_id"}
```

## 🔒 Security Considerations

### 1. Public Endpoint
- Webhook endpoint is public (no JWT required)
- Payment gateways need unrestricted access
- Consider IP whitelisting for production

### 2. Input Validation
- Comprehensive DTO validation
- Sanitized error responses
- No sensitive data exposure

### 3. Idempotency
- Handles duplicate webhooks gracefully
- Updates existing OrderStatus records
- Logs all webhook attempts

### 4. Error Handling
- Graceful error handling
- Detailed logging without data exposure
- Always returns 200 OK to prevent retries

## 🚀 Production Considerations

### 1. Webhook Security
- Implement webhook signature verification
- Add IP whitelisting for payment gateway
- Consider rate limiting for webhook endpoint

### 2. Monitoring
- Monitor webhook processing times
- Alert on high error rates
- Track order status update patterns

### 3. Scalability
- Consider async processing for high volume
- Implement webhook queuing if needed
- Monitor database performance

### 4. Reliability
- Implement webhook retry logic
- Add dead letter queue for failed processing
- Monitor webhook delivery success rates

## 🔄 Integration with Payment Gateway

### Webhook Configuration
Configure your payment gateway to send webhooks to:
```
POST https://yourdomain.com/payment/webhook
```

### Expected Events
- Payment success/completion
- Payment failure
- Payment cancellation
- Payment pending/processing updates

This webhook implementation provides a robust foundation for handling payment status updates with comprehensive logging and error handling.