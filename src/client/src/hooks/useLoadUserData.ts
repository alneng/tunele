import { useEffect, useState } from "react";
import { fetchSavedData } from "../utils/saved-data.utils";

import SavedGameData from "../types/SavedGameData";

/**
 * React hook to load user data from local storage
 *
 * @param dependencies the dependencies to watch for changes
 * @returns the user data
 */
const useLoadUserData = (dependencies?: unknown) => {
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

export default useLoadUserData;
