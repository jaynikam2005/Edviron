# 🚨 CRITICAL FIXES REQUIRED

## 1. ORDER SCHEMA MISMATCH - CRITICAL ❌

**Issue**: Order schema doesn't match requirements
**Current**: Contains payment fields that should only be in OrderStatus
**Required**: Only (school_id, trustee_id, student_info, gateway_name)

### Fix Required:
```typescript
// src/schemas/order.schema.ts - MUST UPDATE
@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  school_id: string;

  @Prop({ required: true })
  trustee_id: string;

  @Prop({ required: true, type: Object })
  student_info: {
    name: string;
    id: string;
    email: string;
    class?: string;
    section?: string;
  };

  @Prop({ required: true })
  gateway_name: string;

  @Prop({ required: true, unique: true })
  custom_order_id: string;

  // REMOVE: order_amount, transaction_amount, payment_mode, status, payment_time
  // These belong in OrderStatus only
}
```

## 2. MISSING REFRESH TOKEN IMPLEMENTATION - CRITICAL ❌

**Issue**: JWT implementation lacks refresh token mechanism
**Security Risk**: No way to renew expired tokens securely

### Fix Required:
```typescript
// src/modules/auth/auth.service.ts - ADD REFRESH TOKEN SUPPORT
async refreshToken(refreshToken: string) {
  try {
    const payload = this.jwtService.verify(refreshToken);
    const user = await this.userService.findOne(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newTokens = await this.generateTokens(user);
    return newTokens;
  } catch (error) {
    throw new UnauthorizedException('Invalid refresh token');
  }
}

private async generateTokens(user: any) {
  const payload = { email: user.email, sub: user._id, role: user.role };
  
  const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
  const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
  
  return { accessToken, refreshToken };
}
```

## 3. DEPLOYMENT SETUP MISSING - CRITICAL ❌

**Issue**: No deployment configuration for Netlify/Vercel
**Required**: Frontend must be deployed and accessible

### Fix Required:
Create `netlify.toml` or `vercel.json`:

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 4. API ROUTE MISMATCH - CRITICAL ❌

**Issue**: API routes don't match requirements
**Current**: `/transaction-status/:customOrderId`
**Required**: `/transaction-status/:custom_order_id`

### Fix Required:
```typescript
// Update all route definitions to match spec exactly
@Get('/transactions')           // ✅ Correct
@Get('/transactions/school/:schoolId')  // ✅ Correct  
@Get('/transaction-status/:custom_order_id')  // ❌ MUST FIX
```