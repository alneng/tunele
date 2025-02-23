import axios from "axios";
import qs from "qs";
import {
  doesAccessIdTokenExist,
  getIdTokenAuthStatus,
  getAccessTokenAuthStatus,
} from "../utils/auth.utils";
import { HttpException } from "../utils/errors.utils";
import { GOOGLE_OAUTH_CONFIG } from "../config";
import { log } from "../utils/logger.utils";

export default class AuthService {
  static authClientCredentials = {
    client_id: GOOGLE_OAUTH_CONFIG.client_id,
    client_secret: GOOGLE_OAUTH_CONFIG.client_secret,
  };

  /**
   * Exchanges auth code for access, id, and refresh token
   *
   * @param code auth code
   * @param scope auth scope
   * @throws HttpException if error generating credentials
   * @returns new auth status, or error
   */
  static async getAuthWithCode(code: string, scope: string) {
    const data = {
      ...this.authClientCredentials,
      grant_type: "authorization_code",
      code: code,
      scope: scope,
      redirect_uri: GOOGLE_OAUTH_CONFIG.redirect_uri,
    };

    try {
      const response = await axios.post(
        "https://oauth2.googleapis.com/token",
        qs.stringify(data),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const auth = response.data;

      return {
        success: true,
        refreshToken: auth.refresh_token,
        idToken: auth.id_token,
        accessToken: auth.access_token,
        expiresIn: auth.expires_in,
      };
    } catch (error) {
      log.error("Failed to get auth with code", {
        meta: {
          error,
          stack: error.stack,
          method: AuthService.getAuthWithCode.name,
          data: { code, scope },
        },
      });
      throw new HttpException(401, "Bad token request");
    }
  }

  /**
   * Exchanges refresh token for access, and id token
   *
   * @param refreshToken auth refresh token
   * @throws HttpException if error generating credentials
   * @returns new auth status, or error
   */
  static async getAuthWithRefreshToken(refreshToken: string) {
    const data = {
      ...this.authClientCredentials,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };

    try {
      const response = await axios.post(
        "https://oauth2.googleapis.com/token",
        qs.stringify(data),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );
      const auth = response.data;

      return {
        success: true,
        idToken: auth.id_token,
        accessToken: auth.access_token,
        expiresIn: auth.expires_in,
      };
    } catch (error) {
      log.error("Failed to get auth with refresh token", {
        meta: {
          error,
          stack: error.stack,
          method: AuthService.getAuthWithRefreshToken.name,
          data: { refreshToken },
        },
      });
      throw new HttpException(401, "Bad token request");
    }
  }

  /**
   * Verifies an access token
   *
   * @param accessToken auth access token
   * @param idToken auth id token
   * @param refreshToken auth refresh token
   * @throws AccessDeniedException if bad access token
   * @returns access token auth status
   */
  static async verifyAccessToken(
    accessToken: string,
    idToken: string,
    refreshToken: string
  ) {
    doesAccessIdTokenExist(accessToken, idToken, refreshToken);
    await getIdTokenAuthStatus(idToken);
    return await getAccessTokenAuthStatus(accessToken);
  }
}
