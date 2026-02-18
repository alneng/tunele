import { createMetrics, BUCKET_PRESETS } from "./registry";

/**
 * Create HTTP metrics using the factory pattern
 */
const m = createMetrics("http");

export const httpRequestsTotal = m.counter(
  "requests_total",
  "Total number of HTTP requests",
  ["method", "route", "status_code"],
);

export const httpRequestDuration = m.histogram(
  "request_duration_seconds",
  "HTTP request duration in seconds",
  {
    labels: ["method", "route", "status_code"],
    buckets: BUCKET_PRESETS.medium,
  },
);

export const httpRequestsInFlight = m.gauge(
  "requests_in_flight",
  "Number of HTTP requests currently being processed",
);
