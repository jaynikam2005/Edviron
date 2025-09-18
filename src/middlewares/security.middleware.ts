import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize input to prevent NoSQL injection
    this.sanitizeInput(req.body);
    this.sanitizeInput(req.query);
    this.sanitizeInput(req.params);

    // Add security headers using helmet
    const helmetMiddleware = helmet();
    helmetMiddleware(req, res, () => {
      // Set additional security headers
      res.setHeader('X-Request-ID', this.generateRequestId());
      res.setHeader('X-API-Version', '1.0');
      next();
    });
  }

  private sanitizeInput(obj: any): void {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'string') {
          // Remove potential NoSQL injection patterns
          obj[key] = obj[key]
            .replace(/\$[\w]+/g, '') // Remove MongoDB operators
            .replace(/[<>]/g, '') // Remove HTML tags
            .trim();
        } else if (typeof obj[key] === 'object') {
          // Recursively sanitize nested objects
          this.sanitizeInput(obj[key]);
        }
      });
    }
  }

  private generateRequestId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}

// Rate limiting configuration
export const createRateLimiter = (windowMs: number, max: number) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Too many requests, please try again later.`,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Different rate limits for different endpoints
export const rateLimiters = {
  // General API rate limit
  general: createRateLimiter(15 * 60 * 1000, 100), // 100 requests per 15 minutes

  // Authentication endpoints
  auth: createRateLimiter(15 * 60 * 1000, 10), // 10 requests per 15 minutes

  // Payment endpoints (more restrictive)
  payment: createRateLimiter(60 * 1000, 10), // 10 requests per minute

  // Webhook endpoints
  webhook: createRateLimiter(60 * 1000, 50), // 50 requests per minute
};
