import axios from "axios";
import qs from "qs";
import { OAuth2Client } from "google-auth-library";
import { HttpException } from "../utils/errors.utils";
import { GOOGLE_OAUTH_CONFIG } from "../config";
import { log } from "../utils/logger.utils";
import { SessionService } from "../lib/session.service";
import { storeOIDCState, consumeOIDCState, validateNonce } from "../utils/oidc.utils";
import { UserIdentity } from "../types/session.types";
import db from "../lib/firebase";

export default class AuthService {
  static authClientCredentials = {
    client_id: GOOGLE_OAUTH_CONFIG.client_id,
    client_secret: GOOGLE_OAUTH_CONFIG.client_secret,
  };

  static oauth2Client = new OAuth2Client(GOOGLE_OAUTH_CONFIG.client_id);

  /**
   * Initiate OIDC flow by storing state and nonce in Redis
   * This enables server-side state validation during callback
   *
   * @param state CSRF protection token
   * @param nonce nonce for ID token validation
   */
  static async initiateOIDCFlow(state: string, nonce: string): Promise<void> {
    await storeOIDCState(state, nonce);
    log.info("OIDC flow initiated", { meta: { state } });
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
   * @throws HttpException if validation fails
   * @returns session ID and expiration time
   */
  static async authenticateWithCode(
    code: string,
    state: string,
    nonce: string,
    codeVerifier: string,
  ): Promise<{ sessionId: string; expiresIn: number }> {
    // 1. Validate state and retrieve stored nonce (server-side CSRF protection)
    const storedNonce = await consumeOIDCState(state);
    if (!storedNonce) {
      log.error("Invalid or expired state parameter", { meta: { state } });
      throw new HttpException(401, "Invalid or expired state parameter");
    }

    // 2. Verify nonce matches what we stored
    if (storedNonce !== nonce) {
      log.error("Nonce mismatch - possible replay attack", {
        meta: { storedNonce, providedNonce: nonce },
      });
      throw new HttpException(401, "Nonce validation failed");
    }

    // 3. Exchange authorization code for tokens with PKCE
    const tokenData = {
      ...this.authClientCredentials,
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      redirect_uri: GOOGLE_OAUTH_CONFIG.redirect_uri,
    };

    let tokenResponse;
    try {
      tokenResponse = await axios.post(
        "https://oauth2.googleapis.com/token",
        qs.stringify(tokenData),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
      );
    } catch (error) {
      log.error("Failed to exchange code for tokens", {
        meta: {
          error,
          stack: error instanceof Error ? error.stack : undefined,
          method: AuthService.authenticateWithCode.name,
        },
      });
      throw new HttpException(401, "Failed to exchange authorization code");
    }

    const { id_token, refresh_token } = tokenResponse.data;

    if (!id_token) {
      log.error("No ID token in response", {
        meta: { method: AuthService.authenticateWithCode.name },
      });
      throw new HttpException(401, "No ID token received");
    }

    // 4. Verify ID token and extract claims
    let ticket;
    try {
      ticket = await this.oauth2Client.verifyIdToken({
        idToken: id_token,
        audience: GOOGLE_OAUTH_CONFIG.client_id,
      });
    } catch (error) {
      log.error("Failed to verify ID token", {
        meta: {
          error,
          stack: error instanceof Error ? error.stack : undefined,
          method: AuthService.authenticateWithCode.name,
        },
      });
      throw new HttpException(401, "Invalid ID token");
    }

    const payload = ticket.getPayload();
    if (!payload) {
      throw new HttpException(401, "Invalid ID token payload");
    }

    // 5. Validate nonce in ID token (prevents replay attacks)
    validateNonce(payload.nonce, nonce);

    // 6. Extract user identity from ID token (NOT from userinfo endpoint)
    const userIdentity: UserIdentity = {
      sub: payload.sub,
      email: payload.email || "",
      name: payload.name || "",
      email_verified: payload.email_verified,
    };

    log.info("User authenticated via OIDC", {
      meta: {
        userId: userIdentity.sub,
        email: userIdentity.email,
      },
    });

    // 7. Create or update user in Firestore
    await this.createOrUpdateUser(userIdentity);

    // 8. Create session
    const session = await SessionService.createSession(
      userIdentity,
      refresh_token || "",
    );

    return session;
  }

  /**
   * Create or update user document in Firestore
   * Handles migration of existing users
   *
   * @param userIdentity user identity from ID token
   */
  private static async createOrUpdateUser(
    userIdentity: UserIdentity,
  ): Promise<void> {
    const { sub, email } = userIdentity;

    // Check if user already exists by Google sub
    const existingUser = await db.getDocument("users", sub);

    if (existingUser) {
      // Update last login time
      await db.updateDocument("users", sub, {
        lastLoginAt: new Date().toISOString(),
      });
      log.info("Updated existing user", { meta: { userId: sub } });
      return;
    }

    // Check for legacy user by email (migration path)
    const allUsers =
      await db.getAllDocuments<Array<{ id: string; data: { email: string } }>>(
        "users",
      );

    if (allUsers) {
      const legacyUser = allUsers.find(
        (user) => user.data && user.data.email === email,
      );

      if (legacyUser) {
        // Migrate: add googleSub to existing document
        await db.updateDocument("users", legacyUser.id, {
          googleSub: sub,
          lastLoginAt: new Date().toISOString(),
        });
        log.info("Migrated legacy user", {
          meta: { oldUserId: legacyUser.id, newUserId: sub, email },
        });
        return;
      }
    }

    // Create new user
    await db.createDocument("users", sub, {
      email,
      data: { main: [], custom: {} },
      googleSub: sub,
      lastLoginAt: new Date().toISOString(),
    });

    log.info("Created new user", { meta: { userId: sub, email } });
  }
}
