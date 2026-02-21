import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from "prom-client";
import config from "@/config";

/**
 * Histogram bucket presets for different use cases
 */
export const BUCKET_PRESETS = {
  // For fast operations like Redis (1ms - 1s)
  fast: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  // For medium operations like internal APIs (5ms - 10s)
  medium: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  // For slow operations like external APIs (50ms - 30s)
  slow: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 15, 30],
};

/**
 * Shared Prometheus registry for all metrics
 */
export const registry = new Registry();

// Set default labels - cluster will be added by Grafana Agent
registry.setDefaultLabels({
  app: "tunele-api",
  env: config.env,
});

// Collect default Node.js metrics
collectDefaultMetrics({
  register: registry,
  prefix: "tunele_",
});

/**
 * Factory function to create metrics with automatic naming prefix.
 * All metrics created with this factory are automatically registered on the shared registry.
 *
 * @param subsystem - The subsystem name (e.g., "http", "spotify_api", "redis")
 * @returns Object with counter, histogram, and gauge factory methods
 */
export function createMetrics(subsystem: string) {
  return {
    counter: <T extends string = string>(
      name: string,
      help: string,
      labelNames?: readonly T[],
    ): Counter<T> => {
      return new Counter<T>({
        name: `tunele_${subsystem}_${name}`,
        help,
        ...(labelNames && { labelNames }),
        registers: [registry],
      });
    },

    histogram: <T extends string = string>(
      name: string,
      help: string,
      options?: { labels?: readonly T[]; buckets?: number[] },
    ): Histogram<T> => {
      return new Histogram<T>({
        name: `tunele_${subsystem}_${name}`,
        help,
        ...(options?.labels && { labelNames: options.labels }),
        ...(options?.buckets && { buckets: options.buckets }),
        registers: [registry],
      });
    },

    gauge: <T extends string = string>(
      name: string,
      help: string,
      labelNames?: readonly T[],
    ): Gauge<T> => {
      return new Gauge<T>({
        name: `tunele_${subsystem}_${name}`,
        help,
        ...(labelNames && { labelNames }),
        registers: [registry],
      });
    },
  };
}

/**
 * Application info metric (useful for version tracking)
 */
const appInfo = new Gauge({
  name: "tunele_app_info",
  help: "Application information",
  labelNames: ["version", "node_version"],
  registers: [registry],
});

appInfo.set(
  {
    version: config.version,
    node_version: process.version,
  },
  1,
);

/**
 * Create a timer helper for measuring operation duration.
 * Returns a function that when called, returns the elapsed time in seconds.
 *
 * @returns A function that returns elapsed time in seconds
 */
export function startTimer(): () => number {
  const start = process.hrtime.bigint();
  return () => Number(process.hrtime.bigint() - start) / 1e9;
}

/**
 * Get the content type for Prometheus metrics
 */
export function getContentType(): string {
  return registry.contentType;
}

/**
 * Get all metrics as a string
 */
export async function getMetrics(): Promise<string> {
  return registry.metrics();
}
