import { createClient } from "redis";
import { REDIS_URL } from "../config";
import { log } from "../utils/logger.utils";

const client = createClient({
  url: REDIS_URL,
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
  log.error("Redis Client Error:", { meta: { error } });
});

client.on("connect", () => {
  log.info("Redis client attempting connection");
});

client.on("ready", () => {
  log.info("Connected to Redis and ready");
});

client.on("end", () => {
  log.info("Redis client connection ended");
});

client.on("reconnecting", () => {
  log.info("Redis client reconnecting");
});

export default client;
