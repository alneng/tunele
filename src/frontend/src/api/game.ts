import { GameChoices, GameTrack } from "../types";
import api from "../utils/axios";

/**
 * Fetch the main game track.
 *
 * @returns the main game track
 */
export const fetchMainGame = async (): Promise<GameTrack> => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await api.get<GameTrack>(`/dailySong?timeZone=${timezone}`);
  return response.data;
};

/**
 * Fetch the main game track choices.
 *
 * @returns the main game choices
 */
export const fetchMainGameChoices = async (): Promise<GameChoices> => {
  const response = await api.get<GameChoices>("/allSongs");
  return response.data;
};

/**
 * Fetch the track for a custom game.
 *
 * @param data a data object
 * - `playlist` - the playlist id
 * - `r` - whether to force reload the playlist
 * @returns the track for a custom game
 */
export const fetchCustomGame = async (data: {
  playlist: string | null;
  r: boolean;
}): Promise<GameTrack | null> => {
  if (!data.playlist) return null;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await api.get<GameTrack>(
    `/playlist/${data.playlist}/dailySong?timeZone=${timezone}${
      data.r ? "&r=1" : ""
    }`
  );
  return response.data;
};

/**
 * Fetch the track choices for a custom game.
 *
 * @param playlist the playlist id
 * @returns the track choices for a custom game
 */
export const fetchCustomGameChoices = async (
  playlist: string | null
): Promise<GameChoices | null> => {
  if (!playlist) return null;
  const response = await api.get<GameChoices>(`/playlist/${playlist}/allSongs`);
  return response.data;
};

/**
 * Post the main game stats.
 *
 * @param score the score
 */
export const postMainGameStats = async (score: number): Promise<void> => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  await api.post("/stats", { score, timeZone });
};

/**
 * Post the custom game stats.
 *
 * @param playlist the playlist id
 * @param score the score
 */
export const postCustomGameStats = async (
  playlist: string,
  score: number
): Promise<void> => {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  await api.post(`/playlist/${playlist}/stats`, { score, timeZone });
};
