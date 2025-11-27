import mongoose from 'mongoose';
import config from './index';

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
      console.log(`   \x1b[32m✓\x1b[0m \x1b[32mMongoDB connected successfully\x1b[0m`);
      return true;
    } catch (err: any) {
      lastErr = err;
      attempt += 1;
      const wait = intervalMs * Math.pow(2, attempt - 1);
      console.error(`   \x1b[33m⚠\x1b[0m MongoDB connection attempt ${attempt}/${retries} failed. Retrying in ${wait}ms...`);
      if (attempt > retries) break;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, wait));
    }
  }

  console.error(`   \x1b[31m✗\x1b[0m \x1b[31mMongoDB connection failed after ${retries} retries\x1b[0m`);
  console.error(`   \x1b[31mError:\x1b[0m`, lastErr?.message || String(lastErr));
  throw lastErr;
};
