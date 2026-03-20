import { SessionService } from "@/lib/session.service";
import { RedisService } from "@/lib/redis.service";
import db from "@/lib/firebase";
import { CacheKeys } from "@/utils/redis.utils";
import {
  MOCK_SESSION_ID,
  TEST_USER_IDENTITY,
  TEST_REFRESH_TOKEN,
  ENCRYPTED_REFRESH_TOKEN,
  sessionServiceFixtures,
} from "@test/fixtures/session.fixtures";

const SESSIONS_COLLECTION = "sessions";

jest.mock("@/lib/redis.service");
jest.mock("@/lib/firebase");
jest.mock("@/utils/crypto.utils", () => ({
  encrypt: jest.fn((text: string) => `encrypted_${text}`),
  decrypt: jest.fn((text: string) => text.replace("encrypted_", "")),
  generateUUID: jest.fn(() => MOCK_SESSION_ID),
}));

describe("SessionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSession", () => {
    it("should create a session in both Firestore and Redis", async () => {
      const result = await SessionService.createSession(TEST_USER_IDENTITY, TEST_REFRESH_TOKEN);

      expect(result).toHaveProperty("sessionId");
      expect(result).toHaveProperty("expiresIn");
      expect(result.sessionId).toBe(MOCK_SESSION_ID);

      expect(db.createDocument).toHaveBeenCalledWith(
        SESSIONS_COLLECTION,
        MOCK_SESSION_ID,
        expect.objectContaining({
          sessionId: MOCK_SESSION_ID,
          userId: TEST_USER_IDENTITY.sub,
          email: TEST_USER_IDENTITY.email,
          name: TEST_USER_IDENTITY.name,
          googleRefreshToken: ENCRYPTED_REFRESH_TOKEN,
        }),
      );

      expect(RedisService.setJSON).toHaveBeenCalledWith(
        CacheKeys.SESSION(result.sessionId),
        expect.any(Object),
        expect.any(Number),
      );
    });

    it("should encrypt the Google refresh token", async () => {
      const plainToken = "plain-refresh-token";

      await SessionService.createSession(TEST_USER_IDENTITY, plainToken);

      expect(db.createDocument).toHaveBeenCalledWith(
        SESSIONS_COLLECTION,
        expect.any(String),
        expect.objectContaining({
          googleRefreshToken: `encrypted_${plainToken}`,
        }),
      );
    });
  });

  describe("getSession", () => {
    it("should return session from Redis cache if available", async () => {
      const mockSession = sessionServiceFixtures.createMockSession();
      (RedisService.getJSON as jest.Mock).mockResolvedValue(mockSession);

      const result = await SessionService.getSession(mockSession.sessionId);

      expect(result).toEqual(mockSession);
      expect(RedisService.getJSON).toHaveBeenCalledWith(CacheKeys.SESSION(mockSession.sessionId));
      expect(db.getDocument).not.toHaveBeenCalled();
    });

    it("should fall back to Firestore if not in Redis", async () => {
      const firestoreSession = sessionServiceFixtures.createFirestoreSession();
      (RedisService.getJSON as jest.Mock).mockResolvedValue(null);
      (db.getDocument as jest.Mock).mockResolvedValue(firestoreSession);

      const result = await SessionService.getSession(firestoreSession.sessionId);

      expect(result).toBeDefined();
      expect(result?.userId).toBe(firestoreSession.userId);
      expect(RedisService.getJSON).toHaveBeenCalled();
      expect(db.getDocument).toHaveBeenCalledWith(SESSIONS_COLLECTION, firestoreSession.sessionId);
      expect(RedisService.setJSON).toHaveBeenCalled();
    });

    it("should return null if session not found", async () => {
      (RedisService.getJSON as jest.Mock).mockResolvedValue(null);
      (db.getDocument as jest.Mock).mockResolvedValue(null);

      const result = await SessionService.getSession("non-existent-session");

      expect(result).toBeNull();
    });

    it("should return null if session is expired", async () => {
      const expiredSession = sessionServiceFixtures.createExpiredFirestoreSession();
      (RedisService.getJSON as jest.Mock).mockResolvedValue(null);
      (db.getDocument as jest.Mock).mockResolvedValue(expiredSession);

      const result = await SessionService.getSession(expiredSession.sessionId);

      expect(result).toBeNull();
    });
  });

  describe("deleteSession", () => {
    it("should delete session from both Redis and Firestore", async () => {
      await SessionService.deleteSession(MOCK_SESSION_ID);

      expect(RedisService.delete).toHaveBeenCalledWith(CacheKeys.SESSION(MOCK_SESSION_ID));
      expect(db.deleteDocument).toHaveBeenCalledWith(SESSIONS_COLLECTION, MOCK_SESSION_ID);
    });
  });

  describe("getGoogleRefreshToken", () => {
    it("should decrypt and return the refresh token", async () => {
      const mockSession = sessionServiceFixtures.createMockSession();
      (RedisService.getJSON as jest.Mock).mockResolvedValue(mockSession);

      const result = await SessionService.getGoogleRefreshToken(mockSession.sessionId);

      // decrypt mock strips "encrypted_" prefix, so we expect the original token
      expect(result).toBe(TEST_REFRESH_TOKEN);
    });

    it("should return null if session not found", async () => {
      (RedisService.getJSON as jest.Mock).mockResolvedValue(null);
      (db.getDocument as jest.Mock).mockResolvedValue(null);

      const result = await SessionService.getGoogleRefreshToken("non-existent-session");

      expect(result).toBeNull();
    });
  });
});
