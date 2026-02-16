import { Request, Response } from "express";
import config from "../config";
import { getMetrics, getContentType } from "../metrics/registry";
import { log } from "../utils/logger.utils";

export default class MetricsController {
  static async getMetrics(req: Request, res: Response) {
    const { authToken } = config.metrics;
    // Require authentication if metrics auth token is configured
    if (authToken) {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.slice(7)
        : null;

      if (token !== authToken) {
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
