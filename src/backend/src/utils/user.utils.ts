import { GameResult, SavedGameData } from "../types";

/**
 * Merges user data stored in the server with incoming data from the client.
 * Gives priority to data already saved in the server
 *
 * @param serverData the data on the server
 * @param clientData the data to be saved to the server
 * @returns the new merged server and client data
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

/**
 * Merges two arrays of game results.
 * Gives priority to existing data already saved in the server
 *
 * @param existingArray the existing data
 * @param newArray the new data
 * @returns the new merged data
 */
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
