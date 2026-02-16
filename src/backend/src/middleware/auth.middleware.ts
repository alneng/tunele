import { Request, Response, NextFunction } from "express";
import { SessionService } from "../lib/session.service";
import { AccessDeniedException } from "../utils/errors.utils";
import { log } from "../utils/logger.utils";

/**
 * Middleware to require authentication via session
 * Validates session cookie and attaches session data to request
 *
 * @throws AccessDeniedException if no session or invalid session
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const sessionId: string | undefined = req.cookies.session;

    if (!sessionId) {
      throw new AccessDeniedException(401, "No session cookie", false);
    }

    const session = await SessionService.getSession(sessionId);

    if (!session) {
      throw new AccessDeniedException(401, "Invalid or expired session", false);
    }

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      await SessionService.deleteSession(sessionId);
      throw new AccessDeniedException(401, "Session expired", false);
    }

    // Attach session data to request
    req.session = session;
    req.userId = session.userId;

    // Update last accessed time (async, don't await to avoid blocking)
    SessionService.updateLastAccessed(session).catch((error) => {
      log.error("Failed to update session last accessed", {
        meta: { error: JSON.stringify(error) },
      });
    });

    next();
  } catch (error) {
    next(error);
  }
}
