require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function fixUsers() {
  try {
    console.log('Connecting to users database...');
    const connection = await mongoose.createConnection(process.env.MONGODB_URI_USERS);
    
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = connection.model('User', userSchema);
    
    console.log('Updating users without isActive field...');
    const result = await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} users`);
    
    const users = await User.find({}, 'username email isActive role');
    console.log('\nAll users:');
    users.forEach(user => {
      console.log(`- ${user.username}: isActive=${user.isActive}, role=${user.role}`);
    });
    
    await connection.close();
    console.log('Migration completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixUsers();