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
 * @returns auth status if no access or id token
 */
function doesAccessIdTokenExist(accessToken, idToken, refreshToken) {
  if (!accessToken || !idToken) {
    if (refreshToken) {
      return {
        status: 401,
        success: false,
        message:
          "Unauthorized access token or id token. Retry with refresh token",
        retry: true,
      };
    }
    return {
      status: 401,
      success: false,
      message: "Unauthorized",
      retry: false,
    };
  }
}

/**
 * Gets the auth status of a user's id token
 *
 * @param idToken auth id token
 * @returns auth status if invalid id token
 */
async function getIdTokenAuthStatus(idToken) {
  try {
    const idTokenStatus = await verifyIdToken(idToken);
    if (idTokenStatus.status === 401) {
      return {
        status: 401,
        success: false,
        message: "Bad ID token",
        retry: true,
      };
    }
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: "Could not verify ID token",
      retry: true,
    };
  }
}

/**
 * Gets the auth status of a user's access token
 *
 * @param accessToken auth access token
 * @param callback callback function to handle data on valid access token
 * @returns auth status if invalid access token, or callback on success
 */
async function getAccessTokenAuthStatus(accessToken, userId = null) {
  try {
    const accessTokenStatus = await verifyAccessToken(accessToken);
    const data = accessTokenStatus.data;

    if (data?.code === 401 && data?.status === "UNAUTHENTICATED") {
      return {
        status: 401,
        success: false,
        message:
          "Unauthenticated access token or id token. Retry with refresh token",
        retry: true,
      };
    }

    if (userId !== null && data?.id !== userId) {
      return {
        status: 401,
        success: false,
        message: "Unauthorized",
        retry: false,
      };
    }

    return {
      ...data,
      status: 200,
    };
  } catch (error) {
    return {
      status: 401,
      success: false,
      message: "Unauthorized",
      retry: true,
    };
  }
}

module.exports = {
  createCookie,
  doesAccessIdTokenExist,
  getIdTokenAuthStatus,
  getAccessTokenAuthStatus,
};
