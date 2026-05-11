const mongoose = require('mongoose');
const { createLogger } = require('./logger');

const logger = createLogger('db');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MongoDB connection string is not configured.');
  }

  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, {
      autoIndex: false,
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error', error);
    process.exit(1);
  }
}

module.exports = { connectDatabase };
