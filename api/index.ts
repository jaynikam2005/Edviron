import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    app.get(ConfigService);

    app.enableCors({
      origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        /https:\/\/.*\.vercel\.app$/,
        process.env.FRONTEND_URL || 'http://localhost:5173'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    });

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    app.setGlobalPrefix('api');

    await app.init();
  }
  return app;
}

export default async function handler(req: Request, res: Response) {
  const app = await bootstrap();
  const expressApp = app.getHttpAdapter().getInstance();
  // If Vercel rewrite added ?path=... preserve it for Nest routing under global prefix
  // Example: /api/health -> rewrite -> /api/index.ts?path=health
  // Global prefix 'api' means Nest expects '/api/health'
  const originalPath = (req.query as any).path as string | undefined;
  if (originalPath) {
    // Reconstruct the full path including prefix
    req.url = `/api/${originalPath}`;
  } else if (req.url === '/api' || req.url === '/api/') {
    // Map base /api to root controller path '' under global prefix
    req.url = '/api';
  }
  return new Promise((resolve) => {
    expressApp(req, res, () => resolve(undefined));
  });
}