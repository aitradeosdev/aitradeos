require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function clearDatabases() {
  try {
    console.log('Users URI:', process.env.MONGODB_URI_USERS);
    console.log('Training URI:', process.env.MONGODB_URI_TRAINING);
    
    const userConn = mongoose.createConnection(process.env.MONGODB_URI_USERS);
    const trainingConn = mongoose.createConnection(process.env.MONGODB_URI_TRAINING);

    await userConn.asPromise();
    await trainingConn.asPromise();

    await userConn.dropDatabase();
    console.log('✅ Users database cleared');

    await trainingConn.dropDatabase();
    console.log('✅ Training database cleared');

    await userConn.close();
    await trainingConn.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing databases:', error);
    process.exit(1);
  }
}

clearDatabases();