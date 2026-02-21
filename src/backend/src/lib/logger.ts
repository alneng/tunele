import winston from "winston";
import path from "path";
import LokiTransport from "winston-loki";
import config from "@/config";
import { getCorrelationId } from "@/middleware/correlation.middleware";

/** Flat key-value metadata passed to Logger methods. */
export type LogMeta = Record<string, unknown>;
export type LogLevel = "error" | "warn" | "info" | "http";

/**
 * Structured application logger backed by Winston.
 *
 * Metadata is passed as a flat object and automatically namespaced under
 * `{ meta }` for the transport layer. When no metadata is provided the key
 * is omitted entirely, keeping log output clean.
 *
 * @example
 * Logger.info("Server started", { port: 3000 });
 * Logger.error("Request failed", { error: err, requestId: "abc" });
 * Logger.warn("Slow query detected");  // no meta — field omitted
 */
export default class Logger {
  private static readonly LOGS_DIR = "logs";

  private static readonly LEVELS: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
  };

  private static readonly COLORS: Record<LogLevel, string> = {
    error: "red",
    warn: "yellow",
    info: "white",
    http: "magenta",
  };

  private static readonly instance: winston.Logger = Logger.init();

  private constructor() {} // Not instantiable

  // Public API

  static error(message: string, meta?: LogMeta): void {
    Logger.instance.error(message, Logger.buildPayload(meta));
  }

  static warn(message: string, meta?: LogMeta): void {
    Logger.instance.warn(message, Logger.buildPayload(meta));
  }

  static info(message: string, meta?: LogMeta): void {
    Logger.instance.info(message, Logger.buildPayload(meta));
  }

  static http(message: string, meta?: LogMeta): void {
    Logger.instance.http(message, Logger.buildPayload(meta));
  }

  // Initialization

  private static init(): winston.Logger {
    winston.addColors(Logger.COLORS);

    return winston.createLogger({
      level: "http",
      levels: Logger.LEVELS,
      format: winston.format.combine(
        Logger.correlationIdFormat(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: Logger.buildTransports(),
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(Logger.LOGS_DIR, "exceptions.log"),
        }),
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(Logger.LOGS_DIR, "rejections.log"),
        }),
      ],
    });
  }

  // Transports

  private static buildTransports(): winston.transport[] {
    const transports: winston.transport[] = [
      new winston.transports.Console({ format: Logger.consoleFormat() }),

      new winston.transports.File({
        filename: path.join(Logger.LOGS_DIR, "error.log"),
        level: "error",
      }),

      new winston.transports.File({
        filename: path.join(Logger.LOGS_DIR, "http.log"),
        format: winston.format.combine(
          Logger.onlyHttp(),
          Logger.jsonWithTimestamp(),
        ),
      }),

      new winston.transports.File({
        filename: path.join(Logger.LOGS_DIR, "combined.log"),
        format: winston.format.combine(
          Logger.excludeHttp(),
          Logger.jsonWithTimestamp(),
        ),
      }),
    ];

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
            Logger.correlationIdFormat(),
            winston.format.json(),
          ),
          replaceTimestamp: true,
          onConnectionError: (err: Error) =>
            console.error("Loki connection error:", err),
        }),
      );
    }

    return transports;
  }

  // Formats

  private static correlationIdFormat() {
    return winston.format((info) => {
      const id = getCorrelationId();
      if (id) info.correlationId = id;
      return info;
    })();
  }

  private static excludeHttp() {
    return winston.format((info) => (info.level === "http" ? false : info))();
  }

  private static onlyHttp() {
    return winston.format((info) => (info.level === "http" ? info : false))();
  }

  private static conditionalHttp() {
    return winston.format((info) => {
      if (info.level === "http")
        return config.logger.enableHttpLogPrinting ? info : false;
      return info;
    })();
  }

  private static jsonWithTimestamp() {
    return winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.json(),
    );
  }

  private static consoleFormat() {
    return winston.format.combine(
      Logger.conditionalHttp(),
      winston.format.colorize({ all: true }),
      winston.format.printf((info) => {
        const cid = info.correlationId ? ` [${info.correlationId}]` : "";
        const meta = info.meta ? ` ${JSON.stringify(info.meta)}` : "";
        return `[${info.timestamp}]${cid} ${info.level}: ${info.message}${meta}`;
      }),
    );
  }

  // Metadata helpers

  private static buildPayload(
    meta?: LogMeta,
  ): { meta: Record<string, unknown> } | undefined {
    if (!meta || Object.keys(meta).length === 0) return undefined;

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(meta)) {
      sanitized[key] = Logger.sanitizeValue(value);
    }
    return { meta: sanitized };
  }

  private static sanitizeValue(value: unknown): unknown {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        ...(value.stack ? { stack: value.stack } : {}),
      };
    }

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const sanitized: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        sanitized[k] = Logger.sanitizeValue(v);
      }
      return sanitized;
    }

    return value;
  }
}
