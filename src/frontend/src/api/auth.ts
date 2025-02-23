import api from "@/utils/axios";

/**
 * Exchanges an OAuth code for an access token.
 *
 * @param code the OAuth code
 * @param scope the OAuth scope
 */
export const getAuthWithCode = async (
  code: string,
  scope: string
): Promise<void> => {
  await api.post("/auth/code", { code, scope });
};

/**
 * Exchanges a refresh token for an access token.
 */
export const refreshUserSession = async () => {
  await api.post("/auth/refresh-token");
};

export type AccessTokenResponse = {
  id: string;
  given_name: string;
};

/**
 * Verifies the user's access token.
 *
 * @returns the access token response
 */
export const verifyAccessToken = async (): Promise<AccessTokenResponse> => {
  const response = await api.get<AccessTokenResponse>("/auth/vat");
  return response.data;
};

/**
 * Logs the user out.
 */
export const logout = async () => {
  await api.get("/auth/logout");
};
