require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  console.log('=== CREATE ADMIN USER ===\n');
  
  try {
    const connection = await mongoose.createConnection(process.env.MONGODB_URI_USERS).asPromise();
    console.log(`Connected to: ${connection.db.databaseName}\n`);
    
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = connection.model('User', userSchema);
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@huntrai.com' });
    if (existingAdmin) {
      console.log('✓ Admin already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Username:', existingAdmin.username);
      await connection.close();
      process.exit(0);
    }
    
    // Create admin
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Admin123()()', salt);
    
    const admin = new User({
      email: 'admin@huntrai.com',
      password: hashedPassword,
      username: 'huntradmin',
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      },
      settings: {
        allowDataTraining: true,
        notifications: true,
        newDeviceAlerts: false,
        theme: 'dark',
        aiModel: 'gemini-2.5-flash',
        welcomeMessageShown: true
      },
      subscription: {
        plan: 'premium',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      },
      apiUsage: {
        totalAnalyses: 0,
        monthlyAnalyses: 0,
        dailyAnalyses: 0,
        lastResetDate: new Date(),
        lastDailyReset: new Date()
      },
      emailVerification: {
        isVerified: true
      },
      isActive: true,
      devices: [],
      notifications: [],
      analysisHistory: [],
      createdAt: new Date()
    });
    
    await admin.save();
    
    console.log('✓ Admin created successfully!\n');
    console.log('Email: admin@huntrai.com');
    console.log('Password: Admin123()()');
    console.log('Username: huntradmin');
    console.log('Role: admin');
    
    await connection.close();
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
}

createAdmin();
