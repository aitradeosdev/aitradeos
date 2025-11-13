require('dotenv').config({ path: '../.env' });
const { connectDB } = require('../config/database');
const UserModel = require('../models/User');

async function createAdmin() {
  try {
    await connectDB();
    
    const adminData = {
      email: 'admin@huntr.ai',
      password: 'admin123456',
      username: 'admin',
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User'
      }
    };

    const existingAdmin = await UserModel.model.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    const admin = new UserModel.model(adminData);
    await admin.save();
    
    console.log('Admin user created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('Login at: http://localhost:8081 (same login page)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();