const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Simple demo user creation script
async function createDemoUser() {
  console.log('🌱 Creating demo user...');

  try {
    // Connect to MongoDB
    const MONGODB_URI = 'mongodb+srv://edviron_user:Jaynikam2@edviron-cluster.04dfzfx.mongodb.net/?retryWrites=true&w=majority&appName=edviron-cluster';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Define User schema
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      username: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      role: { type: String, default: 'admin' },
      isActive: { type: Boolean, default: true },
      lastLogin: { type: Date },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    });

    const User = mongoose.model('User', UserSchema);

    // Check if demo user already exists
    const existingUser = await User.findOne({ email: 'admin@edviron.com' });
    
    if (existingUser) {
      console.log('📝 Demo user already exists, updating password...');
      
      // Update the existing user with new password
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.findByIdAndUpdate(existingUser._id, {
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        updatedAt: new Date()
      });
      
      console.log('✅ Demo user updated successfully!');
    } else {
      console.log('👤 Creating new demo user...');
      
      // Create new demo user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const demoUser = new User({
        email: 'admin@edviron.com',
        username: 'admin',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await demoUser.save();
      console.log('✅ Demo user created successfully!');
    }

    // Verify the user exists and can authenticate
    const user = await User.findOne({ email: 'admin@edviron.com' });
    const passwordMatch = await bcrypt.compare('admin123', user.password);
    
    console.log('\n📋 Demo User Details:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Name: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.isActive}`);
    console.log(`   Password Test: ${passwordMatch ? 'PASS' : 'FAIL'}`);
    console.log(`   Created: ${user.createdAt}`);

    if (passwordMatch) {
      console.log('\n🎉 Demo user is ready for login!');
      console.log('   Email: admin@edviron.com');
      console.log('   Password: admin123');
    } else {
      console.log('\n❌ Password verification failed!');
    }

  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  }

  await mongoose.disconnect();
  console.log('\n✅ Database connection closed');
}

createDemoUser().catch(console.error);