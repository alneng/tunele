const _ = require("lodash");
const {
  doesAccessIdTokenExist,
  getIdTokenAuthStatus,
  getAccessTokenAuthStatus,
} = require("../utils/auth.utils");
const db = require("../utils/firebase.utils");

module.exports = class UserService {
  /**
   * Get a user's saved data
   *
   * @param userId the user id to get the data of
   * @param accessToken auth access token
   * @param idToken auth id token
   * @param refreshToken auth refresh token
   * @returns the user's saved data, or an error message
   */
  static async getUserData(userId, accessToken, idToken, refreshToken) {
    const tokenExistenceCheck = doesAccessIdTokenExist(
      accessToken,
      idToken,
      refreshToken
    );
    if (tokenExistenceCheck) return tokenExistenceCheck;

    const badIdToken = await getIdTokenAuthStatus(idToken);
    if (badIdToken) return badIdToken;
    const tokenVerificationResult = await getAccessTokenAuthStatus(
      accessToken,
      userId
    );
    if (tokenVerificationResult.status !== 200) {
      return tokenVerificationResult;
    }
    const email = tokenVerificationResult.email;

    const data = await db.getDocument("users", id);
    if (data) {
      return {
        status: 200,
        success: true,
        message: data.data,
        retry: false,
      };
    } else {
      const doc = {
        data: { main: [], custom: {} },
        email: email,
      };
      await db.createDocument("users", id, doc);

      return {
        status: 201,
        success: true,
        message: doc.data,
        retry: false,
      };
    }
  }

  /**
   * Update a user's saved data
   *
   * @param userId the user id to get the data of
   * @param bodyData the data to save for the user
   * @param accessToken auth access token
   * @param idToken auth id token
   * @param refreshToken auth refresh token
   * @returns the user's saved data, or an error message
   */
  static async updateUserData(
    userId,
    bodyData,
    accessToken,
    idToken,
    refreshToken
  ) {
    const tokenExistenceCheck = doesAccessIdTokenExist(
      accessToken,
      idToken,
      refreshToken
    );
    if (tokenExistenceCheck) return tokenExistenceCheck;

    const badIdToken = await getIdTokenAuthStatus(idToken);
    if (badIdToken) return badIdToken;
    const tokenVerificationResult = await getAccessTokenAuthStatus(
      accessToken,
      userId
    );
    if (tokenVerificationResult.status !== 200) {
      return tokenVerificationResult;
    }
    const email = tokenVerificationResult.email;

    const savedData = await db.getDocument("users", id);
    let gameData = savedData?.data;
    if (!gameData) {
      gameData = { main: [], custom: {} };
      await db.createDocument("users", id, {
        data: gameData,
        email: email,
      });
    }

    if (_.isEqual(gameData, bodyData)) {
      return {
        status: 200,
        success: true,
        message: gameData,
        retry: false,
      };
    }

    const doc = {
      data: mergeGameData(gameData, bodyData),
      email: email,
    };
    await db.updateDocument("users", id, doc);
    return {
      status: 201,
      success: true,
      message: doc.data,
      retry: false,
    };
  }
};
