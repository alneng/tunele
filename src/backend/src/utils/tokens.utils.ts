import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import { AccessDeniedException, HttpException } from "../utils/errors.utils";
import config from "../config";
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
  const { clientId } = config.googleOAuth;
  const OAUTH2_CLIENT = new OAuth2Client(clientId);
  try {
    const ticket = await OAUTH2_CLIENT.verifyIdToken({
      idToken: idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload || payload.aud !== clientId)
      throw new AccessDeniedException(401, "Bad ID token", true);
  } catch (error) {
    if (error instanceof HttpException && error.status == 401) throw error; // rethrow if it's a 401 error

    log.error("Failed to verify id token", {
      meta: {
        error,
        stack: error instanceof Error ? error.stack : undefined,
        method: verifyIdToken.name,
        data: { idToken },
      },
    });
    throw new AccessDeniedException(500, "Could not verify id token", true);
  }
}
