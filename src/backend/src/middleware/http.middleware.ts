import { Request, Response, NextFunction } from "express";
import {
  httpRequestsTotal,
  httpRequestDuration,
  httpRequestsInFlight,
} from "../metrics/http.metrics";
import { startTimer } from "../metrics/registry";
import morgan from "morgan";
import { log } from "../utils/logger.utils";

/**
 * Normalize route path to avoid high cardinality metrics.
 * Replaces dynamic segments with placeholders.
 *
 * @param req Express request object
 * @returns Normalized route path
 */
function normalizeRoutePath(req: Request): string {
  // Use the matched route pattern if available (Express populates this)
  if (req.route?.path) {
    return req.baseUrl + req.route.path;
  }

  // Fallback: normalize common dynamic patterns
  let path = req.path;

  // Replace UUIDs
  path = path.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
    ":id",
  );

  // Replace Spotify playlist IDs (22 alphanumeric characters)
  path = path.replace(/\/[A-Za-z0-9]{22}(?=\/|$)/g, "/:playlistId");

  // Replace numeric IDs
  path = path.replace(/\/\d+(?=\/|$)/g, "/:id");

  // Replace date patterns (YYYY-MM-DD)
  path = path.replace(/\/\d{4}-\d{2}-\d{2}(?=\/|$)/g, "/:date");

  return path;
}

/**
 * Middleware to collect HTTP request metrics.
 * Tracks request count, duration, and in-flight requests.
 */
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Skip metrics endpoint to avoid self-referential metrics
  if (req.path === "/api/metrics") {
    return next();
  }

  const end = startTimer();

  httpRequestsInFlight.inc();

  res.on("finish", () => {
    const route = normalizeRoutePath(req);
    const method = req.method;
    const statusCode = res.statusCode.toString();

    httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode,
    });

    httpRequestDuration.observe(
      {
        method,
        route,
        status_code: statusCode,
      },
      end(),
    );

    httpRequestsInFlight.dec();
  });

  next();
}

/**
 * Morgan middleware for logging HTTP requests.
 */
export const httpRequestLogger = morgan(
  (tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      contentLength: Number(tokens.res(req, res, "content-length") || 0),
      responseTime: Number(tokens["response-time"](req, res) || 0),
      remoteAddr: tokens["remote-addr"](req, res),
      userAgent: tokens["user-agent"](req, res),
      httpVersion: tokens["http-version"](req, res),
    });
  },
  {
    stream: {
      write: (message: string) => {
        try {
          const data = JSON.parse(message);
          log.http("Incoming Request", data);
        } catch (error) {
          log.error(
            "Error parsing HTTP request log message, defaulting to raw message",
            { meta: { error } },
          );
          log.http(message.trim());
        }
      },
    },
  },
);
