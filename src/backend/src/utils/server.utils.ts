import { RedisService } from "../lib/redis.service";
import { log } from "./logger.utils";

/**
 * Attempts to connect to Redis with exponential backoff retry.
 *
 * @param maxRetries the maximum number of retry attempts
 * @param baseDelay the base delay in milliseconds before retrying
 */
export async function connectToRedisWithRetry(
  maxRetries = 5,
  baseDelay = 1000
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log.info(
        `Attempting to connect to Redis (attempt ${attempt}/${maxRetries})`
      );
      await RedisService.connect();
      log.info("Successfully connected to Redis");
      return;
    } catch (error) {
      log.error(`Redis connection attempt ${attempt} failed`, {
        meta: { error },
      });

      if (attempt === maxRetries) {
        log.error(
          "Max Redis connection attempts reached. Shutting down application."
        );
        process.exit(1);
      }

      // Exponential backoff: delay = baseDelay * 2^(attempt-1)
      const delay = baseDelay * Math.pow(2, attempt - 1);
      log.info(`Retrying Redis connection in ${delay}ms...`);
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
  log.info(`Received ${signal}. Starting graceful shutdown...`);

  try {
    await RedisService.disconnect();
    log.info("Redis connection closed.");
  } catch (error) {
    log.error("Error during Redis shutdown:", { meta: { error } });
  }

  process.exit(0);
};
