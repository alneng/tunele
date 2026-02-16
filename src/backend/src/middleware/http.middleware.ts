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
 * Operational endpoints: tracked in metrics but excluded from logs.
 * - /api/metrics: avoid self-referential log noise from Grafana Agent scrapes
 * - /api/health: avoid noise from Docker health checks
 */
const OPERATIONAL_PATHS = ["/api/metrics", "/api/health"];

/**
 * All routes that should be tracked in metrics (operational + application).
 * Everything else is unrecognized traffic (bots, scanners) and is silently ignored.
 */
const KNOWN_ROUTE_PREFIXES = [
  ...OPERATIONAL_PATHS,
  "/api/dailySong",
  "/api/allSongs",
  "/api/stats",
  "/api/playlist",
  "/api/auth",
  "/api/user",
];

// Helpers

function getFullPath(req: Request): string {
  return (req.baseUrl || "") + (req.path || "");
}

function isKnownRoute(fullPath: string): boolean {
  return KNOWN_ROUTE_PREFIXES.some(
    (prefix) => fullPath === prefix || fullPath.startsWith(prefix + "/"),
  );
}

function isOperationalRoute(fullPath: string): boolean {
  return OPERATIONAL_PATHS.some(
    (prefix) => fullPath === prefix || fullPath.startsWith(prefix + "/"),
  );
}

/**
 * Replace dynamic path segments with placeholders.
 */
function normalizeDynamicSegments(path: string): string {
  return path
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      ":id",
    )
    .replace(/\/[A-Za-z0-9]{22}(?=\/|$)/g, "/:playlistId")
    .replace(/\/\d{4}-\d{2}-\d{2}(?=\/|$)/g, "/:date")
    .replace(/\/\d+(?=\/|$)/g, "/:id");
}

/**
 * Normalize route path for metrics labels.
 * Uses Express matched route when available, falls back to prefix
 * matching with dynamic segment normalization.
 */
function normalizeRoutePath(req: Request): string {
  if (req.route?.path) {
    return req.baseUrl + req.route.path;
  }
  return normalizeDynamicSegments(getFullPath(req));
}

// Middleware

/**
 * Collect HTTP request metrics: count, duration, and in-flight gauge.
 *
 * Behavior by route type:
 * - Known application routes → full metrics
 * - Operational routes (/health, /metrics) → full metrics (but no logs, see morgan)
 * - Unrecognized routes (bot/scanner traffic) → skipped entirely
 */
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const fullPath = getFullPath(req);

  // Unrecognized traffic — no metrics at all
  if (!isKnownRoute(fullPath)) return next();

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
 * Skips operational endpoints (health/metrics) and unrecognized routes.
 * Only application endpoints produce log output.
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
    skip: (req: Request) => {
      const fullPath = getFullPath(req);
      return !isKnownRoute(fullPath) || isOperationalRoute(fullPath);
    },
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
