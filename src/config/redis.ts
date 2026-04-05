import IORedis from "ioredis";

// Minimal Redis connection with defaults
export const redisConnection = new IORedis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  db: Number(process.env.REDIS_DB) || 0,
  maxRetriesPerRequest: null,
});
