import express from "express";
import authRouter from "./routes/auth.routes";
import customGameRouter from "./routes/custom-game.routes";
import mainGameRouter from "./routes/main-game.routes";
import userRouter from "./routes/user.routes";
import MetricsController from "./controllers/metrics.controllers";
import HealthController from "./controllers/health.controllers";
import { createAuthRateLimiter } from "./middleware/rate-limit.middleware";

const router = express.Router();

router.use("/", mainGameRouter);
router.use("/playlist", customGameRouter);
router.use("/auth", createAuthRateLimiter(), authRouter);
router.use("/user", userRouter);

router.get("/health", HealthController.getHealth);

router.get("/metrics", MetricsController.getMetrics);

export default router;
