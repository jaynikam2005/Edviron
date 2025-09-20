/* eslint-disable */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Request, Response } from 'express';

let appRef: INestApplication | null = null;

async function bootstrap(): Promise<INestApplication> {
  if (!appRef) {
    appRef = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log']
    });

    appRef.enableCors({
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

    appRef.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    );

    appRef.setGlobalPrefix('api');
    await appRef.init();
  }
  return appRef;
}

export default async function handler(req: Request, res: Response) {
  const app = await bootstrap();
  const expressApp = app.getHttpAdapter().getInstance();

  return new Promise((resolve) => {
    expressApp(req, res, () => resolve(undefined));
  });
}