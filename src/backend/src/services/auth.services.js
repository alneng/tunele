const axios = require("axios");
const querystring = require("querystring");
const {
  doesAccessIdTokenExist,
  getIdTokenAuthStatus,
  getAccessTokenAuthStatus,
} = require("../utils/auth.utils");

module.exports = class AuthService {
  static authClientCredentials = {
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
    client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  };

  /**
   * Exchanges auth code for access, id, and refresh token
   *
   * @param code auth code
   * @param scope auth scope
   * @returns new auth status, or error
   */
  static async getAuthWithCode(code, scope) {
    const data = {
      ...this.authClientCredentials,
      grant_type: "authorization_code",
      code: code,
      scope: scope,
      redirect_uri: process.env.REDIRECT_URI,
    };

    try {
      const response = await axios.post(
        "https://oauth2.googleapis.com/token",
        querystring.stringify(data),
        { "Content-Type": "application/x-www-form-urlencoded" }
      );
      const auth = response.data;

      return {
        success: true,
        message: "",
        refreshToken: auth.refresh_token,
        idToken: auth.id_token,
        accessToken: auth.access_token,
        expiresIn: auth.expires_in,
      };
    } catch (error) {
      return {
        success: false,
        message: "Bad token request",
        refreshToken: null,
        idToken: null,
        accessToken: null,
        expiresIn: null,
      };
    }
  }

  /**
   * Exchanges refresh token for access, and id token
   *
   * @param refreshToken auth refresh token
   * @returns new auth status, or error
   */
  static async getAuthWithRefreshToken(refreshToken) {
    const data = {
      ...this.authClientCredentials,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };

    try {
      const response = await axios.post(
        "https://oauth2.googleapis.com/token",
        querystring.stringify(data),
        { "Content-Type": "application/x-www-form-urlencoded" }
      );
      const auth = response.data;

      return {
        success: true,
        message: "",
        idToken: auth.id_token,
        accessToken: auth.access_token,
      };
    } catch (error) {
      return {
        success: false,
        message: "Bad token request",
        idToken: null,
        accessToken: null,
      };
    }
  }

  /**
   * Verifies an access token
   *
   * @param accessToken auth access token
   * @param idToken auth id token
   * @param refreshToken auth refresh token
   * @returns access token auth status
   */
  static async verifyAccessToken(accessToken, idToken, refreshToken) {
    const tokenExistenceCheck = doesAccessIdTokenExist(
      accessToken,
      idToken,
      refreshToken
    );
    if (tokenExistenceCheck) return tokenExistenceCheck;

    const badIdToken = await getIdTokenAuthStatus(idToken);
    if (badIdToken) return badIdToken;
    return await getAccessTokenAuthStatus(accessToken);
  }
};
