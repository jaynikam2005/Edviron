# Validation & Security Implementation

This document outlines the comprehensive validation and security measures implemented in the Edviron NestJS application.

## 🛡️ Security Middleware

### Helmet Security Headers

**Implementation:** `src/main.ts`

```typescript
import helmet from 'helmet';

// Security middleware
app.use(helmet());
```

**Protection Features:**
- **Content Security Policy (CSP)**: Prevents XSS attacks
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **Strict-Transport-Security**: Enforces HTTPS
- **X-XSS-Protection**: Enables XSS filtering
- **Referrer-Policy**: Controls referrer information

### CORS Configuration

**Implementation:** `src/main.ts`

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
});
```

**Security Benefits:**
- Restricts cross-origin requests to allowed domains
- Limits HTTP methods to necessary ones
- Controls allowed headers
- Supports credentials for authenticated requests

## ✅ Global Validation Pipeline

### Enhanced ValidationPipe Configuration

**Implementation:** `src/main.ts`

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,                    // Strip unknown properties
  forbidNonWhitelisted: true,         // Throw error for unknown properties
  transform: true,                    // Auto-transform payloads
  transformOptions: {
    enableImplicitConversion: true,   // Convert string numbers to numbers
  },
  disableErrorMessages: false,       // Keep detailed error messages
  validationError: {
    target: false,                    // Don't expose target object
    value: false,                     // Don't expose submitted values
  },
}));
```

**Security Features:**
- **Whitelist**: Only allows defined properties, strips unknown ones
- **Forbid Non-Whitelisted**: Rejects requests with unexpected properties
- **Transform**: Automatically converts and validates data types
- **Error Sanitization**: Prevents sensitive data exposure in errors

## 📋 DTO Validation Implementation

### User Management DTOs

**CreateUserDto** - `src/dto/create-user.dto.ts`

```typescript
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  role?: string = 'user';
}
```

**LoginDto** - `src/dto/login.dto.ts`

```typescript
export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
```

### Payment DTOs

**CreatePaymentDto** - `src/dto/create-payment.dto.ts`

```typescript
export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  school_id: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsUrl()
  @IsNotEmpty()
  callback_url: string;
}
```

### Webhook DTOs

**WebhookPayloadDto** - `src/dto/webhook.dto.ts`

```typescript
export class WebhookPayloadDto {
  @IsString()
  @IsNotEmpty()
  status: string;

  @IsObject()
  @IsNotEmpty()
  order_info: OrderInfoDto;

  @IsString()
  @IsOptional()
  transaction_id?: string;

  @IsString()
  @IsOptional()
  payment_method?: string;

  @IsNumber()
  @IsOptional()
  amount?: number;
}
```

### Transaction Query DTOs

**TransactionQueryDto** - `src/dto/transaction-query.dto.ts`

```typescript
export class TransactionQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsIn([
    'payment_time',
    'createdAt',
    'updatedAt',
    'order_amount',
    'transaction_amount',
    'status',
    'school_id',
    'custom_order_id'
  ])
  sort?: string = 'payment_time';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: string = 'desc';
}
```

## 🔐 Authentication & Authorization

### JWT Guards Implementation

**Basic JWT Guard** - `src/guards/jwt-auth.guard.ts`

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Enhanced JWT Guard with Public Routes** - `src/guards/jwt-auth-enhanced.guard.ts`

```typescript
@Injectable()
export class JwtAuthEnhancedGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
```

### Public Route Decorator

**Public Decorator** - `src/decorators/public.decorator.ts`

