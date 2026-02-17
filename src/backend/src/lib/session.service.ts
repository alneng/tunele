import { RedisService } from "./redis.service";
import db from "./firebase";
import {
  SessionData,
  FirestoreSessionData,
  UserIdentity,
  RequestMetadata,
} from "../types/session.types";
import { encrypt, decrypt, generateUUID } from "../utils/crypto.utils";
import Logger from "./logger";
import { AccessDeniedException } from "../utils/errors.utils";
import { CacheKeys } from "../utils/redis.utils";
import config from "../config";

/**
 * SessionService manages user sessions with two-tier storage:
 * - Redis for fast lookups (ephemeral, wiped on redeployment)
 * - Firestore as source of truth (persistent)
 */
export class SessionService {
  /**
   * Create a new session for a user
   *
   * @param userIdentity user identity from ID token
   * @param googleRefreshToken Google refresh token (will be encrypted)
   * @param metadata request metadata at session creation for audit trail
   * @returns session ID and expiration time
   */
  static async createSession(
    userIdentity: UserIdentity,
    googleRefreshToken: string,
    metadata?: RequestMetadata,
  ): Promise<{ sessionId: string; expiresIn: number }> {
    const sessionId = generateUUID();
    const ttlSeconds = config.session.ttlSeconds;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    // Encrypt the Google refresh token before storage
    const encryptedRefreshToken = encrypt(googleRefreshToken);

    const sessionData: SessionData = {
      sessionId,
      userId: userIdentity.sub,
      email: userIdentity.email,
      name: userIdentity.name,
      googleRefreshToken: encryptedRefreshToken,
      createdAt: now,
      expiresAt,
      lastAccessed: now,
      ...(metadata && { metadata }),
    };

    // Store in Firestore first (source of truth)
    await this.storeSessionInFirestore(sessionData);

    // Then cache in Redis for fast lookups
    await this.cacheSessionInRedis(sessionData);

    Logger.info("Session created", {
      sessionId,
      userId: userIdentity.sub,
      expiresAt: expiresAt.toISOString(),
      requestMetadata: metadata,
    });

    return {
      sessionId,
      expiresIn: ttlSeconds,
    };
  }

  /**
   * Get a session by ID
   * - Checks Redis first for fast lookup
   * - Falls back to Firestore if not in Redis
   * - Re-caches in Redis if found in Firestore
   *
   * @param sessionId the session ID
   * @returns session data or null if not found/expired
   */
  static async getSession(sessionId: string): Promise<SessionData | null> {
    // Try Redis first
    const cachedSession = await this.getSessionFromRedis(sessionId);
    if (cachedSession) {
      return cachedSession;
    }

    // Fall back to Firestore
    const firestoreSession = await this.getSessionFromFirestore(sessionId);

    if (firestoreSession) {
      // Check if expired
      if (new Date(firestoreSession.expiresAt) < new Date()) {
        return null;
      }

      // Re-cache in Redis for future requests
      await this.cacheSessionInRedis(firestoreSession);

      Logger.info("Session recovered from Firestore and cached in Redis", {
        sessionId,
      });

      return firestoreSession;
    }

    return null;
  }

  /**
   * Update session's last accessed time
   *
   * @param session the session data
   */
  static async updateLastAccessed(session: SessionData): Promise<void> {
    session.lastAccessed = new Date();

    // Update both Redis and Firestore
    await Promise.all([
      this.cacheSessionInRedis(session),
      this.updateSessionInFirestore(session.sessionId, {
        lastAccessed: session.lastAccessed.toISOString(),
      }),
    ]);
  }

  /**
   * Delete a session (logout)
   *
   * @param sessionId the session ID
   */
  static async deleteSession(sessionId: string): Promise<void> {
    await Promise.all([
      this.deleteSessionFromRedis(sessionId),
      this.deleteSessionFromFirestore(sessionId),
    ]);

    Logger.info("Session deleted", { sessionId });
  }

  /**
   * Get decrypted Google refresh token from session
   *
   * @param sessionId the session ID
   * @returns decrypted refresh token or null if session not found
   */
  static async getGoogleRefreshToken(
    sessionId: string,
  ): Promise<string | null> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return null;
    }

    try {
      return decrypt(session.googleRefreshToken);
    } catch (error) {
      Logger.error("Failed to decrypt Google refresh token", {
        error,
        sessionId,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new AccessDeniedException(
        500,
        "Failed to decrypt refresh token",
        false,
      );
    }
  }

  /**
   * Store session in Redis with TTL
   */
  private static async cacheSessionInRedis(
    session: SessionData,
  ): Promise<void> {
    const key = CacheKeys.SESSION(session.sessionId);
    const ttlSeconds = Math.floor(
      (session.expiresAt.getTime() - Date.now()) / 1000,
    );

    if (ttlSeconds > 0) {
      await RedisService.setJSON(key, session, ttlSeconds);
    }
  }

  /**
   * Get session from Redis
   */
  private static async getSessionFromRedis(
    sessionId: string,
  ): Promise<SessionData | null> {
    const key = CacheKeys.SESSION(sessionId);
    const data = await RedisService.getJSON<SessionData>(key);

    if (!data) {
      return null;
    }

    // Convert date strings back to Date objects if needed
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      expiresAt: new Date(data.expiresAt),
      lastAccessed: new Date(data.lastAccessed),
    };
  }

  /**
   * Delete session from Redis
   */
  private static async deleteSessionFromRedis(
    sessionId: string,
  ): Promise<void> {
    const key = CacheKeys.SESSION(sessionId);
    await RedisService.delete(key);
  }

  /**
   * Store session in Firestore
   */
  private static async storeSessionInFirestore(
    session: SessionData,
  ): Promise<void> {
    const firestoreData: FirestoreSessionData = {
      sessionId: session.sessionId,
      userId: session.userId,
      email: session.email,
      name: session.name,
      googleRefreshToken: session.googleRefreshToken,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      lastAccessed: session.lastAccessed.toISOString(),
      ...(session.metadata && { metadata: session.metadata }),
    };

    await db.createDocument("sessions", session.sessionId, firestoreData);
  }

  /**
   * Get session from Firestore
   */
  private static async getSessionFromFirestore(
    sessionId: string,
  ): Promise<SessionData | null> {
    const data = await db.getDocument<FirestoreSessionData>(
      "sessions",
      sessionId,
    );

    if (!data) {
      return null;
    }

    return {
      sessionId: data.sessionId,
      userId: data.userId,
      email: data.email,
      name: data.name,
      googleRefreshToken: data.googleRefreshToken,
      createdAt: new Date(data.createdAt),
      expiresAt: new Date(data.expiresAt),
      lastAccessed: new Date(data.lastAccessed),
      ...(data.metadata && { metadata: data.metadata }),
    };
  }

  /**
   * Update session in Firestore
   */
  private static async updateSessionInFirestore(
    sessionId: string,
    updates: Partial<FirestoreSessionData>,
  ): Promise<void> {
    await db.updateDocument("sessions", sessionId, updates);
  }

  /**
   * Delete session from Firestore
   */
  private static async deleteSessionFromFirestore(
    sessionId: string,
  ): Promise<void> {
    await db.deleteDocument("sessions", sessionId);
  }
}
