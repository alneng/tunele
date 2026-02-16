import _ from "lodash";
import db from "../lib/firebase";
import { mergeGameData } from "../utils/user.utils";
import { SavedGameData } from "../types/game.types";
import { FirebaseUser } from "../types/firebase.types";
import { HttpException } from "../utils/errors.utils";
import { log } from "../utils/logger.utils";

export default class UserService {
  /**
   * Get a user's saved data
   *
   * @param userId the user id (Google sub)
   * @returns the user's saved data
   */
  static async getUserData(
    userId: string,
  ): Promise<{ status: number; message: SavedGameData }> {
    const data = await db.getDocument<FirebaseUser>("users", userId);

    if (!data) {
      log.error("Couldn't find user in database but session is valid", {
        meta: { userId },
      });
      throw new HttpException(404, "User not found");
    }

    if (data.data) {
      return { status: 200, message: data.data };
    }

    // User document has no game data
    const defaultData = { main: [], custom: {} };
    await db.updateDocument<Partial<FirebaseUser>>("users", userId, {
      data: defaultData,
    });
    return { status: 200, message: defaultData };
  }

  /**
   * Update a user's saved data
   *
   * @param userId the user id (Google sub)
   * @param bodyData the data to save for the user
   * @returns the user's saved data
   */
  static async updateUserData(
    userId: string,
    bodyData: SavedGameData,
  ): Promise<{ status: number; message: SavedGameData }> {
    const savedData = await db.getDocument<FirebaseUser>("users", userId);

    if (!savedData) {
      log.error("Couldn't find user in database but session is valid", {
        meta: { userId },
      });
      throw new HttpException(404, "User not found");
    }

    const gameData = savedData.data;

    // User does not have any data saved
    if (!gameData) {
      const defaultData = { main: [], custom: {} };
      // Update existing document with default data
      await db.updateDocument<Partial<FirebaseUser>>("users", userId, {
        data: defaultData,
      });
      return { status: 200, message: defaultData };
    }

    // User already has data saved and it is the same as the data to save
    if (_.isEqual(gameData, bodyData)) {
      return { status: 200, message: gameData };
    }

    // User already has data saved and it is different from the data to save
    const mergedData = mergeGameData(gameData, bodyData);
    await db.updateDocument<Partial<FirebaseUser>>("users", userId, {
      data: mergedData,
    });
    return { status: 201, message: mergedData };
  }
}
