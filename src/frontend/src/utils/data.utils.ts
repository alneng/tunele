import { GameState } from "@/store/game.store";
import { GameResult, SavedGameData } from "@/types";

/**
 * Merges two data sources, giving priority to existing data
 *
 * @param existingData data already saved on the client
 * @param newData data coming from the server
 * @returns the new merged data
 */
export const mergeGameData = (
  existingData: SavedGameData,
  newData: SavedGameData
): SavedGameData => {
  const result = { ...existingData };

  result.main = mergeArrays(existingData.main, newData.main);

  if (!existingData.custom) {
    result.custom = { ...newData.custom };
  } else {
    result.custom = { ...existingData.custom };
    for (const key in newData.custom) {
      if (!result.custom[key]) {
        result.custom[key] = newData.custom[key];
      } else {
        result.custom[key] = mergeArrays(
          result.custom[key],
          newData.custom[key]
        );
      }
    }
  }
  return result;
};

// Helper function to merge arrays of GameResult, giving priority to existing data
const mergeArrays = (existingArray: GameResult[], newArray: GameResult[]) => {
  if (!newArray) return existingArray;

  const uniqueIds = new Set(existingArray.map((game: GameResult) => game.id));
  const newData = newArray.filter(
    (game: GameResult) => !uniqueIds.has(game.id)
  );

  const concat_array = existingArray.concat(newData);
  return concat_array.sort((a: GameResult, b: GameResult) => a.id - b.id);
};

/**
 * Migrates data from the old storage format (v0) to the new one (v1). If the old storage
 * does not exist, it returns the current state's saved data.
 *
 * @param state the current store state
 * @returns the new saved data
 */
export const migrateFromOldStorage = (state: GameState) => {
  const originalStore = window.localStorage.getItem("userData");

  if (originalStore) {
    console.log("Attempting to migrate data from v0 to v1");

    console.debug("Backing up original store");
    window.localStorage.setItem("userDataBackup", originalStore);

    try {
      const originalStoreData = JSON.parse(originalStore) as SavedGameData;
      console.log("Successfully migrated data from v0 to v1");
      window.localStorage.removeItem("userData");
      return mergeGameData(originalStoreData, state.savedData);
    } catch (error) {
      console.log("An error happened during migration from v0 to v1", error);
    }
  }

  return state.savedData;
};
