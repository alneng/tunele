import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { logout, verifyAccessToken } from "@/api/auth";
import { fetchUserData, syncUserData } from "@/api/user";
import { useGameStore } from "./game.store";
import { AxiosApiError } from "@/types";

interface UserState {
  // User authentication state
  signedIn: boolean;
  username: string;
  id: string;
  isLoading: boolean;
  error: AxiosApiError | null;

  // Has the auth state been initialized?
  init: boolean;

  // Actions
  /**
   * Check the user authentication status.
   */
  checkAuth: () => Promise<void>;
  /**
   * Handles user login through Google OAuth.
   */
  login: () => void;
  /**
   * Handles user logout.
   */
  logout: () => Promise<void>;
  /**
   * Sync data from server to local storage.
   */
  syncDataFromServer: () => Promise<void>;
  /**
   * Sync data from local storage to server.
   */
  syncDataToServer: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set, get) => ({
      // User state
      signedIn: false,
      username: "",
      id: "",
      isLoading: false,
      error: null,

      // Initialization state
      init: false,

      checkAuth: async () => {
        set(
          { isLoading: true, error: null, init: true },
          undefined,
          "checkAuth/init"
        );

        try {
          const userData = await verifyAccessToken();

          if (userData) {
            const { given_name, id } = userData;
            set(
              {
                signedIn: true,
                username: given_name,
                id,
              },
              undefined,
              "checkAuth/success"
            );
          } else {
            set(
              {
                signedIn: false,
                username: "",
                id: "",
              },
              undefined,
              "checkAuth/noUser"
            );
          }
        } catch (error) {
          set(
            {
              signedIn: false,
              username: "",
              id: "",
              error: error as AxiosApiError,
            },
            undefined,
            "checkAuth/error"
          );
        } finally {
          set({ isLoading: false }, undefined, "checkAuth/done");
        }
      },

      login: () => {
        const baseUrl = "https://accounts.google.com";
        const endpoint = "/o/oauth2/v2/auth";
        const queryParams = {
          redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
          client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
          prompt: "consent",
          response_type: "code",
          scope: "email profile",
          access_type: "offline",
        };
        const url = new URL(endpoint, baseUrl);
        url.search = new URLSearchParams(queryParams).toString();
        window.location.href = url.href;
      },

      logout: async () => {
        set({ isLoading: true }, undefined, "logout/init");

        try {
          await logout();
          set(
            {
              signedIn: false,
              username: "",
              id: "",
              isLoading: false,
            },
            undefined,
            "logout/success"
          );
        } catch (error) {
          set(
            {
              isLoading: false,
              error: error as AxiosApiError,
            },
            undefined,
            "logout/error"
          );
        } finally {
          set({ isLoading: false }, undefined, "logout/done");
        }
      },

      syncDataFromServer: async () => {
        const { id } = get();
        if (!id) return;

        try {
          set({ error: null }, undefined, "syncDataFromServer");
          const remoteData = await fetchUserData(id);
          // Merge with local data in game store
          useGameStore.getState().mergeWithRemoteData(remoteData);
        } catch (error) {
          set(
            { error: error as AxiosApiError },
            undefined,
            "syncDataFromServer/error"
          );
          throw error;
        }
      },

      syncDataToServer: async () => {
        const { id } = get();
        if (!id) return;

        try {
          set({ error: null }, undefined, "syncDataToServer");
          const localData = useGameStore.getState().savedData;
          // Sync to server
          await syncUserData(id, localData);
        } catch (error) {
          set(
            { error: error as AxiosApiError },
            undefined,
            "syncDataToServer/error"
          );
          throw error;
        }
      },
    }),
    { name: "tunele-user-auth-store", enabled: import.meta.env.DEV }
  )
);
