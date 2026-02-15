import { AccessDeniedException } from "../utils/errors.utils";
import { SessionService } from "../lib/session.service";
import { SessionData } from "../types/session.types";

/**
 * Verify and get session data
 *
 * @param sessionId session ID from cookie
 * @throws AccessDeniedException if invalid or expired session
 * @returns session data
 */
export const verifySession = async (
  sessionId: string,
): Promise<SessionData> => {
  if (!sessionId) {
    throw new AccessDeniedException(401, "No session provided", false);
  }

  const session = await SessionService.getSession(sessionId);

  if (!session) {
    throw new AccessDeniedException(401, "Invalid or expired session", false);
  }

  return session;
};

/**
 * Verify session and check user ID matches
 *
 * @param sessionId session ID from cookie
 * @param userId user ID to verify against
 * @throws AccessDeniedException if session invalid or user mismatch
 * @returns session data
 */
export const verifySessionForUser = async (
  sessionId: string,
  userId: string,
): Promise<SessionData> => {
  const session = await verifySession(sessionId);

  if (session.userId !== userId) {
    throw new AccessDeniedException(401, "Unauthorized", false);
  }

  return session;
};
