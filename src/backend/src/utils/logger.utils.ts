import winston from "winston";
import path from "path";
import LokiTransport from "winston-loki";
import config from "../config";
import { getCorrelationId } from "../middleware/correlation.middleware";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
} as const;
export type LogLevel = keyof typeof levels;

const colors: { [key in LogLevel]: string } = {
  error: "red",
  warn: "yellow",
  info: "white",
  http: "magenta",
};
winston.addColors(colors);

/**
 * Create a filter for non-HTTP logs.
 */
const excludeHttpFilter = winston.format((info) => {
  return info.level === "http" ? false : info;
});

/**
 * Create a filter for only HTTP logs.
 */
const onlyHttpFilter = winston.format((info) => {
  return info.level === "http" ? info : false;
});

/**
 * Create a filter to conditionally show HTTP logs based on config.
 */
const conditionalHttpFilter = winston.format((info) => {
  if (info.level === "http") {
    return config.logger.enableHttpLogPrinting ? info : false;
  }
  return info;
});

/**
 * Format that adds correlation ID to log entries
 */
const correlationIdFormat = winston.format((info) => {
  const correlationId = getCorrelationId();
  if (correlationId) {
    info.correlationId = correlationId;
  }
  return info;
});

/**
 * Build transports array based on environment
 */
function buildTransports(): winston.transport[] {
  const transports: winston.transport[] = [
    // Handles printing logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        conditionalHttpFilter(),
        winston.format.colorize({ all: true }),
        winston.format.printf((info) => {
          const correlationId = info.correlationId
            ? ` [${info.correlationId}]`
            : "";
          return `[${info.timestamp}]${correlationId} ${info.level}: ${info.message}`;
        }),
      ),
    }),
    // Separate log file for error logs
    new winston.transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
    }),
    // Separate log file for HTTP logs
    new winston.transports.File({
      filename: path.join("logs", "http.log"),
      format: winston.format.combine(
        onlyHttpFilter(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json(),
      ),
    }),
    // Combined log file for all other logs (excluding HTTP logs)
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      format: winston.format.combine(
        excludeHttpFilter(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json(),
      ),
    }),
  ];

  // Add Loki transport for production
  if (
    config.env === "production" &&
    config.grafana.lokiHost &&
    config.grafana.lokiUser &&
    config.grafana.lokiToken
  ) {
    transports.push(
      new LokiTransport({
        host: config.grafana.lokiHost,
        basicAuth: `${config.grafana.lokiUser}:${config.grafana.lokiToken}`,
        labels: {
          app: "tunele-api",
          env: config.env,
          cluster: config.clusterName,
        },
        json: true,
        format: winston.format.combine(
          correlationIdFormat(),
          winston.format.json(),
        ),
        replaceTimestamp: true,
        onConnectionError: (err) => {
          log.error("Loki connection error:", {
            meta: { error: JSON.stringify(err) },
          });
        },
      }),
    );
  }

  return transports;
}

const logger = winston.createLogger({
  level: "http",
  levels,
  format: winston.format.combine(
    correlationIdFormat(),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: buildTransports(),
});

export const log = {
  error: (message: string, meta?: unknown) => logger.error(message, meta),
  warn: (message: string, meta?: unknown) => logger.warn(message, meta),
  info: (message: string, meta?: unknown) => logger.info(message, meta),
  http: (message: string, meta?: unknown) => logger.http(message, meta),
} as const;
