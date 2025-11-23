require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');

async function testMongoDBConnections() {
  console.log('=== MONGODB CONNECTION TEST ===\n');
  
  const connections = [
    { name: 'USERS', uri: process.env.MONGODB_URI_USERS },
    { name: 'TRAINING', uri: process.env.MONGODB_URI_TRAINING },
    { name: 'MEDIA', uri: process.env.MONGODB_URI_MEDIA }
  ];
  
  for (const conn of connections) {
    console.log(`Testing ${conn.name} database...`);
    console.log(`URI: ${conn.uri?.substring(0, 50)}...`);
    
    try {
      const connection = await mongoose.createConnection(conn.uri, {
        serverSelectionTimeoutMS: 5000
      }).asPromise();
      
      console.log(`✓ ${conn.name} connected successfully`);
      console.log(`  Database: ${connection.db.databaseName}`);
      console.log(`  Host: ${connection.host}`);
      
      await connection.close();
      console.log(`  Connection closed\n`);
      
    } catch (error) {
      console.error(`✗ ${conn.name} connection failed`);
      console.error(`  Error: ${error.message}\n`);
    }
  }
  
  process.exit(0);
}

testMongoDBConnections();
