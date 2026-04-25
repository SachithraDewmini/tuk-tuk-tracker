const { MongoClient } = require('mongodb');
const logger = require('../utils/logger');

let db = null;
let client = null;

const connectDB = async () => {
  try {
    client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,
    });
    
    await client.connect();
    db = client.db();
    
    // Create indexes for performance
    await createIndexes();
    
    logger.info('✅ MongoDB connected successfully');
    return db;
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

const createIndexes = async () => {
  try {
    // Vehicle indexes
    await db.collection('vehicles').createIndexes([
      { key: { deviceId: 1 }, unique: true },
      { key: { registrationNumber: 1 }, unique: true },
      { key: { districtId: 1 } },
      { key: { isActive: 1 } },
      { key: { 'currentLocation.coordinates': '2dsphere' } }
    ]);
    
    // Location pings indexes
    await db.collection('locationPings').createIndexes([
      { key: { vehicleId: 1, timestamp: -1 } },
      { key: { timestamp: 1 }, expireAfterSeconds: 7776000 } // 90 days
    ]);
    
    // User indexes
    await db.collection('users').createIndexes([
      { key: { username: 1 }, unique: true },
      { key: { role: 1 } }
    ]);
    
    logger.info('✅ Database indexes created');
  } catch (error) {
    logger.error('Failed to create indexes:', error);
  }
};

const getDB = () => {
  if (!db) throw new Error('Database not connected');
  return db;
};

const closeDB = async () => {
  if (client) await client.close();
};

module.exports = { connectDB, getDB, closeDB };