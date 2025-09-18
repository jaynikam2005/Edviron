import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use IP address and user ID (if available) for tracking
    const userId = req.user?.id;
    const ip = req.ip || req.connection.remoteAddress;

    return userId ? `${userId}-${ip}` : ip;
  }

  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Skip throttling for admin users
    if (request.user?.role === 'admin') {
      return true;
    }

    // Skip for health check endpoints
    const url = request.url;
    if (url.includes('/health') || url.includes('/status')) {
      return true;
    }

    return false;
  }

  protected async getErrorMessage(
    context: ExecutionContext,
    throttlerLimitDetail: { limit: number; ttl: number },
  ): Promise<string> {
    const { limit, ttl } = throttlerLimitDetail;
    return `Rate limit exceeded. Maximum ${limit} requests allowed within ${Math.ceil(ttl / 1000)} seconds. Please try again later.`;
  }
}
