import _ from "lodash";
import db from "../lib/firebase";
import { mergeGameData } from "../utils/user.utils";
import { SavedGameData } from "../types";
import { HttpException } from "../utils/errors.utils";

export default class UserService {
  /**
   * Get a user's saved data (session-based auth)
   *
   * @param userId the user id (Google sub)
   * @returns the user's saved data
   */
  static async getUserDataWithSession(
    userId: string,
  ): Promise<{ status: number; message: SavedGameData }> {
    const data: { email: string; data: SavedGameData } | null =
      await db.getDocument("users", userId);

    if (data && data.data) {
      return { status: 200, message: data.data };
    }

    // User document might exist without data field (legacy)
    if (data) {
      const defaultData = { main: [], custom: {} };
      await db.updateDocument("users", userId, { data: defaultData });
      return { status: 200, message: defaultData };
    }

    // User document doesn't exist (shouldn't happen if session is valid)
    throw new HttpException(404, "User not found");
  }

  /**
   * Update a user's saved data (session-based auth)
   *
   * @param userId the user id (Google sub)
   * @param bodyData the data to save for the user
   * @param email the user's email from session
   * @returns the user's saved data
   */
  static async updateUserDataWithSession(
    userId: string,
    bodyData: SavedGameData,
    email: string,
  ): Promise<{ status: number; message: SavedGameData }> {
    const savedData: { email: string; data: SavedGameData } | null =
      await db.getDocument("users", userId);

    let gameData: SavedGameData | undefined = savedData?.data;

    if (!gameData) {
      gameData = { main: [], custom: {} };
      if (!savedData) {
        // Create new user document
        await db.createDocument("users", userId, {
          data: gameData,
          email: email,
          googleSub: userId,
          lastLoginAt: new Date().toISOString(),
        });
      } else {
        // Update existing document with data field
        await db.updateDocument("users", userId, {
          data: gameData,
        });
      }
    }

    if (_.isEqual(gameData, bodyData)) {
      return { status: 200, message: gameData };
    }

    const mergedData = mergeGameData(gameData, bodyData);
    await db.updateDocument("users", userId, { data: mergedData });

    return {
      status: 201,
      message: mergedData,
    };
  }

}
