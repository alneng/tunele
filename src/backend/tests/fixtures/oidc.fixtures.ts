import { RequestMetadata } from "@/types/session.types";

/** Default state value for OIDC tests */
export const TEST_STATE = "test-state";

/** Default nonce value for OIDC tests */
export const TEST_NONCE = "test-nonce";

/** OIDC state TTL in Redis (seconds) */
export const OIDC_STATE_TTL_SECONDS = 600;

export interface StoredOIDCData {
  state: string;
  nonce: string;
  createdAt: string;
  metadata?: RequestMetadata;
}

/**
 * Creates stored OIDC state data as returned from Redis.
 */
export function createStoredOIDCData(
  state = TEST_STATE,
  nonce = TEST_NONCE,
): StoredOIDCData {
  return {
    state,
    nonce,
    createdAt: new Date().toISOString(),
  };
}
