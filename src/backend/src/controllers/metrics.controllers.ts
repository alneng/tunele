import { Request, Response } from "express";
import { METRICS_AUTH_TOKEN } from "../config";
import { getMetrics, getContentType } from "../metrics/registry";
import { log } from "../utils/logger.utils";

export default class MetricsController {
  static async getMetrics(req: Request, res: Response) {
    // Require authentication if METRICS_AUTH_TOKEN is configured
    if (METRICS_AUTH_TOKEN) {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      if (token !== METRICS_AUTH_TOKEN) {
        res.status(401).end("Unauthorized");
        return;
      }
    }

    try {
      res.set("Content-Type", getContentType());
      res.end(await getMetrics());
    } catch (error) {
      log.error("Error collecting metrics", { meta: { error } });
      res.status(500).end("Error collecting metrics");
    }
  }
}
