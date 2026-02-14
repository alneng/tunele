import { Request, Response } from "express";
import redisClient from "../lib/redis.client";
import { log } from "../utils/logger.utils";

export default class HealthController {
  static async getHealth(_req: Request, res: Response) {
    try {
      // Check database/Redis connectivity
      await redisClient.ping();

      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      log.error("Health check failed", { meta: { error } });
      res.status(503).json({
        status: "unhealthy",
      });
    }
  }
}
