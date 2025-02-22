import { SavedGameData } from "../types";
import api from "../utils/axios";

/**
 * Fetches user data from the API.
 *
 * @param id the user ID
 * @returns the user data
 */
export const fetchUserData = async (id: string): Promise<SavedGameData> => {
  const response = await api.get<SavedGameData>(`/user/${id}/fetch-data`);
  return response.data;
};

/**
 * Syncs local user data to the API.
 *
 * @param id the user ID
 * @param data the user data
 */
export const syncUserData = async (
  id: string,
  data: SavedGameData
): Promise<void> => {
  await api.post(`/user/${id}/post-data`, data);
};
