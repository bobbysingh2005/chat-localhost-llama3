import mongoose from 'mongoose';
import config from './config';

/**
 * Connect to MongoDB with retries and exponential backoff.
 * Returns true when connected, otherwise throws the last error.
 */
export const connectToDB = async (options?: { retries?: number; intervalMs?: number }) => {
  const retries = options?.retries ?? 5;
  const intervalMs = options?.intervalMs ?? 2000; // initial wait
  const url = config.mongoUrl;

  let attempt = 0;
  let lastErr: any = null;

  while (attempt <= retries) {
    try {
      await mongoose.connect(url);
      console.log(`✅ Connected to MongoDB at ${url}`);
      return true;
    } catch (err: any) {
      lastErr = err;
      attempt += 1;
      const wait = intervalMs * Math.pow(2, attempt - 1);
      console.error(`❌ MongoDB connection attempt ${attempt} failed. Retrying in ${wait}ms...`, String(err));
      if (attempt > retries) break;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, wait));
    }
  }

  console.error('❌ MongoDB connection failed after retries:', lastErr);
  throw lastErr;
};
