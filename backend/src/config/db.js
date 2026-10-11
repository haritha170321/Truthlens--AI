const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fakenews_db';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning]: Could not connect to MongoDB (${error.message}).`);
    console.warn(`[MongoDB Warning]: App will run using local in-memory persistence fallback for seamless demo.`);
    isConnected = false;
  }
};

const getDBStatus = () => isConnected;

module.exports = { connectDB, getDBStatus };
