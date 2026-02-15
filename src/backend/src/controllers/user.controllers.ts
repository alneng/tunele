import { Request, Response, NextFunction } from "express";
import UserService from "../services/user.services";
import { AccessDeniedException } from "../utils/errors.utils";

export default class UserController {
  /**
   * Get user data (session-based auth)
   */
  static async getUserData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const session = req.session;

      if (!session) {
        throw new AccessDeniedException(401, "No session", false);
      }

      // Verify user is accessing their own data
      if (session.userId !== userId) {
        throw new AccessDeniedException(401, "Unauthorized", false);
      }

      const { status, message } = await UserService.getUserDataWithSession(
        userId,
      );
      return res.status(status).json(message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user data (session-based auth)
   */
  static async updateUserData(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.params.id;
      const session = req.session;
      const bodyData = req.body;

      if (!session) {
        throw new AccessDeniedException(401, "No session", false);
      }

      // Verify user is accessing their own data
      if (session.userId !== userId) {
        throw new AccessDeniedException(401, "Unauthorized", false);
      }

      const { status, message } = await UserService.updateUserDataWithSession(
        userId,
        bodyData,
        session.email,
      );
      return res.status(status).json(message);
    } catch (error) {
      next(error);
    }
  }

}
