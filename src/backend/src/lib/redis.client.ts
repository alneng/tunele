import { createClient } from "redis";
import config from "@/config";
import Logger from "@/lib/logger";

const client = createClient({
  url: config.redis.url,
  // Forces a CLIENT SETNAME command during the connection handshake. Without
  // this, when no auth/SELECT/RESP3 is configured the handshake is empty and
  // the client marks the connection as "ready" the instant TCP connects -
  // even if the remote end isn't a real Redis (e.g. Docker Desktop proxy
  // keeping the port open after container stop on Windows). With a non-empty
  // handshake the client waits for a Redis response before emitting "ready".
  name: "tunele-api",
  socket: {
    reconnectStrategy: (retries: number) => {
      return Math.min(2 ** retries * 500, 10000);
    },
    connectTimeout: 5000,
    socketTimeout: 5000,
  },
  pingInterval: 5000,
  disableOfflineQueue: true,
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
