import { RedisService } from "../lib/redis.service";
import Logger from "../lib/logger";

/**
 * Attempts to connect to Redis with exponential backoff retry.
 *
 * @param maxRetries the maximum number of retry attempts
 * @param baseDelay the base delay in milliseconds before retrying
 */
export async function connectToRedisWithRetry(
  maxRetries = 5,
  baseDelay = 1000,
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      Logger.info(
        `Attempting to connect to Redis (attempt ${attempt}/${maxRetries})`,
      );
      await RedisService.connect();
      Logger.info("Successfully connected to Redis");
      return;
    } catch (error) {
      Logger.error(`Redis connection attempt ${attempt} failed`, {
        error,
      });

      if (attempt === maxRetries) {
        Logger.error(
          "Max Redis connection attempts reached. Shutting down application.",
        );
        process.exit(1);
      }

      // Exponential backoff: delay = baseDelay * 2^(attempt-1)
      const delay = baseDelay * Math.pow(2, attempt - 1);
      Logger.info(`Retrying Redis connection in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Handles graceful shutdown of the Express API.
 *
 * @param signal the signal that triggered the shutdown (e.g., SIGTERM, SIGINT)
 */
export const gracefulShutdown = async (signal: string) => {
  Logger.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    await RedisService.disconnect();
    Logger.info("Redis connection closed.");
  } catch (error) {
    Logger.error("Error during Redis shutdown", { error });
  }

  process.exit(0);
};
