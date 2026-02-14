import { defineConfig, PluginOption } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import faroUploader from "@grafana/faro-rollup-plugin";

/**
 * Create the Faro source map uploader plugin.
 * @returns The Faro source map uploader plugin. Only enabled if all required environment variables are set.
 */
function createFaroUploaderPlugin(): PluginOption | undefined {
  const requiredEnvVars = {
    VITE_FARO_APP_NAME: process.env.VITE_FARO_APP_NAME,
    FARO_SOURCE_MAP_ENDPOINT: process.env.FARO_SOURCE_MAP_ENDPOINT,
    FARO_APP_ID: process.env.FARO_APP_ID,
    FARO_STACK_ID: process.env.FARO_STACK_ID,
    FARO_SOURCE_MAP_API_KEY: process.env.FARO_SOURCE_MAP_API_KEY,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => value === undefined)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.warn(
      "Faro source map uploader disabled. Missing environment variables:",
      missingVars.join(", "),
    );
    return undefined;
  }

  return faroUploader({
    appName: requiredEnvVars.VITE_FARO_APP_NAME!.trim(),
    endpoint: requiredEnvVars.FARO_SOURCE_MAP_ENDPOINT!.trim(),
    appId: requiredEnvVars.FARO_APP_ID!.trim(),
    stackId: requiredEnvVars.FARO_STACK_ID!.trim(),
    apiKey: requiredEnvVars.FARO_SOURCE_MAP_API_KEY!.trim(),
    verbose: true,
    gzipContents: true,
    skipUpload: process.env.NODE_ENV !== "production",
    keepSourcemaps: true,
  }) as PluginOption;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), createFaroUploaderPlugin()],
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
