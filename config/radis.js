/* import redis from "redis";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create a Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

// Handle connection errors
redisClient.on("error", (err) => console.error("Redis Client Error", err));

// Connect the client
(async () => {
  await redisClient.connect();
})();

// Use ES6 export syntax
export default redisClient;
 */
