import { createMetrics, BUCKET_PRESETS } from "@/metrics/registry";

/**
 * Create Redis metrics using the factory pattern
 */
const m = createMetrics("redis");

const operationsTotal = m.counter(
  "operations_total",
  "Total number of Redis operations",
  ["operation", "status"],
);

const operationDuration = m.histogram(
  "operation_duration_seconds",
  "Redis operation duration in seconds",
  {
    labels: ["operation"],
    buckets: BUCKET_PRESETS.fast,
  },
);

const connectionStatus = m.gauge(
  "connection_status",
  "Redis connection status (1 = connected, 0 = disconnected)",
);

const cacheHitsTotal = m.counter("cache_hits_total", "Total cache hits", [
  "operation",
]);

const cacheMissesTotal = m.counter("cache_misses_total", "Total cache misses", [
  "operation",
]);

/**
 * Public interface for recording Redis metrics
 */
export const redisMetrics = {
  /**
   * Record a Redis operation with cache hit/miss tracking
   *
   * @param operation - The Redis operation (e.g., "getString", "setString", "getJSON")
   * @param status - The status of the operation ("success" or "error")
   * @param durationSeconds - The duration of the operation in seconds
   * @param isCacheOperation - Whether this is a cache read operation
   * @param isHit - Whether this cache operation was a hit (only relevant if isCacheOperation is true)
   */
  recordOperation(
    operation: string,
    status: "success" | "error",
    durationSeconds: number,
    isCacheOperation = false,
    isHit = false,
  ): void {
    operationsTotal.inc({ operation, status });
    operationDuration.observe({ operation }, durationSeconds);

    // Track cache hits/misses for cache read operations that succeeded
    if (isCacheOperation && status === "success") {
      if (isHit) {
        cacheHitsTotal.inc({ operation });
      } else {
        cacheMissesTotal.inc({ operation });
      }
    }
  },

  /**
   * Update Redis connection status
   *
   * @param connected - Whether Redis is connected
   */
  setConnectionStatus(connected: boolean): void {
    connectionStatus.set(connected ? 1 : 0);
  },
};
