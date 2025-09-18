import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      database: 'connected',
      services: {
        api: 'running',
        database: 'connected',
        auth: 'active',
      },
    };
  }

  @Get('api')
  getApiInfo() {
    return {
      name: 'Edviron API',
      version: '1.0.0',
      description: 'NestJS Payment Gateway API for Edviron',
      endpoints: {
        auth: {
          login: 'POST /auth/login',
          profile: 'GET /auth/profile',
          'login-guard': 'POST /auth/login-guard',
        },
        users: {
          create: 'POST /users',
          findAll: 'GET /users',
          findOne: 'GET /users/:id',
          update: 'PATCH /users/:id',
          remove: 'DELETE /users/:id',
        },
        payment: {
          create: 'POST /payment/create',
          status: 'GET /payment/status/:id',
        },
        transactions: {
          getAll: 'GET /transactions',
          getBySchool: 'GET /transactions/school/:schoolId',
          getStatus: 'GET /transactions/status/:orderId',
        },
      },
      health: '/health',
      documentation: '/api',
    };
  }
}
