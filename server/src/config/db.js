const mongoose = require('mongoose');
const config = require('./env');

let memoryServer = null;

const connectDB = async () => {
  try {
    // Attempt connecting to the configured MongoDB URI with a fast serverSelectionTimeoutMS
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] MongoDB Connected successfully to: ${mongoose.connection.host}`);
  } catch (primaryErr) {
    console.warn(`[Database] Could not connect to primary MongoDB (${config.MONGO_URI}): ${primaryErr.message}`);
    console.log('[Database] Initializing fallback in-memory MongoDB server...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const inMemoryUri = memoryServer.getUri();
      
      await mongoose.connect(inMemoryUri);
      console.log(`[Database] In-memory MongoDB Connected successfully at: ${inMemoryUri}`);
    } catch (memErr) {
      console.error('[Database] Critical: In-memory MongoDB fallback also failed:', memErr.message);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (err) {
    console.error('[Database] Disconnect error:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
