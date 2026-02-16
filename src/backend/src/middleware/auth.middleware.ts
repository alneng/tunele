import { Request, Response, NextFunction } from "express";
import { SessionService } from "../lib/session.service";
import { log } from "../utils/logger.utils";
import { verifySession } from "../utils/auth.utils";

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
    const session = await verifySession(sessionId);

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
