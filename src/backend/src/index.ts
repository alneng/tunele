import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createRateLimiter } from "@/middleware/rate-limit.middleware";
import Logger from "@/lib/logger";
import { errorHandler } from "@/utils/errors.utils";
import { httpRequestLogger, metricsMiddleware } from "@/middleware/http.middleware";
import { correlationMiddleware } from "@/middleware/correlation.middleware";
import config from "@/config";
import apiRouter from "@/api";
import { connectToRedisWithRetry, gracefulShutdown } from "@/utils/server.utils";

const app = express();

// Configure Express for reverse proxy support
app.set("trust proxy", true);

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors(config.cors));
app.use(correlationMiddleware);
app.use(metricsMiddleware);
app.use(createRateLimiter());
app.use(httpRequestLogger);

// Routes
app.use("/api", apiRouter);

// Error handler
app.use(errorHandler);

// Start server and connect to Redis
const { port } = config;
app.listen(port, "0.0.0.0", async () => {
  Logger.info(`API running at http://localhost:${port}`);

  try {
    await connectToRedisWithRetry();
  } catch (error) {
    Logger.error("Failed to establish Redis connection", { error });
    process.exit(1);
  }
});

// Register shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (error) => {
  Logger.error("Uncaught Exception", { error, stack: error.stack });
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  Logger.error("Unhandled Rejection", { reason, promise });
  process.exit(1);
});
