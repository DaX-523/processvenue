import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redisClient.on("disconnect", () => {
  console.log("❌ Disconnected from Redis");
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
};

export const isRedisAvailable = async () => {
  return redisClient.isReady;
};

/* 
REDIS OPERATIONS
 */
export const setCache = async (
  key: string,
  value: string,
  ttl: number = 300
) => {
  try {
    if (!isRedisAvailable()) return false;
    await redisClient.setEx(key, ttl, value);
    return true;
  } catch (error) {
    console.error("Redis SET error:", error);
    return false;
  }
};

export const getCache = async (key: string) => {
  try {
    if (!isRedisAvailable()) return null;
    return await redisClient.get(key);
  } catch (error) {
    console.error("Redis GET error:", error);
    return null;
  }
};

export const deleteCache = async (key: string) => {
  try {
    if (!isRedisAvailable()) return false;
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error("Redis DELETE error:", error);
    return false;
  }
};
connectRedis();

export default redisClient;
