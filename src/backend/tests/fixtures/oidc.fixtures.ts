import { RequestMetadata } from "../../src/types/session.types";

/**
 * Known PKCE test vector from RFC 7636 Appendix B.
 * Used to verify S256 code_challenge generation and validation.
 */
export const PKCE_TEST_VECTOR = {
  verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
  challenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
} as const;

/** Default state value for OIDC tests */
export const TEST_STATE = "test-state";

/** Default nonce value for OIDC tests */
export const TEST_NONCE = "test-nonce";

/** OIDC state TTL in Redis (seconds) */
export const OIDC_STATE_TTL_SECONDS = 600;

/** Expected hex length for 32-byte values (state, nonce) */
export const EXPECTED_HEX_LENGTH = 64;

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
