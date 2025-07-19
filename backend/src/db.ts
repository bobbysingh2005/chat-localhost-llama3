import mongoose from 'mongoose';
import config from './config';

export const connectToDB = async () => {
  try {
    if (config.env !== 'production') {
      await mongoose.connect('mongodb://localhost:27017/chatApp');
    } else {
      await mongoose.connect('mongodb://mongo:27017/chatApp');
    };//endIf
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
};
