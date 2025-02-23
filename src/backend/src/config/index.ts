export const NODE_ENV = process.env.NODE_ENV || "development";

// Throw if any required environment variables are missing
if (NODE_ENV !== "test") {
  if (!process.env.CORS_OPTIONS)
    throw new Error("Missing environment variable: CORS_OPTIONS");
  if (!process.env.COOKIE_SETTINGS)
    throw new Error("Missing environment variable: COOKIE_SETTINGS");
  if (!process.env.SPOTIFY_CLIENT_KEY)
    throw new Error("Missing environment variable: SPOTIFY_CLIENT_KEY");
}

export const PORT = process.env.PORT ? Number(process.env.PORT) : 7600;

export const CORS_OPTIONS = JSON.parse(process.env.CORS_OPTIONS || "{}");
export const COOKIE_SETTINGS = JSON.parse(process.env.COOKIE_SETTINGS || "{}");

export const SPOTIFY_CLIENT_KEY = process.env.SPOTIFY_CLIENT_KEY;

export const FIREBASE_SERVICE_ACCOUNT_KEY =
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

export const GOOGLE_OAUTH_CONFIG = {
  client_id: process.env.GOOGLE_OAUTH_CLIENT_ID,
  client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  redirect_uri: process.env.REDIRECT_URI,
};
