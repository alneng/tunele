const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");
const { AccessDeniedException } = require("../utils/errors.utils");
const { loadDotenv } = require("../utils/utils");
loadDotenv();

const OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const OAUTH2_CLIENT = new OAuth2Client(OAUTH_CLIENT_ID);

/**
 * Verifies an access token
 *
 * @param accessToken google access token to be verified
 * @throws AccessDeniedException if bad access token
 * @returns status of the access token
 */
async function verifyAccessToken(accessToken) {
  const response = await axios.get(
    `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
  );
  const data = response.data;

  if (data?.code === 401 && data?.status === "UNAUTHENTICATED") {
    throw new AccessDeniedException(
      401,
      "Unauthenticated access token or id token. Retry with refresh token",
      true
    );
  }

  return data;
}

/**
 * Verifies an id token
 *
 * @param idToken google id token to be verified
 * @throws AccessDeniedException if bad id token
 */
async function verifyIdToken(idToken) {
  try {
    const ticket = await OAUTH2_CLIENT.verifyIdToken({
      idToken: idToken,
      audience: OAUTH_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (payload.aud !== OAUTH_CLIENT_ID)
      throw new AccessDeniedException(401, "Bad ID token", true);
  } catch (error) {
    if (error?.status == 401)
      throw new AccessDeniedException(401, "Bad ID token", true);
    throw new AccessDeniedException(500, "Could not verify id token", true);
  }
}

module.exports = { verifyAccessToken, verifyIdToken };
