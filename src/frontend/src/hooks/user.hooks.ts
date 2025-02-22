import { useEffect, useState } from "react";
import { logout, verifyAccessToken } from "../api/auth";
import { toastError, toastSuccess } from "../utils/toast.utils";
import { fetchUserData, syncUserData } from "../api/user";
import { fetchSavedData, mergeGameData } from "../utils/data.utils";
import { useQuery } from "@tanstack/react-query";
import { SavedGameData } from "../types";

const googleSsoParams = {
  redirect_uri: import.meta.env.VITE_OAUTH_REDIRECT_URI,
  client_id: import.meta.env.VITE_OAUTH_CLIENT_ID,
};

/**
 * Hook for user data and authentication.
 *
 * @returns user data and authentication functions
 */
export const useUser = () => {
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [id, setId] = useState<string>("");

  const userQuery = useQuery({
    queryKey: ["user", id],
    queryFn: verifyAccessToken,
  });

  /**
   * Updates local state with user data from the remote.
   */
  useEffect(() => {
    if (userQuery.data) {
      const { given_name, id } = userQuery.data;
      setSignedIn(true);
      setUsername(given_name);
      setId(id);
    }
  }, [userQuery.data]);

  /**
   * Redirects the user to the Google login page.
   */
  const handleGoogleLogin = () => {
    const baseUrl = "https://accounts.google.com";
    const endpoint = "/o/oauth2/v2/auth";
    const queryParams = {
      ...googleSsoParams,
      prompt: "consent",
      response_type: "code",
      scope: "email profile",
      access_type: "offline",
    };
    const url = new URL(endpoint, baseUrl);
    url.search = new URLSearchParams(queryParams).toString();
    window.location.href = url.href;
  };

  /**
   * Logs the user out and sets local signed in state to false.
   */
  const handleLogout = async () => {
    await logout();
    setSignedIn(false);
  };

  /**
   * Updates local data with data from the remote.
   */
  const updateLocalData = async () => {
    try {
      const remote = await fetchUserData(id);

      const local = fetchSavedData();
      const dataToMerge = mergeGameData(local, remote);
      localStorage.setItem("userData", JSON.stringify(dataToMerge));

      toastSuccess("Successfully updated local data! Reloading page...");
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } catch {
      toastError("There was an error pulling your cloud data");
    }
  };

  /**
   * Syncs local data to the remote.
   */
  const syncDataToRemote = async () => {
    try {
      const data = localStorage.getItem("userData");
      if (!data) {
        toastError("There was an error saving your data");
        return;
      }
      const local: SavedGameData = data as unknown as SavedGameData;
      await syncUserData(id, local);
      toastSuccess("Successfully saved data to cloud!");
    } catch {
      toastError("There was an error saving your data");
    }
  };

  return {
    signedIn,
    username,
    id,
    handleGoogleLogin,
    handleLogout,
    updateLocalData,
    syncDataToRemote,
  };
};

/**
 * React hook to load user data from local storage.
 *
 * @param dependencies the dependencies to watch for changes
 * @returns the user data
 */
export const useLoadUserData = (dependencies?: unknown) => {
  const [userData, setUserData] = useState<SavedGameData>({
    main: [],
    custom: {},
  });

  useEffect(() => {
    const userData = fetchSavedData();
    setUserData(userData);
  }, [dependencies]);

  return userData;
};

/**
 * React hook to check if the user is a first time user.
 *
 * @param openHelpModal function to set the help modal state
 */
export const useFirstTimeUser = (openHelpModal: (state: boolean) => void) => {
  useEffect(() => {
    if (localStorage.getItem("firstTimeUser") !== "false") {
      localStorage.setItem("firstTimeUser", "false");
      openHelpModal(true);
    }
  });
};
