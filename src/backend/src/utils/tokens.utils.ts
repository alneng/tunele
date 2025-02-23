import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { AccessDeniedException } from "../utils/errors.utils";
import { GOOGLE_OAUTH_CONFIG } from "../config";
import { log } from "./logger.utils";

/**
 * Verifies an access token
 *
 * @param accessToken google access token to be verified
 * @throws AccessDeniedException if bad access token
 * @returns status of the access token
 */
export async function verifyAccessToken(accessToken: string) {
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
export async function verifyIdToken(idToken: string) {
  const OAUTH2_CLIENT = new OAuth2Client(GOOGLE_OAUTH_CONFIG.client_id);
  try {
    const ticket = await OAUTH2_CLIENT.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_OAUTH_CONFIG.client_id,
    });
    const payload = ticket.getPayload();

    if (payload.aud !== GOOGLE_OAUTH_CONFIG.client_id)
      throw new AccessDeniedException(401, "Bad ID token", true);
  } catch (error) {
    if (error?.status == 401)
      throw new AccessDeniedException(401, "Bad ID token", true);

    log.error("Failed to verify id token", {
      meta: {
        error,
        stack: error.stack,
        method: verifyIdToken.name,
        data: { idToken },
      },
    });
    throw new AccessDeniedException(500, "Could not verify id token", true);
  }
}
