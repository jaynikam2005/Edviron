# JWT Authentication Implementation Guide

This document explains the JWT-based authentication system implemented in the Edviron NestJS project.

## 🔐 Authentication Overview

The project implements a complete JWT authentication system with:
- User login with JWT token generation
- Protected routes using JWT guards
- Public route decorator for bypassing authentication
- Middleware for request logging
- Password hashing with bcrypt

## 📁 Authentication Files Structure

```
src/
├── guards/
│   ├── jwt-auth.guard.ts           # Basic JWT guard
│   ├── jwt-auth-enhanced.guard.ts   # Enhanced guard with public route support
│   ├── jwt.strategy.ts              # JWT Passport strategy
│   ├── local-auth.guard.ts          # Local authentication guard
│   └── local.strategy.ts            # Local Passport strategy
├── decorators/
│   └── public.decorator.ts          # Decorator for public routes
├── modules/
│   └── auth/
│       ├── auth.controller.ts       # Authentication endpoints
│       ├── auth.service.ts          # Authentication logic
│       └── auth.module.ts           # Auth module configuration
└── dto/
    └── login.dto.ts                 # Login validation DTO
```

## 🚀 API Endpoints

### Authentication Routes

#### 1. Login (Public)
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

#### 2. Get Profile (Protected)
```http
GET /auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "message": "This is a protected route",
  "user": {
    "userId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### User Routes

#### 1. Create User (Public)
```http
POST /users
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### 2. Get All Users (Protected)
```http
GET /users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3. Get User by ID (Protected)
```http
GET /users/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 4. Delete User (Protected)
```http
DELETE /users/:id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🛡️ Guards and Strategies

### JWT Strategy
```typescript
// Extracts JWT from Authorization header
// Validates token using secret from config
// Returns user payload: { userId, email, role }
```

### JWT Auth Guard
```typescript
// Protects routes requiring authentication
// Usage: @UseGuards(JwtAuthGuard)
```

### Enhanced JWT Guard
```typescript
// Supports @Public() decorator
// Allows bypassing authentication for specific routes
// Can be used as global guard
```

### Public Decorator
```typescript
// Marks routes as public (no authentication required)
// Usage: @Public()
```

## 🔧 Implementation Examples

### Protecting a Route
```typescript
@Controller('protected')
export class ProtectedController {
  @UseGuards(JwtAuthGuard)
  @Get('data')
  getProtectedData(@Request() req) {
    // req.user contains: { userId, email, role }
    return { data: 'This is protected', user: req.user };
  }
}
```

### Making a Route Public
```typescript
@Controller('public')
export class PublicController {
  @Public()
  @Get('info')
  getPublicInfo() {
    return { message: 'This is public information' };
  }
}
```

### Global JWT Guard Setup (Optional)
```typescript
// In app.module.ts
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthEnhancedGuard } from './guards/jwt-auth-enhanced.guard';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthEnhancedGuard,
    },
  ],
})
export class AppModule {}
```

## 🔑 JWT Token Structure

### Payload
```json
{
  "email": "user@example.com",
  "sub": "64f8a1b2c3d4e5f6a7b8c9d0",
  "role": "user",
  "iat": 1694123456,
  "exp": 1694727256
}
```

### Configuration
- **Secret**: Configured via `JWT_SECRET` environment variable
- **Expiration**: Configured via `JWT_EXPIRES_IN` environment variable (default: 7d)
- **Algorithm**: HS256

## 🧪 Testing Authentication

### 1. Register a User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Login and Get Token
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Access Protected Route
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Access Protected User Routes
```bash
# Get all users
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get specific user
curl -X GET http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔒 Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **JWT Expiration**: Tokens have configurable expiration times
3. **Secret Management**: JWT secret stored in environment variables
4. **Input Validation**: All inputs validated using DTOs and class-validator
5. **Error Handling**: Proper error responses for authentication failures

## 🚨 Error Responses

### Invalid Credentials
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Missing/Invalid Token
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Expired Token
```json
{
  "statusCode": 401,
  "message": "jwt expired"
}
```

## 📝 Best Practices

1. **Always use HTTPS** in production
2. **Store JWT secret securely** and rotate regularly
3. **Set appropriate token expiration** times
4. **Validate all inputs** using DTOs
5. **Handle errors gracefully** without exposing sensitive information
6. **Use refresh tokens** for long-lived applications
7. **Implement rate limiting** for authentication endpoints
8. **Log authentication events** for security monitoring

## 🔄 Token Refresh (Future Enhancement)

For production applications, consider implementing refresh tokens:

```typescript
// Example refresh token endpoint
@Post('refresh')
async refreshToken(@Body() refreshDto: RefreshTokenDto) {
  // Validate refresh token
  // Generate new access token
  // Return new token pair
}
```

This JWT authentication system provides a solid foundation for securing your NestJS application with industry-standard practices.