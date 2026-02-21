import { AccessDeniedException } from "@/utils/errors.utils";
import { SessionService } from "@/lib/session.service";
import { SessionData } from "@/types/session.types";

/**
 * Verify session is valid.
 *
 * @param sessionId session ID from cookie
 * @throws AccessDeniedException if no session provided
 * @throws AccessDeniedException if session is invalid
 * @throws AccessDeniedException if session is expired
 * @returns session data
 */
export const verifySession = async (
  sessionId: string | undefined,
): Promise<SessionData> => {
  if (!sessionId) {
    throw new AccessDeniedException(401, "No session provided", false);
  }

  const session = await SessionService.getSession(sessionId);

  if (!session) {
    throw new AccessDeniedException(401, "Invalid session", false);
  }

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    await SessionService.deleteSession(sessionId);
    throw new AccessDeniedException(401, "Session expired", false);
  }

  return session;
};

/**
 * Verify session is valid for the given user ID.
 *
 * @param session session data
 * @param userId user ID to verify against
 * @throws AccessDeniedException if session and user id mismatch
 */
export const verifySessionForUserId = async (
  session: SessionData,
  userId: string,
): Promise<void> => {
  if (session.userId !== userId) {
    throw new AccessDeniedException(401, "Unauthorized", false);
  }
};
