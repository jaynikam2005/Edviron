# Mongoose Schemas and Models Documentation

This document outlines all the Mongoose schemas created for the Edviron project with their fields, relationships, and indexing.

## 📋 Schema Overview

### 1. Order Schema
**File:** `src/schemas/order.schema.ts`

```typescript
Order {
  school_id: string (required, indexed)
  trustee_id: string (required)
  student_info: {
    name: string (required)
    id: string (required)
    email: string (required)
  }
  gateway_name: string (required)
  custom_order_id: string (unique, indexed)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `school_id: 1`
- `custom_order_id: 1`

---

### 2. OrderStatus Schema
**File:** `src/schemas/order-status.schema.ts`

```typescript
OrderStatus {
  collect_id: ObjectId (ref: 'Order', required, indexed)
  order_amount: number (required)
  transaction_amount: number (required)
  payment_mode: string (required)
  payment_details: Object (optional)
  bank_reference: string (optional)
  payment_message: string (optional)
  status: enum ['pending', 'success', 'failed', 'cancelled'] (default: 'pending')
  error_message: string (optional)
  payment_time: Date (optional)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `collect_id: 1`
- `status: 1`
- `payment_time: 1`

---

### 3. WebhookLogs Schema
**File:** `src/schemas/webhook-logs.schema.ts`

```typescript
WebhookLogs {
  raw_payload: Object (required)
  timestamp: Date (required, default: Date.now)
  webhook_source: string (optional)
  event_type: string (optional)
  processing_status: string (default: 'received')
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `timestamp: -1` (descending for recent logs first)
- `webhook_source: 1`
- `event_type: 1`
- `processing_status: 1`

---

### 4. User Schema (Updated)
**File:** `src/schemas/user.schema.ts`

```typescript
User {
  username: string (required, unique, indexed)
  email: string (required, unique)
  password: string (required, bcrypt hashed)
  firstName: string (required)
  lastName: string (required)
  role: string (default: 'user')
  isActive: boolean (default: true)
  lastLogin: Date (optional)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `username: 1`
- `email: 1`
- `role: 1`
- `isActive: 1`

---

## 🔗 Relationships

### OrderStatus → Order
- `OrderStatus.collect_id` references `Order._id`
- One-to-many relationship (one order can have multiple status updates)

---

## 📊 Index Strategy

### Performance Indexes
1. **school_id** - Fast queries by school
2. **custom_order_id** - Unique order identification
3. **collect_id** - Fast order status lookups
4. **username/email** - Fast user authentication
5. **timestamp** - Efficient webhook log retrieval

### Query Optimization
- Compound indexes can be added based on common query patterns
- Consider adding indexes on frequently filtered fields
- Monitor query performance and adjust indexes accordingly

---

## 📝 Data Transfer Objects (DTOs)

Corresponding DTOs have been created for validation:

- `CreateOrderDto` - Order creation validation
- `CreateOrderStatusDto` - Order status validation
- `CreateWebhookLogsDto` - Webhook logging validation
- `CreateUserDto` - User creation validation (updated with username)

---

## 🔒 Security Considerations

1. **Password Hashing**: User passwords are hashed using bcrypt
2. **Unique Constraints**: Prevent duplicate users and orders
3. **Validation**: All inputs validated through DTOs
4. **Indexing**: Optimized for performance without exposing sensitive data

---

## 🚀 Usage Examples

### Creating an Order
```typescript
const order = new Order({
  school_id: 'school_123',
  trustee_id: 'trustee_456',
  student_info: {
    name: 'John Doe',
    id: 'student_789',
    email: 'john.doe@example.com'
  },
  gateway_name: 'razorpay',
  custom_order_id: 'ORD_001'
});
```

### Updating Order Status
```typescript
const orderStatus = new OrderStatus({
  collect_id: order._id,
  order_amount: 1000,
  transaction_amount: 1000,
  payment_mode: 'UPI',
  status: 'success',
  payment_time: new Date()
});
```

### Logging Webhooks
```typescript
const webhookLog = new WebhookLogs({
  raw_payload: req.body,
  webhook_source: 'razorpay',
  event_type: 'payment.captured'
});
```