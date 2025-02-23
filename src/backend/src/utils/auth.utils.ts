import { Response } from "express";
import { AccessDeniedException } from "../utils/errors.utils";
import { verifyAccessToken, verifyIdToken } from "./tokens.utils";
import { COOKIE_SETTINGS } from "../config";

/**
 * Creates a cookie
 *
 * @param res Express Response
 * @param cookieName the cookie name
 * @param cookieValue the value of the cookie
 * @param maxAge the max age of the cookie in ms
 */
export const createCookie = (
  res: Response,
  cookieName: string,
  cookieValue: string,
  maxAge: number
) => {
  res.cookie(cookieName, cookieValue, {
    ...COOKIE_SETTINGS,
    maxAge,
  });
};

/**
 * Checks if user access and id token exist
 *
 * @param accessToken auth access token
 * @param idToken auth id token
 * @param refreshToken auth refresh token
 * @throws AccessDeniedException if no access or id token
 */
export const doesAccessIdTokenExist = (
  accessToken: string,
  idToken: string,
  refreshToken: string
) => {
  if (!accessToken || !idToken) {
    throw new AccessDeniedException(
      401,
      `Invalid access token or id token${
        refreshToken ? ". Retry with refresh token" : ""
      }`,
      refreshToken ? true : false
    );
  }
};

/**
 * Gets the auth status of a user's id token
 *
 * @param idToken auth id token
 * @throws AccessDeniedException if bad id token
 */
export const getIdTokenAuthStatus = async (idToken: string) => {
  await verifyIdToken(idToken);
};

/**
 * Gets the auth status of a user's access token
 *
 * @param accessToken auth access token
 * @param userId a user id to verify against the access token
 * @throws AccessDeniedException if bad access token
 * @returns status of the access token
 */
export const getAccessTokenAuthStatus = async (
  accessToken: string,
  userId?: string
) => {
  const accessTokenStatus = await verifyAccessToken(accessToken);

  if (userId && accessTokenStatus.id !== userId)
    throw new AccessDeniedException(401, "Unauthorized", false);

  return accessTokenStatus;
};
