# Edviron - NestJS Payment Gateway API

🚀 A comprehensive NestJS application with MongoDB Atlas integration, JWT authentication, payment processing, and transaction management.

## 🌟 Features

- 🏗️ **NestJS Framework** - Progressive Node.js framework with TypeScript
- 🍃 **MongoDB Atlas** - Cloud database with Mongoose ODM
- 🔐 **JWT Authentication** - Secure authentication with Passport strategies
- 💳 **Payment Gateway** - Edviron payment integration with JWT signing
- 🔗 **Webhook Processing** - Real-time payment status updates
- 📊 **Transaction APIs** - Advanced querying with pagination and sorting
- 🛡️ **Security** - Helmet, CORS, input validation, and rate limiting
- ✅ **Validation** - Comprehensive request validation with class-validator
- 📁 **Clean Architecture** - Well-organized modular structure
- 📚 **API Documentation** - Complete Postman collection included

## 📁 Project Structure

```text
src/
├── config/
│   └── configuration.ts          # Environment configuration
├── decorators/
│   └── public.decorator.ts       # Custom decorators
├── dto/
│   ├── create-user.dto.ts        # User validation DTOs
│   ├── create-payment.dto.ts     # Payment validation DTOs
│   ├── webhook.dto.ts            # Webhook validation DTOs
│   └── transaction-query.dto.ts  # Transaction query DTOs
├── guards/
│   ├── jwt-auth.guard.ts         # JWT authentication guard
│   ├── jwt-auth-enhanced.guard.ts # Enhanced JWT guard with public routes
│   ├── jwt.strategy.ts           # JWT Passport strategy
│   └── local.strategy.ts         # Local Passport strategy
├── middlewares/
│   └── logger.middleware.ts      # HTTP request logging
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts    # Authentication endpoints
│   │   ├── auth.service.ts       # Authentication logic
│   │   └── auth.module.ts        # Auth module configuration
│   ├── user/
│   │   ├── user.controller.ts    # User CRUD endpoints
│   │   ├── user.service.ts       # User business logic
│   │   └── user.module.ts        # User module configuration
│   └── payment/
│       ├── payment.controller.ts # Payment endpoints
│       ├── payment.service.ts    # Payment processing logic
│       ├── webhook.service.ts    # Webhook processing
│       ├── transaction.service.ts # Transaction queries
│       ├── transaction.controller.ts # Transaction endpoints
│       └── payment.module.ts     # Payment module configuration
├── schemas/
│   ├── user.schema.ts            # User MongoDB schema
│   ├── order.schema.ts           # Order MongoDB schema
│   ├── order-status.schema.ts    # OrderStatus MongoDB schema
│   └── webhook-logs.schema.ts    # WebhookLogs MongoDB schema
├── app.controller.ts
├── app.module.ts                 # Main application module
├── app.service.ts
└── main.ts                       # Application entry point
```

## 🔧 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account
- **Postman** (optional, for API testing)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd edviron

# Install dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
## 🔧 Environment Configuration

### Database Configuration

```env

```

### JWT Configuration

```env

# Application Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Payment Gateway Configuration
PAYMENT_API_KEY=your-edviron-api-key
PG_KEY=your-payment-gateway-key
PAYMENT_BASE_URL=https://dev-vanilla.edviron.com

# Security Configuration
BCRYPT_SALT_ROUNDS=10
API_KEY=your-api-key-here
```

### 3. MongoDB Atlas Setup

