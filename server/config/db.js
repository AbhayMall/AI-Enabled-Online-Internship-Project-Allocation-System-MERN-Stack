const mongoose = require('mongoose');

const connectDB = async (customUri) => {
  const uri = customUri || process.env.MONGO_URI;
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Error] ${error.message}`);
    // If running in development without a live Mongo, notify
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Ensure MongoDB is running or configure MONGO_URI in .env');
    }
    throw error;
  }
};

module.exports = connectDB;
