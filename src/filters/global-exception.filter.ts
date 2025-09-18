import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error?: string;
  details?: any;
  requestId?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    // Log error details
    this.logError(exception, request, errorResponse);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;
    const requestId = this.generateRequestId();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'INTERNAL_SERVER_ERROR';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        message = (response as any).message || exception.message;
        error = (response as any).error || exception.name;
        details = (response as any).details;
      }
    } else if (this.isMongoError(exception)) {
      const mongoError = exception as MongoError;
      statusCode = this.getMongoErrorStatus(mongoError);
      message = this.getMongoErrorMessage(mongoError);
      error = 'DATABASE_ERROR';
    } else if (exception instanceof Error) {
      message =
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : exception.message;
      error = exception.name;
    }

    return {
      statusCode,
      timestamp,
      path,
      method,
      message,
      error,
      details,
      requestId,
    };
  }

  private isMongoError(exception: unknown): boolean {
    return (
      exception instanceof MongoError ||
      (exception as any)?.name?.includes('Mongo') ||
      (exception as any)?.code !== undefined
    );
  }

  private getMongoErrorStatus(error: MongoError): number {
    switch (error.code) {
      case 11000: // Duplicate key error
        return HttpStatus.CONFLICT;
      case 121: // Document validation failure
        return HttpStatus.BAD_REQUEST;
      case 50: // Exceeded time limit
        return HttpStatus.REQUEST_TIMEOUT;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  private getMongoErrorMessage(error: MongoError): string {
    switch (error.code) {
      case 11000:
        return 'Duplicate entry found. This record already exists.';
      case 121:
        return 'Data validation failed. Please check your input.';
      case 50:
        return 'Database operation timed out. Please try again.';
      default:
        return process.env.NODE_ENV === 'production'
          ? 'Database operation failed'
          : error.message;
    }
  }

  private logError(
    exception: unknown,
    request: Request,
    errorResponse: ErrorResponse,
  ) {
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'];
    const ip = request.ip;

    const logData = {
      requestId: errorResponse.requestId,
      timestamp: errorResponse.timestamp,
      method,
      url,
      statusCode: errorResponse.statusCode,
      error: errorResponse.error,
      message: errorResponse.message,
      userAgent,
      ip,
      body: this.sanitizeLogData(body),
      query: this.sanitizeLogData(query),
      params: this.sanitizeLogData(params),
      stack: exception instanceof Error ? exception.stack : undefined,
    };

    if (errorResponse.statusCode >= 500) {
      this.logger.error('Server Error', JSON.stringify(logData, null, 2));
    } else if (errorResponse.statusCode >= 400) {
      this.logger.warn('Client Error', JSON.stringify(logData, null, 2));
    }
  }

  private sanitizeLogData(data: any): any {
    if (!data) return data;

    const sanitized = { ...data };
    const sensitiveFields = [
      'password',
      'token',
      'authorization',
      'apiKey',
      'secret',
    ];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private generateRequestId(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