1. **Create Account**: Visit [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Set up a free tier cluster
3. **Database User**: Create user with read/write permissions
4. **Network Access**: Whitelist your IP (use `0.0.0.0/0` for development)
5. **Connection String**: Copy and update `MONGODB_URI` in `.env`

### 4. Run the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

🎉 **Application will be available at:** `http://localhost:3000`

## 📚 API Documentation

### 🔐 Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User login | ❌ |
| GET | `/auth/profile` | Get user profile | ✅ |

### 👥 User Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users` | Create new user | ❌ |
| GET | `/users` | Get all users | ✅ |
| GET | `/users/:id` | Get user by ID | ✅ |
| DELETE | `/users/:id` | Delete user | ✅ |

### 💳 Payment Processing

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payment/create-payment` | Create payment request | ❌ |
| GET | `/payment/order/:id` | Get order details | ✅ |
| GET | `/payment/orders/school/:schoolId` | Get school orders | ✅ |

### 🔗 Webhook Management

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payment/webhook` | Process payment webhook | ❌ |
| GET | `/payment/webhook-logs` | Get webhook logs | ✅ |
| GET | `/payment/webhook-logs/status/:status` | Get logs by status | ✅ |

### 📊 Transaction APIs

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/transactions` | Get all transactions | ✅ |
| GET | `/transactions/school/:schoolId` | Get school transactions | ✅ |
| GET | `/transaction-status/:customOrderId` | Get transaction status | ✅ |

## 🧪 Usage Examples

### Authentication Flow

```bash
# 1. Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# 2. Login to get JWT token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# 3. Use JWT token for protected routes
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Payment Processing

```bash
# Create payment request
curl -X POST http://localhost:3000/payment/create-payment \
  -H "Content-Type: application/json" \
  -d '{
    "school_id": "school_123",
    "amount": 1000,
    "callback_url": "https://yourapp.com/callback"
  }'

# Simulate webhook (payment gateway callback)
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
    "payment_method": "UPI"
  }'
```

### Transaction Queries

```bash
# Get paginated transactions with sorting
curl -X GET "http://localhost:3000/transactions?page=1&limit=10&sort=payment_time&order=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter transactions by status
curl -X GET "http://localhost:3000/transactions?status=success&payment_mode=UPI" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get school-specific transactions
curl -X GET "http://localhost:3000/transactions/school/school_123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Check transaction status
curl -X GET "http://localhost:3000/transaction-status/ORD_1694123456789_001" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📮 Postman Collection

Import the included Postman collection for easy API testing:

1. Open Postman
2. Click **Import**
3. Select `Edviron-API.postman_collection.json`
4. Update environment variables:
   - `baseUrl`: `http://localhost:3000`
   - `accessToken`: Your JWT token from login

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage report
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

## 🔒 Security Features

- **🛡️ Helmet**: Security headers protection
- **🌐 CORS**: Configurable cross-origin resource sharing
- **🔐 JWT Authentication**: Stateless authentication with configurable expiration
- **🔑 Password Hashing**: bcryptjs with configurable salt rounds
- **✅ Input Validation**: Comprehensive validation using class-validator
- **🚫 Route Protection**: JWT guards on sensitive endpoints
- **📝 Request Logging**: Detailed HTTP request logging
- **🔍 Error Sanitization**: No sensitive data in error responses

## 📊 Environment Variables Reference

### Database Configuration
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

### JWT Configuration
```env
JWT_SECRET=your-secret-key                    # JWT signing secret
JWT_EXPIRES_IN=7d                            # Token expiration time
```

### Application Configuration
```env
PORT=3000                                     # Server port
NODE_ENV=development                          # Environment mode
CORS_ORIGIN=http://localhost:3000            # Allowed CORS origins
```

### Payment Gateway Configuration
```env
PAYMENT_API_KEY=your-edviron-api-key         # Edviron API key
PG_KEY=your-payment-gateway-key              # JWT signing key for payments
PAYMENT_BASE_URL=https://dev-vanilla.edviron.com # Payment gateway URL
```

### Security Configuration
```env
BCRYPT_SALT_ROUNDS=10                        # Password hashing rounds
API_KEY=your-general-api-key                 # General API key
```

## 🚀 Deployment

### Production Checklist

- [ ] Update all environment variables with production values
- [ ] Configure MongoDB Atlas for production
- [ ] Update JWT secrets and API keys
- [ ] Configure CORS for your production domain
- [ ] Set up proper logging and monitoring
- [ ] Enable SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Set up backup strategies

### Docker Deployment (Optional)

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📖 Additional Documentation

- [JWT Authentication Guide](JWT-AUTH.md)
- [Payment API Documentation](PAYMENT-API.md)
- [Webhook Implementation](WEBHOOK-API.md)
- [Transaction APIs](TRANSACTION-API.md)
- [Database Schemas](SCHEMAS.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is [MIT licensed](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation files](./)
2. Review the [Postman collection](Edviron-API.postman_collection.json)
3. Create an issue in the repository

---

## 💝 Built with

**Built with ❤️ using NestJS, MongoDB, and TypeScript**
