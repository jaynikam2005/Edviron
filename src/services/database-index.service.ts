import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Logger } from '@nestjs/common';

@Injectable()
export class DatabaseIndexService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseIndexService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    await this.createIndexes();
  }

  private async createIndexes() {
    try {
      const db = this.connection.db;
      if (!db) {
        this.logger.error('Database connection is not available');
        return;
      }

      // Order collection indexes
      await db
        .collection('orders')
        .createIndex(
          { custom_order_id: 1 },
          { unique: true, background: true },
        );
      await db
        .collection('orders')
        .createIndex({ school_id: 1, createdAt: -1 }, { background: true });
      await db
        .collection('orders')
        .createIndex({ trustee_id: 1, createdAt: -1 }, { background: true });
      await db
        .collection('orders')
        .createIndex({ gateway_name: 1 }, { background: true });

      // OrderStatus collection indexes
      await db
        .collection('orderstatuses')
        .createIndex({ collect_id: 1 }, { unique: true, background: true });
      await db
        .collection('orderstatuses')
        .createIndex({ status: 1, payment_time: -1 }, { background: true });
      await db
        .collection('orderstatuses')
        .createIndex({ order_amount: 1 }, { background: true });
      await db
        .collection('orderstatuses')
        .createIndex({ payment_time: -1 }, { background: true });
      await db
        .collection('orderstatuses')
        .createIndex({ createdAt: -1 }, { background: true });

      // User collection indexes
      await db
        .collection('users')
        .createIndex({ email: 1 }, { unique: true, background: true });
      await db
        .collection('users')
        .createIndex({ role: 1 }, { background: true });
      await db
        .collection('users')
        .createIndex({ lastLogin: -1 }, { background: true });

      // RefreshToken collection indexes
      await db
        .collection('refreshtokens')
        .createIndex({ token: 1 }, { unique: true, background: true });
      await db
        .collection('refreshtokens')
        .createIndex({ user_id: 1 }, { background: true });
      await db
        .collection('refreshtokens')
        .createIndex(
          { expires_at: 1 },
          { expireAfterSeconds: 0, background: true },
        );
      await db
        .collection('refreshtokens')
        .createIndex({ is_revoked: 1, createdAt: -1 }, { background: true });

      // WebhookLogs collection indexes
      await db
        .collection('webhooklogs')
        .createIndex({ event_type: 1, createdAt: -1 }, { background: true });
      await db
        .collection('webhooklogs')
        .createIndex({ 'payload.order_id': 1 }, { background: true });
      await db
        .collection('webhooklogs')
        .createIndex({ status: 1 }, { background: true });
      await db
        .collection('webhooklogs')
        .createIndex({ createdAt: -1 }, { background: true });

      // Compound indexes for common queries
      await db
        .collection('orderstatuses')
        .createIndex(
          { status: 1, payment_time: -1, order_amount: -1 },
          { background: true },
        );

      await db
        .collection('orders')
        .createIndex(
          { school_id: 1, gateway_name: 1, createdAt: -1 },
          { background: true },
        );

      this.logger.log('Database indexes created successfully');
    } catch (error) {
      this.logger.error('Failed to create database indexes:', error);
    }
  }

  async getIndexInfo(collection: string) {
    try {
      const db = this.connection.db;
      if (!db) {
        this.logger.error('Database connection is not available');
        return [];
      }
      const indexes = await db.collection(collection).indexes();
      return indexes;
    } catch (error) {
      this.logger.error(`Failed to get index info for ${collection}:`, error);
      return [];
    }
  }

  async analyzeQueryPerformance(collection: string, pipeline: any[]) {
    try {
      const db = this.connection.db;
      if (!db) {
        this.logger.error('Database connection is not available');
        return null;
      }
      const result = await db
        .collection(collection)
        .aggregate([...pipeline, { $explain: { verbosity: 'executionStats' } }])
        .toArray();

      return result;
    } catch (error) {
      this.logger.error('Failed to analyze query performance:', error);
      return null;
    }
  }
}
