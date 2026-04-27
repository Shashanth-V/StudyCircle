import mongoose from 'mongoose';

/**
 * Connect to MongoDB using Mongoose
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    const conn = await mongoose.connect(uri, {
      // Mongoose 6+ uses these defaults; kept explicit for clarity
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
};

