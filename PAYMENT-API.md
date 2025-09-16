# Payment API Implementation

This document describes the payment integration with Edviron's Create Collect Request API.

## 🚀 Overview

The payment system integrates with Edviron's payment gateway to create collect requests and manage payment orders. It includes JWT signing, external API integration, and MongoDB storage.

## 📁 Implementation Structure

```
src/
├── modules/
│   └── payment/
│       ├── payment.controller.ts    # Payment API endpoints
│       ├── payment.service.ts       # Payment business logic
│       └── payment.module.ts        # Payment module configuration
├── dto/
│   └── create-payment.dto.ts        # Payment validation DTOs
└── config/
    └── configuration.ts             # Payment gateway configuration
```

## 🔧 Configuration

### Environment Variables
Add these to your `.env` file:

```env
# Payment Gateway Configuration
PAYMENT_API_KEY=your-edviron-api-key
PG_KEY=your-payment-gateway-key
PAYMENT_BASE_URL=https://dev-vanilla.edviron.com
```

### Configuration Object
```typescript
payment: {
  apiKey: process.env.PAYMENT_API_KEY,
  pgKey: process.env.PG_KEY,
  baseUrl: process.env.PAYMENT_BASE_URL,
}
```

## 🌐 API Endpoints

### 1. Create Payment (Public)

**Endpoint:** `POST /payment/create-payment`

**Description:** Creates a payment request, generates signed JWT, calls Edviron API, and stores order in MongoDB.

**Request Body:**
```json
{
  "school_id": "school_123",
  "amount": 1000,
  "callback_url": "https://yourapp.com/payment/callback"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment request created successfully",
  "order_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "payment_link": "https://dev-vanilla.edviron.com/collect/abc123",
  "collect_request_url": "https://dev-vanilla.edviron.com/collect/abc123"
}
```

**Validation Rules:**
- `school_id`: Required string
- `amount`: Required number, minimum 1
- `callback_url`: Required valid URL

### 2. Get Order by ID (Protected)

**Endpoint:** `GET /payment/order/:id`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
  "school_id": "school_123",
  "trustee_id": "system",
  "student_info": {
    "name": "API Payment",
    "id": "api_payment",
    "email": "payment@system.com"
  },
  "gateway_name": "edviron",
  "custom_order_id": "ORD_1694123456789_001",
  "createdAt": "2023-09-08T10:30:00.000Z",
  "updatedAt": "2023-09-08T10:30:00.000Z"
}
```

### 3. Get Orders by School (Protected)

**Endpoint:** `GET /payment/orders/school/:schoolId`

**Headers:** `Authorization: Bearer <JWT_TOKEN>`

**Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "school_id": "school_123",
    "custom_order_id": "ORD_1694123456789_001",
    "createdAt": "2023-09-08T10:30:00.000Z"
  }
]
```

## 🔐 JWT Signing Process

### JWT Payload Structure
```json
{
  "school_id": "school_123",
  "amount": 1000,
  "callback_url": "https://yourapp.com/callback",
  "order_id": "ORD_1694123456789_001",
  "timestamp": 1694123456789,
  "iat": 1694123456,
  "exp": 1694127056
}
```

### Signing Process
1. Create payload with request data and generated order ID
2. Add timestamp for uniqueness
3. Sign with `PG_KEY` using HS256 algorithm
4. Set 1-hour expiration

```typescript
const signedToken = jwt.sign(jwtPayload, pgKey, { expiresIn: '1h' });
```

## 🌍 External API Integration

### Edviron Create Collect Request API

**URL:** `https://dev-vanilla.edviron.com/erp/create-collect-request`

**Method:** `POST`

**Headers:**
```
Authorization: Bearer <PAYMENT_API_KEY>
Content-Type: application/json
```

**Request Body:**
```json
{
  "signed_payload": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "school_id": "school_123",
  "amount": 1000,
  "callback_url": "https://yourapp.com/callback"
}
```

**Expected Response:**
```json
{
  "collect_request_url": "https://dev-vanilla.edviron.com/collect/abc123",
  "status": "success",
  "message": "Collect request created successfully"
}
```

## 💾 MongoDB Storage

### Order Document Structure
```typescript
{
  school_id: string,           // From request
  trustee_id: 'system',        // Default for API payments
  student_info: {
    name: 'API Payment',       // Default values
    id: 'api_payment',
    email: 'payment@system.com'
  },
  gateway_name: 'edviron',     // Payment gateway identifier
  custom_order_id: string,     // Generated unique ID
  createdAt: Date,             // Auto-generated
  updatedAt: Date              // Auto-generated
}
```

### Order ID Generation
```typescript
private generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD_${timestamp}_${random}`;
}
```

## 🧪 Testing Examples

### 1. Create Payment Request
```bash
curl -X POST http://localhost:3000/payment/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "school_id": "school_123",
    "amount": 1000,
    "callback_url": "https://yourapp.com/payment/callback"
  }'
```

### 2. Get Order Details
```bash
curl -X GET http://localhost:3000/payment/order/ORDER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get School Orders
```bash
curl -X GET http://localhost:3000/payment/orders/school/school_123 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚨 Error Handling

### Configuration Errors
```json
{
  "statusCode": 500,
  "message": "Payment gateway key not configured"
}
```

### API Errors
```json
{
  "statusCode": 502,
  "message": "Payment gateway error: Invalid request"
}
```

### Validation Errors
```json
{
  "statusCode": 400,
  "message": [
    "amount must not be less than 1",
    "callback_url must be a URL address"
  ],
  "error": "Bad Request"
}
```

### Order Not Found
```json
{
  "statusCode": 404,
  "message": "Order not found"
}
```

## 🔒 Security Features

1. **JWT Signing**: All payloads signed with secure PG_KEY
2. **API Authentication**: Bearer token authentication for external API
3. **Input Validation**: Comprehensive validation using DTOs
4. **Route Protection**: Order retrieval endpoints protected with JWT
5. **Error Sanitization**: Sensitive information not exposed in errors
6. **Timeout Protection**: 30-second timeout for external API calls

## 📊 Logging

The service includes comprehensive logging:

```typescript
// API Response logging
this.logger.log(`API Response Status: ${apiResponse.status}`);
this.logger.log(`API Response Data: ${JSON.stringify(apiResponse.data)}`);

// Order creation logging
this.logger.log(`Order saved with ID: ${savedOrder._id}`);

// Error logging
this.logger.error('Error creating payment:', error);
```

## 🔄 Integration Flow

1. **Client Request** → `POST /payment/create-payment`
2. **Validation** → DTO validation of input parameters
3. **Order ID Generation** → Unique order identifier creation
4. **JWT Creation** → Signed payload with PG_KEY
5. **External API Call** → Edviron Create Collect Request API
6. **MongoDB Storage** → Order document creation
7. **Response** → Payment link and order details

## 🚀 Production Considerations

1. **Environment Variables**: Ensure all payment keys are securely configured
2. **API Rate Limiting**: Implement rate limiting for payment endpoints
3. **Webhook Handling**: Set up webhook endpoints for payment status updates
4. **Monitoring**: Monitor external API response times and error rates
5. **Backup Strategy**: Ensure order data is properly backed up
6. **SSL/TLS**: Use HTTPS for all payment-related communications

This payment API provides a robust foundation for integrating with Edviron's payment gateway while maintaining security and reliability standards.