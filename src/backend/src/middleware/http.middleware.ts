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
 * Routes that should be tracked individually in metrics.
 * Everything else is collapsed to "/unmatched" to prevent bot traffic from causing cardinality explosion.
 */
const KNOWN_ROUTE_PREFIXES = [
  "/api/dailySong",
  "/api/allSongs",
  "/api/stats",
  "/api/playlist",
  "/api/auth",
  "/api/user",
  "/api/health",
];

/**
 * Replace dynamic path segments with placeholders.
 *
 * @param path The path to normalize.
 * @returns The normalized path.
 */
function normalizeDynamicSegments(path: string): string {
  return path
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      ":id",
    )
    .replace(/\/[A-Za-z0-9]{22}(?=\/|$)/g, "/:playlistId")
    .replace(/\/\d+(?=\/|$)/g, "/:id")
    .replace(/\/\d{4}-\d{2}-\d{2}(?=\/|$)/g, "/:date");
}

/**
 * Normalize route path for metrics labels.
 * Uses Express matched route when available, falls back to prefix matching for known routes, and collapses everything else.
 *
 * @param req The request object.
 * @returns The normalized route path.
 */
function normalizeRoutePath(req: Request): string {
  if (req.route?.path) {
    return req.baseUrl + req.route.path;
  }

  const fullPath = (req.baseUrl || "") + (req.path || "");

  const isKnown = KNOWN_ROUTE_PREFIXES.some(
    (prefix) => fullPath === prefix || fullPath.startsWith(prefix + "/"),
  );

  return isKnown ? normalizeDynamicSegments(fullPath) : "/unmatched";
}

/**
 * Collect HTTP request metrics: count, duration, and in-flight requests.
 */
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.path === "/api/metrics") return next();

  const end = startTimer();
  httpRequestsInFlight.inc();

  res.on("finish", () => {
    const route = normalizeRoutePath(req);
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode.toString(),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDuration.observe(labels, end());
    httpRequestsInFlight.dec();
  });

  next();
}

/**
 * Morgan middleware for structured HTTP request logging.
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
          log.http("Incoming Request", JSON.parse(message));
        } catch (error) {
          log.error("Failed to parse HTTP log message", { meta: { error } });
          log.http(message.trim());
        }
      },
    },
  },
);
