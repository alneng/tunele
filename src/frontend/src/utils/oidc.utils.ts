/**
 * Generate a cryptographically secure random string
 *
 * @param length the length in bytes (output will be hex, so 2x this length)
 * @returns random hex string
 */
export function generateRandomString(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Generate a PKCE code verifier (URL-safe base64 random string)
 *
 * @returns code verifier string (43 characters)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * Generate a PKCE code challenge from a code verifier
 *
 * @param codeVerifier the code verifier
 * @returns code challenge (base64url-encoded SHA256 hash)
 */
export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(hash));
}

/**
 * Base64 URL encode (without padding)
 *
 * @param buffer the buffer to encode
 * @returns base64url-encoded string
 */
function base64UrlEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Store OIDC flow parameters in sessionStorage
 *
 * @param state the state parameter
 * @param nonce the nonce parameter
 * @param codeVerifier the PKCE code verifier
 */
export function storeOIDCParams(state: string, nonce: string, codeVerifier: string): void {
  sessionStorage.setItem("oidc_state", state);
  sessionStorage.setItem("oidc_nonce", nonce);
  sessionStorage.setItem("oidc_code_verifier", codeVerifier);
}

/**
 * Retrieve and clear OIDC flow parameters from sessionStorage
 *
 * @returns OIDC parameters or null if not found
 */
export function retrieveAndClearOIDCParams(): {
  state: string;
  nonce: string;
  codeVerifier: string;
} | null {
  const state = sessionStorage.getItem("oidc_state");
  const nonce = sessionStorage.getItem("oidc_nonce");
  const codeVerifier = sessionStorage.getItem("oidc_code_verifier");

  if (!state || !nonce || !codeVerifier) {
    return null;
  }

  // Clear immediately after reading
  sessionStorage.removeItem("oidc_state");
  sessionStorage.removeItem("oidc_nonce");
  sessionStorage.removeItem("oidc_code_verifier");

  return { state, nonce, codeVerifier };
}

/**
 * Validate that the returned state matches the stored state
 *
 * @param returnedState the state parameter from the callback URL
 * @param storedState the state we stored before redirect
 * @returns true if valid
 */
export function validateState(returnedState: string, storedState: string): boolean {
  return returnedState === storedState;
}
