/* Types */

interface AppConfig {
  env: string;
  port: number;
  clusterName: string;
  version: string;

  cors: Record<string, unknown>;
  cookie: Record<string, unknown>;

  spotify: {
    clientKey: string;
  };

  firebase: {
    serviceAccountKey: string;
  };

  googleOAuth: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  };

  redis: {
    url: string;
  };

  session: {
    encryptionKey: string;
    ttlSeconds: number;
  };

  grafana: {
    lokiHost: string;
    lokiUser: string;
    lokiToken: string;
  };

  metrics: {
    authToken: string;
  };

  logger: {
    enableHttpLogPrinting: boolean;
    logLevel: "info" | "debug" | "warn" | "error";
  };
}

/* Helpers */

class MissingEnvVariableError extends Error {
  constructor(name: string) {
    super(`Missing required environment variable: ${name}`);
    this.name = "MissingEnvVariableError";
  }
}

/**
 * Reads an env var. If `fallback` is provided, returns it when the value is missing.
 * Otherwise returns undefined when missing.
 */
function env(name: string, fallback: string): string;
function env(name: string): string | undefined;
function env(name: string, fallback?: string): string | undefined {
  return process.env[name] ?? fallback;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new MissingEnvVariableError(name);
  return value;
}

function requireJson(name: string): Record<string, unknown> {
  const raw = requireEnv(name);
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Environment variable ${name} is not valid JSON`);
  }
}

/* Validation */

const REDIS_URL_REGEX = /^redis(s)?:\/\/(?:(?:[^:@]+:)?[^:@]*@)?(?:[^:@]+)(?::\d+)?(?:\/\d+)?$/;

function validateConfig(config: AppConfig): void {
  if (!REDIS_URL_REGEX.test(config.redis.url)) {
    throw new Error(`Invalid REDIS_URL format: ${config.redis.url}`);
  }
}

/* Loaders */

function loadTestConfig(): AppConfig {
  const TEST_ENCRYPTION_KEY = "6ce826c13ed5c151b8987bec062ad73fbd3e3d998442bd6209ae9852bc64cb4d";

  return {
    env: "test",
    port: 7600,
    clusterName: "tunele-test",
    version: "test",
    cors: {},
    cookie: {},
    spotify: { clientKey: "test-spotify-key" },
    firebase: { serviceAccountKey: "{}" },
    googleOAuth: { clientId: "", clientSecret: "", redirectUri: "" },
    redis: { url: "redis://localhost:6379" },
    session: { encryptionKey: TEST_ENCRYPTION_KEY, ttlSeconds: 604800 },
    grafana: { lokiHost: "", lokiUser: "", lokiToken: "" },
    metrics: { authToken: "" },
    logger: { enableHttpLogPrinting: false, logLevel: "info" },
  };
}

function loadConfig(): AppConfig {
  const nodeEnv = env("NODE_ENV", "development");

  if (nodeEnv === "test") return loadTestConfig();

  const config: AppConfig = {
    env: nodeEnv,
    port: Number(env("PORT", "7600")),
    clusterName: env("CLUSTER_NAME", "tunele-local"),
    version: env("npm_package_version", "unknown"),

    cors: requireJson("CORS_OPTIONS"),
    cookie: requireJson("COOKIE_SETTINGS"),

    spotify: {
      clientKey: requireEnv("SPOTIFY_CLIENT_KEY"),
    },

    firebase: {
      serviceAccountKey: requireEnv("FIREBASE_SERVICE_ACCOUNT_KEY"),
    },

    googleOAuth: {
      clientId: requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
      clientSecret: requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
      redirectUri: requireEnv("REDIRECT_URI"),
    },

    redis: {
      url: requireEnv("REDIS_URL"),
    },

    session: {
      encryptionKey: requireEnv("SESSION_ENCRYPTION_KEY"),
      ttlSeconds: parseInt(env("SESSION_TTL_SECONDS", "604800"), 10),
    },

    grafana: {
      lokiHost: env("GRAFANA_LOKI_HOST") ?? "",
      lokiUser: env("GRAFANA_LOKI_USER") ?? "",
      lokiToken: env("GRAFANA_LOKI_TOKEN") ?? "",
    },

    metrics: {
      authToken: env("METRICS_AUTH_TOKEN") ?? "",
    },

    logger: {
      enableHttpLogPrinting: false,
      logLevel: "info",
    },
  };

  validateConfig(config);

  return Object.freeze(config);
}

/* Singleton */

let _config: AppConfig | null = null;

/**
 * Returns the app config singleton, initializing it on first call.
 */
export function getConfig(): AppConfig {
  if (!_config) _config = loadConfig();
  return _config;
}

export default getConfig();

export type { AppConfig };
