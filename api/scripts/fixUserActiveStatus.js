const { connectDB, getUserConnection } = require('../config/database');
require('dotenv').config({ path: '../../.env' });

async function fixUserActiveStatus() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    const connection = getUserConnection();
    const UserModel = require('../models/User');
    const User = UserModel.model;

    console.log('Checking users without isActive field...');
    
    // Find users where isActive is undefined or null
    const usersToUpdate = await User.find({
      $or: [
        { isActive: { $exists: false } },
        { isActive: null }
      ]
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    if (usersToUpdate.length > 0) {
      // Update all users to have isActive: true by default
      const result = await User.updateMany(
        {
          $or: [
            { isActive: { $exists: false } },
            { isActive: null }
          ]
        },
        { $set: { isActive: true } }
      );

      console.log(`Updated ${result.modifiedCount} users with isActive: true`);
    }

    // Verify the update
    const allUsers = await User.find({}, 'username email isActive role');
    console.log('\nAll users status:');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}): isActive=${user.isActive}, role=${user.role}`);
    });

    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

fixUserActiveStatus();