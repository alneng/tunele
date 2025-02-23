import axios from "axios";
import { logout, refreshUserSession } from "@/api/auth";
import { AxiosApiError } from "@/types";

export const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:7600";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Add a response interceptor to redirect unauthenticated requests to login
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosApiError) => {
    if (error.response) {
      const { status, data } = error.response;
      if ((status === 401 || status === 500) && data?.retry) {
        try {
          await refreshUserSession();
        } catch (error) {
          console.error(error);
          await logout();
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
