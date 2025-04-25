import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createRateLimiter } from "./utils/middleware";
import { httpRequestLogger, log } from "./utils/logger.utils";
import { errorHandler } from "./utils/errors.utils";
import { CORS_OPTIONS, PORT } from "./config";
import apiRouter from "./api";

const app = express();

// Configure Express for reverse proxy support
app.set("trust proxy", true);

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors(CORS_OPTIONS));
app.use(createRateLimiter());
app.use(httpRequestLogger);

// Routes
app.use("/api", apiRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  log.info(`API running at http://localhost:${PORT}`);
});
