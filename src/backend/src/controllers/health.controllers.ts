import { Request, Response } from "express";
import redisClient from "@/lib/redis.client";
import Logger from "@/lib/logger";

export default class HealthController {
  /**
   * Liveness probe: checks only that the HTTP server is running.
   * K8s uses this to decide whether to restart the pod - Redis being
   * temporarily down is not a reason to restart.
   */
  static getLive(_req: Request, res: Response) {
    res.status(200).json({ status: "alive" });
  }

  /**
   * Readiness probe: checks Redis connectivity.
   * K8s uses this to decide whether to route traffic to the pod.
   */
  static async getHealth(_req: Request, res: Response) {
    try {
      await redisClient.ping();

      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      Logger.error("Health check failed", { error });
      res.status(503).json({
        status: "unhealthy",
      });
    }
  }
}
