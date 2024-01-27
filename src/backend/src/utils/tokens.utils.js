const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");

const OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const OAUTH2_CLIENT = new OAuth2Client(OAUTH_CLIENT_ID);

/**
 * Verifies an access token
 *
 * @param accessToken google access token to be verified
 * @returns status of the access token
 */
async function verifyAccessToken(accessToken) {
  return axios.get(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
  );
}

/**
 * Verifies an id token
 *
 * @param idToken google id token to be verified
 * @returns is the id token valid
 */
async function verifyIdToken(idToken) {
  try {
    const ticket = await OAUTH2_CLIENT.verifyIdToken({
      idToken: idToken,
      audience: OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (payload.aud !== OAUTH_CLIENT_ID) {
      return {
        status: 401,
        success: false,
        message: "Bad ID token",
        retry: true,
      };
    }

    return {
      status: 200,
      success: true,
      message: "",
      retry: false,
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      message: "Could not verify ID token",
      retry: true,
    };
  }
}

module.exports = { verifyAccessToken, verifyIdToken };
