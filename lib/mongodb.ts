import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI as string;

if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is not defined');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var _mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cached;

async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('[MongoDB] ✅ Using existing cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('[MongoDB] 🔄 Initiating new connection to MongoDB...');
    cached.promise = mongoose
      .connect(MONGO_URI, { bufferCommands: false })
      .then((m) => {
        console.log('[MongoDB] ✅ Connected successfully');
        return m;
      })
      .catch((err: unknown) => {
        console.error('[MongoDB] ❌ Connection failed:', err);
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
