import api from "@/utils/axios";

/**
 * Initiate OIDC flow by registering state and nonce with backend
 *
 * @param state the state parameter (CSRF protection)
 * @param nonce the nonce parameter
 */
export const initiateOIDC = async (state: string, nonce: string): Promise<void> => {
  await api.post("/auth/initiate", {
    state,
    nonce,
  });
};

/**
 * OIDC authentication with code, state, nonce, and PKCE
 *
 * @param code the authorization code
 * @param state the state parameter (CSRF protection)
 * @param nonce the nonce parameter
 * @param codeVerifier the PKCE code verifier
 */
export const authenticate = async (
  code: string,
  state: string,
  nonce: string,
  codeVerifier: string,
): Promise<void> => {
  await api.post("/auth/callback", {
    code,
    state,
    nonce,
    code_verifier: codeVerifier,
  });
};

export type UserIdentity = {
  id: string;
  given_name: string;
  email: string;
};

/**
 * Verifies the user's session.
 *
 * @returns the user identity
 */
export const verifySession = async (): Promise<UserIdentity> => {
  const response = await api.get<UserIdentity>("/auth/verify");
  return response.data;
};

/**
 * Logs the user out.
 */
export const logout = async () => {
  await api.get("/auth/logout");
};
