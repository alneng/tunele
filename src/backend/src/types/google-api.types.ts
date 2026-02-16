export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: "Bearer";
  scope: string;
  refresh_token?: string; // Only present on initial authorization, not on refresh
  id_token?: string; // Present if openid scope was requested
}
