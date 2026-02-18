import axios from "axios";
import { logout } from "@/api/auth";
import { AxiosApiError } from "@/types";
import { useUserStore } from "@/store/user.store";
import { pushError } from "@/lib/faro";
import { getStickyCorrelationId } from "@/utils/stickyCorrelationId";

export const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:7600";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Add correlation ID to all outgoing requests
api.interceptors.request.use((config) => {
  config.headers["X-Correlation-ID"] = getStickyCorrelationId();
  return config;
});

// Concurrent refresh protection
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosApiError) => {
    if (error.response) {
      const { status } = error.response;
      const requestUrl = error.config?.url || "";

      // Handle 401 errors with concurrent refresh protection
      // Don't retry if the error is from auth endpoints (prevents infinite loop)
      if (
        status === 401 &&
        !requestUrl.includes("/auth/verify") &&
        !requestUrl.includes("/auth/callback")
      ) {
        // If already refreshing, wait for the ongoing refresh
        if (isRefreshing && refreshPromise) {
          try {
            await refreshPromise;
            // Retry the original request
            if (error.config) {
              return api.request(error.config);
            }
          } catch {
            // Refresh failed, redirect to login
            await logout();
            return Promise.reject(error);
          }
        }

        // Start a new refresh
        isRefreshing = true;
        refreshPromise = (async () => {
          try {
            // For session-based auth, checkAuth re-validates the session
            // If session is expired, backend returns 401 and we logout
            await useUserStore.getState().checkAuth();
          } catch (err) {
            console.error("Session refresh failed:", err);
            await logout();
            throw err;
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        })();

        try {
          await refreshPromise;
          // Retry the original request
          if (error.config) {
            return api.request(error.config);
          }
        } catch {
          // Refresh failed, error already logged
          return Promise.reject(error);
        }
      }
    } else {
      pushError(error, {
        correlationId: getStickyCorrelationId(),
        url: error.config?.url ?? "unknown",
      });
    }
    return Promise.reject(error);
  },
);

export default api;
