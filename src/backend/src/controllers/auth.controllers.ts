import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.services";
import { SessionService } from "../lib/session.service";
import config from "../config";

export default class AuthController {
  /**
   * Initiate OIDC flow
   * Stores state and nonce in Redis for server-side validation
   */
  static async initiateOIDC(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { state, nonce } = req.body;

      await AuthService.initiateOIDCFlow(state, nonce);

      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * OIDC authentication endpoint
   * Validates code, state, nonce, and PKCE, then creates a session
   */
  static async authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { code, state, nonce, code_verifier } = req.body;

      const { sessionId, expiresIn } =
        await AuthService.authenticateWithCode(
          code,
          state,
          nonce,
          code_verifier,
        );

      // Set session cookie (HttpOnly, Secure, SameSite)
      res.cookie("session", sessionId, {
        ...config.cookie,
        maxAge: expiresIn * 1000,
        httpOnly: true, // Prevents JavaScript access
        secure: config.env === "production", // HTTPS only in production
        sameSite: "lax", // CSRF protection
      });

      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify session (OIDC-based auth)
   */
  static async verifySession(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const sessionId = req.cookies.session;

      if (!sessionId) {
        return res.status(401).json({ error: "No session cookie" });
      }

      const session = await SessionService.getSession(sessionId);

      if (!session) {
        return res.status(401).json({ error: "Invalid or expired session" });
      }

      // Update last accessed time
      await SessionService.updateLastAccessed(sessionId);

      // Return user identity (compatible with frontend expectations)
      return res.status(200).json({
        id: session.userId,
        given_name: session.name,
        email: session.email,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const sessionId = req.cookies.session;

      // Delete session if it exists
      if (sessionId) {
        await SessionService.deleteSession(sessionId);
      }

      // Clear session cookie
      res.clearCookie("session", { path: "/" });

      return res.status(200).send();
    } catch (error) {
      next(error);
    }
  }
}
