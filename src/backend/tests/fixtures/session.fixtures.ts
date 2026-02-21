import type {
  SessionData,
  FirestoreSessionData,
  UserIdentity,
} from "@/types/session.types";

/** Default session ID for tests that don't mock generateUUID */
export const DEFAULT_SESSION_ID = "test-session";

/** Session ID used when crypto.utils.generateUUID is mocked (e.g. session.service.test) */
export const MOCK_SESSION_ID = "test-session-id";

/** Default user identity for auth/session tests */
export const TEST_USER_IDENTITY: UserIdentity = {
  sub: "google-user-123",
  email: "test@example.com",
  name: "Test User",
};

/** Plain refresh token before encryption */
export const TEST_REFRESH_TOKEN = "google-refresh-token";

/** Encrypted refresh token (matches mock: encrypted_${plain}) */
export const ENCRYPTED_REFRESH_TOKEN = `encrypted_${TEST_REFRESH_TOKEN}`;

/** One day in ms */
const ONE_DAY_MS = 86400000;

/**
 * Creates a mock session for Redis/in-memory use (Date objects).
 * Use createFirestoreSession for Firestore format (ISO strings).
 */
export function createMockSession(
  overrides: Partial<SessionData> & Record<string, unknown> = {},
): SessionData {
  const sessionId = (overrides.sessionId as string) ?? DEFAULT_SESSION_ID;
  return {
    sessionId,
    userId: TEST_USER_IDENTITY.sub,
    email: TEST_USER_IDENTITY.email,
    name: TEST_USER_IDENTITY.name,
    googleRefreshToken: ENCRYPTED_REFRESH_TOKEN,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + ONE_DAY_MS),
    lastAccessed: new Date(),
    ...overrides,
  } as SessionData;
}

/**
 * Creates an expired mock session (Redis format with Date objects).
 */
export function createExpiredSession(
  overrides: Partial<SessionData> & Record<string, unknown> = {},
): SessionData {
  return createMockSession({
    createdAt: new Date(Date.now() - ONE_DAY_MS * 8),
    expiresAt: new Date(Date.now() - ONE_DAY_MS),
    lastAccessed: new Date(Date.now() - ONE_DAY_MS),
    ...overrides,
  });
}

/**
 * Converts Date fields to ISO strings for Firestore format.
 */
function toFirestoreDates(session: SessionData): FirestoreSessionData {
  return {
    ...session,
    createdAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
    lastAccessed: session.lastAccessed.toISOString(),
  };
}

/**
 * Creates a mock session in Firestore format (ISO date strings).
 */
export function createFirestoreSession(
  overrides: Partial<SessionData> & Record<string, unknown> = {},
): FirestoreSessionData {
  return toFirestoreDates(createMockSession(overrides));
}

/**
 * Creates an expired session in Firestore format.
 */
export function createExpiredFirestoreSession(
  overrides: Partial<SessionData> & Record<string, unknown> = {},
): FirestoreSessionData {
  return toFirestoreDates(createExpiredSession(overrides));
}

/**
 * Session fixtures with MOCK_SESSION_ID (for tests that mock generateUUID).
 */
export const sessionServiceFixtures = {
  createMockSession: (overrides: Record<string, unknown> = {}) =>
    createMockSession({ sessionId: MOCK_SESSION_ID, ...overrides }),
  createFirestoreSession: (overrides: Record<string, unknown> = {}) =>
    createFirestoreSession({ sessionId: MOCK_SESSION_ID, ...overrides }),
  createExpiredFirestoreSession: (overrides: Record<string, unknown> = {}) =>
    createExpiredFirestoreSession({ sessionId: MOCK_SESSION_ID, ...overrides }),
};
