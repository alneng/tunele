import { initializeFaro, getWebInstrumentations, type Faro, LogLevel } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

/**
 * Grafana Faro instance for frontend observability.
 * Captures errors, performance metrics, and web vitals.
 */
let faro: Faro | null = null;

/**
 * Initialize Grafana Faro for frontend observability.
 * Only initializes if VITE_FARO_COLLECTOR_URL and VITE_FARO_APP_NAME are configured.
 */
export function initFaro(): Faro | null {
  const faroCollectorUrl = import.meta.env.VITE_FARO_COLLECTOR_URL;
  const faroAppName = import.meta.env.VITE_FARO_APP_NAME;

  // Skip initialization if not configured
  if (!faroCollectorUrl || !faroAppName) {
    console.log(
      "Faro: VITE_FARO_COLLECTOR_URL or VITE_FARO_APP_NAME not configured, skipping initialization",
    );
    return null;
  }

  if (faro) {
    return faro;
  }

  try {
    faro = initializeFaro({
      url: faroCollectorUrl,
      app: {
        name: faroAppName,
        version: import.meta.env.VITE_APP_VERSION || "1.0.0",
        environment: import.meta.env.MODE || "development",
      },
      instrumentations: [
        ...getWebInstrumentations({
          captureConsole: true,
        }),
        // Tracing package to get end-to-end visibility for HTTP requests.
        new TracingInstrumentation(),
      ],
    });

    console.log("Faro: Successfully initialized");
    return faro;
  } catch (error) {
    console.error("Faro: Failed to initialize", error);
    return null;
  }
}

/**
 * Push an error to Faro for tracking.
 * Safe to call even if Faro is not initialized.
 */
export function pushError(error: Error, context?: Record<string, string>): void {
  if (faro?.api) {
    faro.api.pushError(error, { context });
  }
}

/**
 * Push a log message to Faro.
 * Safe to call even if Faro is not initialized.
 */
export function pushLog(
  message: string,
  level: LogLevel = LogLevel.INFO,
  context?: Record<string, string>,
): void {
  if (faro?.api) {
    faro.api.pushLog([message], { level, context });
  }
}
