const { AccessDeniedException } = require("../utils/errors.utils");
const { verifyAccessToken, verifyIdToken } = require("../utils/tokens.utils");
const { loadDotenv } = require("./utils");
loadDotenv();

const COOKIE_SETTINGS = JSON.parse(process.env.COOKIE_SETTINGS);

/**
 * Creates a cookie
 *
 * @param res Express Response
 * @param cookieName the cookie name
 * @param cookieValue the value of the cookie
 * @param maxAge the max age of the cookie in ms
 */
function createCookie(res, cookieName, cookieValue, maxAge) {
  res.cookie(cookieName, cookieValue, {
    ...COOKIE_SETTINGS,
    maxAge,
  });
}

/**
 * Checks if user access and id token exist
 *
 * @param accessToken auth access token
 * @param idToken auth id token
 * @param refreshToken auth refresh token
 * @throws AccessDeniedException if no access or id token
 */
function doesAccessIdTokenExist(accessToken, idToken, refreshToken) {
  if (!accessToken || !idToken) {
    throw new AccessDeniedException(
      401,
      `Invalid access token or id token${
        refreshToken ? ". Retry with refresh token" : ""
      }`,
      refreshToken ? true : false
    );
  }
}

/**
 * Gets the auth status of a user's id token
 *
 * @param idToken auth id token
 * @throws AccessDeniedException if bad id token
 */
async function getIdTokenAuthStatus(idToken) {
  await verifyIdToken(idToken);
}

/**
 * Gets the auth status of a user's access token
 *
 * @param accessToken auth access token
 * @param userId a user id to verify against the access token
 * @throws AccessDeniedException if bad access token
 * @returns status of the access token
 */
async function getAccessTokenAuthStatus(accessToken, userId = null) {
  const accessTokenStatus = await verifyAccessToken(accessToken);

  if (userId !== null && accessTokenStatus.id !== userId)
    throw new AccessDeniedException(401, "Unauthorized", false);

  return accessTokenStatus;
}

module.exports = {
  createCookie,
  doesAccessIdTokenExist,
  getIdTokenAuthStatus,
  getAccessTokenAuthStatus,
};
