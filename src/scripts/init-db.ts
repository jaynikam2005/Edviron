import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserService } from '../modules/user/user.service';

async function initializeDatabase() {
  console.log('Initializing database...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);

  try {
    // Create admin user
    const adminUser = {
      username: 'admin',
      email: 'admin@edviron.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
    };

    const existingUser = await userService.findByEmail(adminUser.email);
    if (!existingUser) {
      await userService.create(adminUser);
      console.log('✅ Admin user created successfully!');
      console.log('   Email: admin@edviron.com');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create test user
    const testUser = {
      username: 'testuser',
      email: 'test@edviron.com',
      password: 'test123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
    };

    const existingTestUser = await userService.findByEmail(testUser.email);
    if (!existingTestUser) {
      await userService.create(testUser);
      console.log('✅ Test user created successfully!');
      console.log('   Email: test@edviron.com');
      console.log('   Password: test123');
    } else {
      console.log('ℹ️  Test user already exists');
    }
  } catch (error) {
    console.error(
      '❌ Error initializing database:',
      error instanceof Error ? error.message : error,
    );
  }

  await app.close();
  console.log('🏁 Database initialization completed');
}

initializeDatabase().catch(console.error);
