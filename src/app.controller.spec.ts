import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return API information', () => {
      const result = appController.getHello();
      const parsed = JSON.parse(result);
      expect(parsed.message).toBe('Welcome to Edviron API! 🚀');
      expect(parsed.version).toBe('1.0.0');
      expect(parsed.status).toBe('active');
    });
  });
});
