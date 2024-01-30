const _ = require("lodash");
const {
  doesAccessIdTokenExist,
  getIdTokenAuthStatus,
  getAccessTokenAuthStatus,
} = require("../utils/auth.utils");
const db = require("../utils/firebase.utils");
const { mergeGameData } = require("../utils/user.utils");

module.exports = class UserService {
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
  static async getUserData(userId, accessToken, idToken, refreshToken) {
    doesAccessIdTokenExist(accessToken, idToken, refreshToken);
    await getIdTokenAuthStatus(idToken);
    const { email, id } = await getAccessTokenAuthStatus(accessToken, userId);

    const data = await db.getDocument("users", id);
    if (data) return { status: 200, message: data.data };

    const doc = {
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
   * @returns the user's saved data, or an error message
   */
  static async updateUserData(
    userId,
    bodyData,
    accessToken,
    idToken,
    refreshToken
  ) {
    doesAccessIdTokenExist(accessToken, idToken, refreshToken);
    await getIdTokenAuthStatus(idToken);
    const { email, id } = await getAccessTokenAuthStatus(accessToken, userId);

    const savedData = await db.getDocument("users", id);
    let gameData = savedData?.data;
    if (!gameData) {
      gameData = { main: [], custom: {} };
      await db.createDocument("users", id, {
        data: gameData,
        email: email,
      });
    }

    if (_.isEqual(gameData, bodyData))
      return { status: 200, message: gameData };

    const doc = {
      data: mergeGameData(gameData, bodyData),
      email: email,
    };
    await db.updateDocument("users", id, doc);
    return {
      status: 201,
      message: doc.data,
    };
  }
};
