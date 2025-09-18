import 'jest-extended';

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.DATABASE_URL = 'mongodb://localhost:27017/edviron-test';
});

// Global test teardown
afterAll(async () => {
  // Cleanup after all tests
});

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Extend Jest matchers
expect.extend({
  toBeValidDate(received) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${String(received)} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${String(received)} to be a valid date`,
        pass: false,
      };
    }
  },

  toHaveValidPagination(received) {
    const hasRequiredFields =
      typeof received.currentPage === 'number' &&
      typeof received.totalPages === 'number' &&
      typeof received.totalItems === 'number' &&
      typeof received.hasNext === 'boolean' &&
      typeof received.hasPrev === 'boolean';

    if (hasRequiredFields) {
      return {
        message: () =>
          `expected ${JSON.stringify(received)} not to have valid pagination`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${JSON.stringify(received)} to have valid pagination`,
        pass: false,
      };
    }
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toHaveValidPagination(): R;
    }
  }
}
