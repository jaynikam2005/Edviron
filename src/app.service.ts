import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return JSON.stringify({
      message: 'Welcome to Edviron API! 🚀',
      version: '1.0.0',
      description: 'NestJS Payment Gateway API',
      endpoints: {
        health: '/health',
        api: '/api',
        auth: '/auth/*',
        users: '/users/*',
        payment: '/payment/*',
        transactions: '/transactions/*'
      },
      documentation: 'Visit /api for detailed endpoint information',
      status: 'active'
    }, null, 2);
  }
}