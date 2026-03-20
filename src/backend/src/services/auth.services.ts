import axios, { AxiosResponse } from "axios";
import qs from "qs";
import { LoginTicket, OAuth2Client } from "google-auth-library";
import { HttpException } from "@/utils/errors.utils";
import config from "@/config";
import Logger from "@/lib/logger";
import { SessionService } from "@/lib/session.service";
import { storeOIDCState, consumeOIDCState, validateNonce } from "@/utils/oidc.utils";
import { UserIdentity, RequestMetadata } from "@/types/session.types";
import db from "@/lib/firebase";
import { GoogleTokenResponse } from "@/types/google-api.types";
import { FirebaseUser } from "@/types/firebase.types";

export default class AuthService {
  static get authClientCredentials() {
    return {
      client_id: config.googleOAuth.clientId,
      client_secret: config.googleOAuth.clientSecret,
    };
  }

  static get oauth2Client() {
    return new OAuth2Client(config.googleOAuth.clientId);
  }

  /**
   * Initiate OIDC flow by storing state and nonce in Redis
   * This enables server-side state validation during callback
   *
   * @param state CSRF protection token
   * @param nonce nonce for ID token validation
   * @param metadata request metadata
   */
  static async initiateOIDCFlow(
    state: string,
    nonce: string,
    metadata?: RequestMetadata,
  ): Promise<void> {
    await storeOIDCState(state, nonce, metadata);
    Logger.info("OIDC flow initiated", {
      state,
      requestMetadata: metadata,
    });
  }

  /**
   * OIDC authentication with code, state, nonce, and PKCE
   * Replaces the old OAuth 2.0 flow
   *
   * Security layers:
   * 1. State validation (server-side) - CSRF protection, one-time use
   * 2. PKCE validation (by Google) - prevents code interception
   * 3. Nonce validation (server-side) - prevents replay attacks
   *
   * @param code authorization code from Google
   * @param state CSRF protection token
   * @param nonce nonce for ID token validation
   * @param codeVerifier PKCE code verifier
   * @param metadata request metadata
   * @throws HttpException if validation fails
   * @returns session ID and expiration time
   */
  static async authenticateWithCode(
    code: string,
    state: string,
    nonce: string,
    codeVerifier: string,
    metadata?: RequestMetadata,
  ): Promise<{ sessionId: string; expiresIn: number }> {
    // Validate state and retrieve stored nonce (server-side CSRF protection)
    const stored = await consumeOIDCState(state, metadata);
    if (!stored) {
      throw new HttpException(401, "Invalid or expired state parameter");
    }

    // Verify nonce matches what we stored
    if (stored.nonce !== nonce) {
      Logger.error("Nonce mismatch - possible replay attack", {
        storedNonce: stored.nonce,
        providedNonce: nonce,
        requestMetadata: metadata,
      });
      throw new HttpException(401, "Nonce validation failed");
    }

    // Exchange authorization code for tokens with PKCE
    const tokenData = {
      ...this.authClientCredentials,
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      redirect_uri: config.googleOAuth.redirectUri,
    };

    let tokenResponse: AxiosResponse<GoogleTokenResponse>;
    try {
      tokenResponse = await axios.post(
        "https://oauth2.googleapis.com/token",
        qs.stringify(tokenData),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
    } catch (error) {
      Logger.error("Failed to exchange code for tokens", {
        error,
        method: AuthService.authenticateWithCode.name,
        requestMetadata: metadata,
      });
      throw new HttpException(401, "Failed to exchange authorization code");
    }

    const { id_token, refresh_token } = tokenResponse.data;

    if (!id_token) {
      Logger.error("No ID token in response", {
        method: AuthService.authenticateWithCode.name,
        requestMetadata: metadata,
      });
      throw new HttpException(401, "No ID token received");
    }

    // Verify ID token and extract claims
    let ticket: LoginTicket;
    try {
      ticket = await this.oauth2Client.verifyIdToken({
        idToken: id_token,
        audience: config.googleOAuth.clientId,
      });
    } catch (error) {
      Logger.error("Failed to verify ID token", {
        error,
        method: AuthService.authenticateWithCode.name,
        requestMetadata: metadata,
      });
      throw new HttpException(401, "Invalid ID token");
    }

    const payload = ticket.getPayload();
    if (!payload) {
      throw new HttpException(401, "Invalid ID token payload");
    }

    // Validate nonce in ID token (prevents replay attacks)
    validateNonce(payload.nonce, nonce);

    // Extract user identity from ID token
    const userIdentity: UserIdentity = {
      sub: payload.sub,
      email: payload.email || "",
      name: payload.name || "",
      email_verified: payload.email_verified,
    };

    Logger.info("User authenticated via OIDC", {
      userId: userIdentity.sub,
      requestMetadata: metadata,
    });

    // Create or update user in Firestore
    await this.createOrUpdateUser(userIdentity);

    // Create session
    const session = await SessionService.createSession(userIdentity, refresh_token || "", metadata);

    return session;
  }

  /**
   * Create or update user document in Firestore
   * Handles migration of existing users
   *
   * @param userIdentity user identity from ID token
   */
  private static async createOrUpdateUser(userIdentity: UserIdentity): Promise<void> {
    const { sub, email } = userIdentity;

    // Check if user already exists by Google sub
    const existingUser = await db.getDocument("users", sub);

    if (existingUser) {
      // Update last login time
      await db.updateDocument<Partial<FirebaseUser>>("users", sub, {
        googleSub: sub,
        lastLoginAt: new Date().toISOString(),
      });
      Logger.info("Updated existing user", { userId: sub });
      return;
    }

    // Create new user
    await db.createDocument<FirebaseUser>("users", sub, {
      email,
      data: { main: [], custom: {} },
      googleSub: sub,
      lastLoginAt: new Date().toISOString(),
    });

    Logger.info("Created new user", { userId: sub, email });
  }
}
