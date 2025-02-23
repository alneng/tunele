import { GameResult, SavedGameData } from "@/types";

/**
 * Merges two data sources, giving priority to existing data
 *
 * @param existingData data already saved on the client
 * @param newData data coming from the server
 * @returns the new merged data
 */
export function mergeGameData(
  existingData: SavedGameData,
  newData: SavedGameData
): SavedGameData {
  existingData.main = mergeArrays(existingData.main, newData.main);

  if (!existingData.custom) {
    existingData.custom = newData.custom;
  } else {
    for (const key in newData.custom) {
      if (!existingData.custom[key]) {
        existingData.custom[key] = newData.custom[key];
      } else {
        existingData.custom[key] = mergeArrays(
          existingData.custom[key],
          newData.custom[key]
        );
      }
    }
  }
  return existingData;
}

function mergeArrays(existingArray: GameResult[], newArray: GameResult[]) {
  if (!newArray) return existingArray;

  const uniqueIds = new Set(existingArray.map((game: GameResult) => game.id));
  const newData = newArray.filter(
    (game: GameResult) => !uniqueIds.has(game.id)
  );

  const concat_array = existingArray.concat(newData);
  const sorted_array = concat_array.sort(
    (a: GameResult, b: GameResult) => a.id - b.id
  );
  return sorted_array;
}

/**
 * Fetches saved data from local storage.
 *
 * @returns the saved data
 */
export function fetchSavedData(): SavedGameData {
  return JSON.parse(
    localStorage.getItem("userData") ?? '{ "main": [], "custom": {} }'
  );
}
