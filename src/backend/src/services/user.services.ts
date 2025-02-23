import _ from "lodash";
import {
  doesAccessIdTokenExist,
  getIdTokenAuthStatus,
  getAccessTokenAuthStatus,
} from "../utils/auth.utils";
import db from "../utils/firebase.utils";
import { mergeGameData } from "../utils/user.utils";
import { SavedGameData } from "../types";

export default class UserService {
  /**
   * Get a user's saved data
   *
   * @param userId the user id to get the data of
   * @param accessToken auth access token
   * @param idToken auth id token
   * @param refreshToken auth refresh token
   * @throws AccessDeniedException if bad access or id token
   * @returns the user's saved data
   */
  static async getUserData(
    userId: string,
    accessToken: string,
    idToken: string,
    refreshToken: string
  ): Promise<{ status: number; message: SavedGameData }> {
    doesAccessIdTokenExist(accessToken, idToken, refreshToken);
    await getIdTokenAuthStatus(idToken);
    const { email, id } = await getAccessTokenAuthStatus(accessToken, userId);

    const data: { email: string; data: SavedGameData } | null =
      await db.getDocument("users", id);
    if (data) return { status: 200, message: data.data };

    const doc: { email: string; data: SavedGameData } = {
      data: { main: [], custom: {} },
      email: email,
    };
    await db.createDocument("users", id, doc);

    return {
      status: 201,
      message: doc.data,
    };
  }

  /**
   * Update a user's saved data
   *
   * @param userId the user id to get the data of
   * @param bodyData the data to save for the user
   * @param accessToken auth access token
   * @param idToken auth id token
   * @param refreshToken auth refresh token
   * @throws AccessDeniedException if bad access or id token
   * @returns the user's saved data
   */
  static async updateUserData(
    userId: string,
    bodyData: SavedGameData,
    accessToken: string,
    idToken: string,
    refreshToken: string
  ): Promise<{ status: number; message: SavedGameData }> {
    doesAccessIdTokenExist(accessToken, idToken, refreshToken);
    await getIdTokenAuthStatus(idToken);
    const { email, id } = await getAccessTokenAuthStatus(accessToken, userId);

    const savedData: { email: string; data: SavedGameData } | null =
      await db.getDocument("users", id);
    let gameData: SavedGameData | undefined = savedData?.data;
    if (!gameData) {
      gameData = { main: [], custom: {} };
      await db.createDocument("users", id, {
        data: gameData,
        email: email,
      });
    }

    if (_.isEqual(gameData, bodyData))
      return { status: 200, message: gameData };

    const doc: { email: string; data: SavedGameData } = {
      data: mergeGameData(gameData, bodyData),
      email: email,
    };
    await db.updateDocument("users", id, doc);
    return {
      status: 201,
      message: doc.data,
    };
  }
}
