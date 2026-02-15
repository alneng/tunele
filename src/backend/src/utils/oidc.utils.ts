import { RedisService } from "../lib/redis.service";
import { generateRandomString } from "./crypto.utils";
import { log } from "./logger.utils";
import { HttpException } from "./errors.utils";
import crypto from "crypto";
import { CacheKeys } from "./redis.utils";
import { OIDCFlowState } from "../types/session.types";

/**
 * OIDC state TTL in seconds (10 minutes - enough for user to complete auth flow)
 */
const OIDC_STATE_TTL_SECONDS = 600;

/**
 * Store OIDC flow state in Redis
 * Used to validate state and nonce during callback
 *
 * @param state the state parameter
 * @param nonce the nonce parameter
 */
export async function storeOIDCState(
  state: string,
  nonce: string,
): Promise<void> {
  const key = CacheKeys.OIDC_STATE(state);
  const data: OIDCFlowState = {
    state,
    nonce,
    createdAt: new Date().toISOString(),
  };

  await RedisService.setJSON(key, data, OIDC_STATE_TTL_SECONDS);
}

/**
 * Retrieve and delete OIDC flow state from Redis
 * This ensures state can only be used once (prevents replay attacks)
 *
 * @param state the state parameter
 * @returns the stored nonce, or null if state not found/expired
 */
export async function consumeOIDCState(state: string): Promise<string | null> {
  const key = CacheKeys.OIDC_STATE(state);
  const data = await RedisService.getJSON<OIDCFlowState>(key);

  if (!data) {
    log.warn("OIDC state not found or expired", { meta: { state } });
    return null;
  }

  // Delete the state immediately (one-time use)
  await RedisService.delete(key);

  return data.nonce;
}

/**
 * Validate PKCE code_verifier against code_challenge
 * This is done by Google's token endpoint, but we include this for reference
 *
 * @param codeVerifier the code_verifier
 * @param codeChallenge the code_challenge
 * @param method the challenge method (S256 or plain)
 * @returns true if valid
 */
export function validatePKCE(
  codeVerifier: string,
  codeChallenge: string,
  method: "S256" | "plain" = "S256",
): boolean {
  if (method === "plain") {
    return codeVerifier === codeChallenge;
  }

  // S256: base64url(sha256(code_verifier)) === code_challenge
  const hash = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  return hash === codeChallenge;
}

/**
 * Validate nonce from ID token against stored nonce
 *
 * @param tokenNonce the nonce from the ID token
 * @param storedNonce the nonce we stored before auth redirect
 * @throws HttpException if nonces don't match
 */
export function validateNonce(
  tokenNonce: string | undefined,
  storedNonce: string,
): void {
  if (!tokenNonce || tokenNonce !== storedNonce) {
    log.error("Nonce validation failed", {
      meta: { tokenNonce, storedNonce },
    });
    throw new HttpException(401, "Invalid nonce in ID token");
  }
}

/**
 * Generate state and nonce for OIDC flow
 *
 * @returns object with state and nonce
 */
export function generateOIDCParams(): { state: string; nonce: string } {
  return {
    state: generateRandomString(),
    nonce: generateRandomString(),
  };
}