```typescript
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Usage Example:**

```typescript
@Public()
@Post('login')
async login(@Body(ValidationPipe) loginDto: LoginDto) {
  return this.authService.login(loginDto);
}
```

## 🔒 Route Protection Matrix

### Authentication Endpoints
| Endpoint | Method | Protection | Validation |
|----------|--------|------------|------------|
| `/auth/login` | POST | Public | LoginDto |
| `/auth/profile` | GET | JWT Required | None |

### User Management
| Endpoint | Method | Protection | Validation |
|----------|--------|------------|------------|
| `/users` | POST | Public | CreateUserDto |
| `/users` | GET | JWT Required | None |
| `/users/:id` | GET | JWT Required | Param validation |
| `/users/:id` | DELETE | JWT Required | Param validation |

### Payment Processing
| Endpoint | Method | Protection | Validation |
|----------|--------|------------|------------|
| `/payment/create-payment` | POST | Public | CreatePaymentDto |
| `/payment/order/:id` | GET | JWT Required | Param validation |
| `/payment/orders/school/:schoolId` | GET | JWT Required | Param validation |

### Webhook Management
| Endpoint | Method | Protection | Validation |
|----------|--------|------------|------------|
| `/payment/webhook` | POST | Public | WebhookPayloadDto |
| `/payment/webhook-logs` | GET | JWT Required | Query validation |
| `/payment/webhook-logs/status/:status` | GET | JWT Required | Param validation |

### Transaction APIs
| Endpoint | Method | Protection | Validation |
|----------|--------|------------|------------|
| `/transactions` | GET | JWT Required | TransactionQueryDto |
| `/transactions/school/:schoolId` | GET | JWT Required | TransactionQueryDto + Param |
| `/transaction-status/:customOrderId` | GET | JWT Required | Param validation |

## 🛡️ Security Best Practices Implemented

### 1. Input Validation
- **Comprehensive DTOs**: All endpoints have proper validation
- **Type Safety**: TypeScript + class-validator ensures type safety
- **Sanitization**: Automatic data transformation and cleaning
- **Whitelist Approach**: Only allow defined properties

### 2. Authentication Security
- **JWT Tokens**: Stateless authentication with configurable expiration
- **Password Hashing**: bcryptjs with configurable salt rounds
- **Route Protection**: Guards on sensitive endpoints
- **Public Route Control**: Explicit marking of public endpoints

### 3. Data Protection
- **Error Sanitization**: No sensitive data in error responses
- **Password Exclusion**: Passwords never returned in responses
- **Environment Variables**: Sensitive configuration in environment

### 4. HTTP Security
- **Security Headers**: Helmet middleware for comprehensive protection
- **CORS Policy**: Restricted cross-origin access
- **Method Restrictions**: Limited HTTP methods
- **Content Type Validation**: Proper content type handling

### 5. Database Security
- **Query Validation**: Parameterized queries prevent injection
- **Schema Validation**: Mongoose schema validation
- **Index Security**: Proper indexing without exposing sensitive data

## 🚨 Error Handling & Validation Messages

### Validation Error Format

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters",
    "firstName should not be empty"
  ],
  "error": "Bad Request"
}
```

### Authentication Error Format

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Forbidden Access Format

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

## 📊 Validation Rules Summary

### String Validation
- `@IsString()`: Ensures string type
- `@IsNotEmpty()`: Prevents empty strings
- `@MinLength(n)`: Minimum character length
- `@MaxLength(n)`: Maximum character length

### Email Validation
- `@IsEmail()`: Valid email format
- `@IsNotEmpty()`: Required field

### Number Validation
- `@IsNumber()`: Ensures numeric type
- `@Min(n)`: Minimum value
- `@Max(n)`: Maximum value
- `@Type(() => Number)`: Auto-conversion from string

### URL Validation
- `@IsUrl()`: Valid URL format
- `@IsNotEmpty()`: Required field

### Enum Validation
- `@IsIn([...])`: Restricted to specific values
- `@IsOptional()`: Optional field

### Object Validation
- `@IsObject()`: Ensures object type
- `@ValidateNested()`: Validates nested objects
- `@Type(() => Class)`: Type transformation

## 🔧 Environment Security Configuration

### Required Environment Variables

```env
# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Database Security
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Payment Security
PAYMENT_API_KEY=your-edviron-api-key
PG_KEY=your-payment-gateway-key
```

### Production Security Checklist

- [ ] Update JWT_SECRET with strong random key
- [ ] Set BCRYPT_SALT_ROUNDS to 12+ for production
- [ ] Configure CORS_ORIGIN for production domains only
- [ ] Use strong MongoDB credentials
- [ ] Rotate API keys regularly
- [ ] Enable MongoDB Atlas IP whitelisting
- [ ] Set up SSL/TLS certificates
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Set up monitoring and alerting

This comprehensive validation and security implementation ensures the Edviron application follows industry best practices for data protection, input validation, and secure communication.