class MissingEnvVariableError extends Error {
  constructor(variableName: string) {
    super(`Missing environment variable: ${variableName}`);
    this.name = "MissingEnvVariableError";
  }
}

export const NODE_ENV = process.env.NODE_ENV || "development";

// Throw if any required environment variables are missing
if (NODE_ENV !== "test") {
  if (!process.env.CORS_OPTIONS)
    throw new MissingEnvVariableError("CORS_OPTIONS");
  if (!process.env.COOKIE_SETTINGS)
    throw new MissingEnvVariableError("COOKIE_SETTINGS");
  if (!process.env.SPOTIFY_CLIENT_KEY)
    throw new MissingEnvVariableError("SPOTIFY_CLIENT_KEY");
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
    throw new MissingEnvVariableError("FIREBASE_SERVICE_ACCOUNT_KEY");
}

export const PORT = process.env.PORT ? Number(process.env.PORT) : 7600;

export const CORS_OPTIONS = JSON.parse(process.env.CORS_OPTIONS || "{}");
export const COOKIE_SETTINGS = JSON.parse(process.env.COOKIE_SETTINGS || "{}");

export const SPOTIFY_CLIENT_KEY = process.env.SPOTIFY_CLIENT_KEY;

/**
 * Must be defined if NODE_ENV is not "test"
 */
export const FIREBASE_SERVICE_ACCOUNT_KEY =
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

export const GOOGLE_OAUTH_CONFIG = {
  client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirect_uri: process.env.REDIRECT_URI,
};

export const loggerConfig = {
  enableHttpLogPrinting: false, // Whether to print HTTP logs to console
  logLevel: "info" as const, // Default log level
};

// Grafana Cloud configuration for observability
export const GRAFANA_LOKI_HOST = process.env.GRAFANA_LOKI_HOST;
export const GRAFANA_LOKI_USER = process.env.GRAFANA_LOKI_USER;
export const GRAFANA_LOKI_TOKEN = process.env.GRAFANA_LOKI_TOKEN;
export const CLUSTER_NAME = process.env.CLUSTER_NAME || "tunele-local";

// Metrics endpoint authentication token (shared between API and Grafana Agent)
export const METRICS_AUTH_TOKEN = process.env.METRICS_AUTH_TOKEN;

// Redis configuration
const redisUrlRegex =
  /^redis(s)?:\/\/(?:(?:[^:@]+:)?[^:@]*@)?(?:[^:@]+)(?::\d+)?(?:\/\d+)?$/;
export const REDIS_URL = process.env.REDIS_URL;
if (!redisUrlRegex.test(REDIS_URL || "") && NODE_ENV !== "test")
  throw new Error("Invalid REDIS_URL format");
