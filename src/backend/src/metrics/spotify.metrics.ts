import { createMetrics, BUCKET_PRESETS } from "@/metrics/registry";

/**
 * Create Spotify API metrics using the factory pattern
 */
const m = createMetrics("spotify_api");

const requestsTotal = m.counter(
  "requests_total",
  "Total number of Spotify API requests",
  ["endpoint", "status", "status_code"],
);

const duration = m.histogram(
  "duration_seconds",
  "Spotify API request duration in seconds",
  {
    labels: ["endpoint"],
    buckets: BUCKET_PRESETS.slow,
  },
);

/**
 * Public interface for recording Spotify API metrics
 */
export const spotifyMetrics = {
  /**
   * Record a Spotify API call with enhanced tracking
   *
   * @param endpoint - The Spotify API endpoint (e.g., "token", "playlist", "tracks")
   * @param status - The status of the request ("success" or "error")
   * @param durationSeconds - The duration of the request in seconds
   * @param statusCode - Optional HTTP status code
   */
  recordRequest(
    endpoint: string,
    status: "success" | "error",
    durationSeconds: number,
    statusCode?: number,
  ): void {
    const labels: Record<string, string> = { endpoint, status };
    if (statusCode !== undefined) {
      labels.status_code = statusCode.toString();
    }
    requestsTotal.inc(labels);
    duration.observe({ endpoint }, durationSeconds);
  },
};
