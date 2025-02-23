import winston from "winston";
import morgan from "morgan";
import path from "path";
import { loggerConfig } from "../config";

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
    return loggerConfig.enableHttpLogPrinting ? info : false;
  }
  return info;
});

const logger = winston.createLogger({
  level: "http",
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Handles printing logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        conditionalHttpFilter(),
        winston.format.colorize({ all: true }),
        winston.format.printf(
          (info) => `[${info.timestamp}] ${info.level}: ${info.message}`
        )
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
        winston.format.json()
      ),
    }),
    // Combined log file for all other logs (excluding HTTP logs)
    new winston.transports.File({
      filename: path.join("logs", "combined.log"),
      format: winston.format.combine(
        excludeHttpFilter(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.json()
      ),
    }),
  ],
});

export const log = {
  error: (message: string, meta?: unknown) => logger.error(message, meta),
  warn: (message: string, meta?: unknown) => logger.warn(message, meta),
  info: (message: string, meta?: unknown) => logger.info(message, meta),
  http: (message: string, meta?: unknown) => logger.http(message, meta),
} as const;

/**
 * Morgan middleware for logging HTTP requests.
 */
export const httpRequestLogger = morgan("combined", {
  stream: { write: (message: string) => log.http(message.trim()) },
});
