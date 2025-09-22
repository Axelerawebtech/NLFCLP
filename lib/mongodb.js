import mongoose from 'mongoose';

const connection = {};

async function dbConnect() {
  if (connection.isConnected) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    const msg = 'Environment variable MONGODB_URI is not set. The application may connect to the default MongoDB instance (test DB).';
    // In development, fail fast to make the missing env obvious.
    if (process.env.NODE_ENV !== 'production') {
      console.error('MongoDB configuration error:', msg);
      throw new Error(msg);
    } else {
      console.error('MongoDB configuration warning:', msg);
    }
  }
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    connection.isConnected = db.connections[0].readyState;
    console.log('MongoDB Connected');
  } catch (error) {
    console.log('MongoDB connection error:', error);
  }
}

export default dbConnect;
