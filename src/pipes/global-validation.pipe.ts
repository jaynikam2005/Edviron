import {
  ValidationPipe,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';

export class GlobalValidationPipe extends ValidationPipe {
  constructor() {
    super({
      // Enable automatic transformation
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Whitelist properties in DTOs
      whitelist: true,
      // Remove extra properties not in DTO
      forbidNonWhitelisted: true,
      // Stop validation on first error
      stopAtFirstError: false,
      // Disable detailed errors in production
      disableErrorMessages: process.env.NODE_ENV === 'production',
      // Custom exception factory
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = this.flattenValidationErrors(validationErrors);
        return new BadRequestException({
          statusCode: 400,
          error: 'Validation Error',
          message: 'Input validation failed',
          details: errors,
          timestamp: new Date().toISOString(),
        });
      },
    });
  }

  protected flattenValidationErrors(
    validationErrors: ValidationError[],
  ): string[] {
    const errors: string[] = [];

    const extractErrors = (
      error: ValidationError,
      parentPath: string = '',
    ): void => {
      const property = parentPath
        ? `${parentPath}.${error.property}`
        : error.property;

      if (error.constraints) {
        Object.values(error.constraints).forEach((constraint) => {
          errors.push(`${property}: ${constraint}`);
        });
      }

      if (error.children && error.children.length > 0) {
        error.children.forEach((child) => extractErrors(child, property));
      }
    };

    validationErrors.forEach((error) => extractErrors(error));
    return errors;
  }
}
