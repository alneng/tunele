import { createClient } from "redis";
import config from "@/config";
import Logger from "@/lib/logger";

const client = createClient({
  url: config.redis.url,
  socket: {
    // Disable automatic reconnection
    reconnectStrategy: false,
    // Set connection timeout
    connectTimeout: 5000,
    // Set socket timeout
    timeout: 5000,
  },
});

client.on("error", (error) => {
  Logger.error("Redis Client Error", { error });
});

client.on("connect", () => {
  Logger.info("Redis client attempting connection");
});

client.on("ready", () => {
  Logger.info("Connected to Redis and ready");
});

client.on("end", () => {
  Logger.info("Redis client connection ended");
});

client.on("reconnecting", () => {
  Logger.info("Redis client reconnecting");
});

export default client;
