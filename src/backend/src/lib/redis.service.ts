import { NODE_ENV } from "../config";
import client from "../lib/redis.client";
import {
  HttpException,
  InternalServerErrorException,
} from "../utils/errors.utils";
import { log } from "../utils/logger.utils";

export class RedisService {
  private static isConnected = false;

  /**
   * Connect to Redis.
   */
  static async connect(): Promise<void> {
    if (this.isRedisConnected()) {
      log.warn("Redis is already connected");
      return;
    }

    try {
      await client.connect();
      this.isConnected = true;
      log.info("Redis connected successfully");
    } catch (error) {
      this.isConnected = false;
      log.error("Failed to connect to Redis:", { meta: { error } });
      if (NODE_ENV === "production") throw new InternalServerErrorException();
      throw new HttpException(500, "Failed to connect to Redis");
    }
  }

  /**
   * Disconnect from Redis.
   */
  static async disconnect(): Promise<void> {
    if (!this.isRedisConnected()) {
      log.warn("Redis is already disconnected");
      return;
    }

    try {
      await client.quit();
      this.isConnected = false;
      log.info("Redis disconnected successfully");
    } catch (error) {
      this.isConnected = false;
      log.error("Failed to disconnect from Redis:", error);
    }
  }

  /**
   * Check if Redis is connected
   */
  static isRedisConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Set a string value with optional TTL (time to live).
   *
   * @param key the key to set
   * @param value the string value to set
   * @param ttl the time to live in seconds (optional)
   */
  static async setString(
    key: string,
    value: string,
    ttl?: number
  ): Promise<void> {
    try {
      if (ttl) {
        await client.setEx(key, ttl, value);
      } else {
        await client.set(key, value);
      }
    } catch (error) {
      log.error(`Error setting string for key ${key}:`, error);
      if (NODE_ENV === "production") throw new InternalServerErrorException();
      throw new HttpException(500, `Failed to set string for key ${key}`);
    }
  }

  /**
   * Get a string value by key.
   *
   * @param key the key to get the value for
   * @returns the string value or null if not found
   */
  static async getString(key: string): Promise<string | null> {
    try {
      return await client.get(key);
    } catch (error) {
      log.error(`Error getting string for key ${key}:`, error);
      if (NODE_ENV === "production") throw new InternalServerErrorException();
      throw new HttpException(500, `Failed to get string for key ${key}`);
    }
  }

  /**
   * Set a JSON object as a string with optional TTL (time to live).
   *
   * @param key the key to set
   * @param value the JSON object to set
   * @param ttl the time to live in seconds (optional)
   */
  static async setJSON<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      if (ttl) {
        await client.setEx(key, ttl, jsonString);
      } else {
        await client.set(key, jsonString);
      }
    } catch (error) {
      log.error(`Error setting JSON for key ${key}:`, error);
      if (NODE_ENV === "production") throw new InternalServerErrorException();
      throw new HttpException(500, `Failed to set JSON for key ${key}`);
    }
  }

  /**
   * Get a JSON object by key.
   *
   * @param key the key to get the JSON object for
   * @returns the JSON object or null if not found
   */
  static async getJSON<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await client.get(key);
      if (!jsonString) return null;
      return JSON.parse(jsonString) as T;
    } catch (error) {
      log.error(`Error getting JSON for key ${key}:`, error);
      if (NODE_ENV === "production") throw new InternalServerErrorException();
      throw new HttpException(500, `Failed to get JSON for key ${key}`);
    }
  }

  /**
   * Delete a key from Redis.
   *
   * @param key the key to delete
   * @returns true if the key was deleted, false if it did not exist
   */
  static async delete(key: string): Promise<boolean> {
    try {
      const result = await client.del(key);
      return result > 0;
    } catch (error) {
      log.error(`Error deleting key ${key}:`, error);
      if (NODE_ENV === "production") throw new InternalServerErrorException();
      throw new HttpException(500, `Failed to delete key ${key}`);
    }
  }

  /**
   * Check if a key exists in Redis.
   *
   * @param key the key to check
   * @returns true if the key exists, false otherwise
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      log.error(`Error checking existence of key ${key}:`, error);
      if (NODE_ENV === "production") throw new InternalServerErrorException();
      throw new HttpException(500, `Failed to check existence of key ${key}`);
    }
  }

  /**
   * Set an expiration time for a key in Redis.
   *
   * @param key the key to set expiration for
   * @param seconds the number of seconds until expiration
   * @returns the number of keys that were set to expire
   */
  static async expire(key: string, seconds: number): Promise<number> {
    try {
      const result = await client.expire(key, seconds);
      return result;
    } catch (error) {
      log.error(`Error setting expiration for key ${key}:`, error);
      if (NODE_ENV === "production") throw new InternalServerErrorException();
      throw new HttpException(500, `Failed to set expiration for key ${key}`);
    }
  }
}
