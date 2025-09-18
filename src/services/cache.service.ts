import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CacheItem<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly cache = new Map<string, CacheItem<any>>();
  private readonly defaultTtl: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(private readonly configService: ConfigService) {
    this.defaultTtl = this.configService.get<number>(
      'cache.defaultTtl',
      300000,
    ); // 5 minutes
    this.startCleanupInterval();
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const actualTtl = ttl || this.defaultTtl;

    const item: CacheItem<T> = {
      data,
      expiresAt: now + actualTtl,
      createdAt: now,
    };

    this.cache.set(key, item);
    this.logger.debug(`Cache SET: ${key} (TTL: ${actualTtl}ms)`);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      this.logger.debug(`Cache MISS: ${key}`);
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.logger.debug(`Cache EXPIRED: ${key}`);
      return null;
    }

    this.logger.debug(`Cache HIT: ${key}`);
    return item.data;
  }

  del(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache DELETE: ${key}`);
    }
    return deleted;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.logger.log(`Cache cleared. Removed ${size} items.`);
  }

  size(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  // Get or set pattern
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }

  // Invalidate by pattern
  invalidateByPattern(pattern: string): number {
    const regex = new RegExp(pattern);
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        count++;
      }
    }

    this.logger.log(
      `Invalidated ${count} cache entries matching pattern: ${pattern}`,
    );
    return count;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let validItems = 0;
    let expiredItems = 0;
    const items = Array.from(this.cache.values());

    items.forEach((item) => {
      if (now > item.expiresAt) {
        expiredItems++;
      } else {
        validItems++;
      }
    });

    return {
      totalItems: this.cache.size,
      validItems,
      expiredItems,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private startCleanupInterval(): void {
    // Clean up expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 300000);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      this.cache.delete(key);
    });

    if (keysToDelete.length > 0) {
      this.logger.log(
        `Cleaned up ${keysToDelete.length} expired cache entries`,
      );
    }
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage
    let size = 0;
    for (const [key, value] of this.cache.entries()) {
      size += key.length * 2; // String characters are 2 bytes each
      size += JSON.stringify(value).length * 2; // Rough estimate
    }
    return size;
  }

  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Cache decorators
export function Cacheable(ttl?: number) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService: CacheService = this.cacheService;
      if (!cacheService) {
        return method.apply(this, args);
      }

      const cacheKey = `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;

      return await cacheService.getOrSet(
        cacheKey,
        () => method.apply(this, args),
        ttl,
      );
    };

    return descriptor;
  };
}

export function CacheEvict(pattern?: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);

      const cacheService: CacheService = this.cacheService;
      if (cacheService) {
        const invalidationPattern = pattern || `${target.constructor.name}:`;
        cacheService.invalidateByPattern(invalidationPattern);
      }

      return result;
    };

    return descriptor;
  };
}
