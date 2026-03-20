import { Request, Response, NextFunction } from "express";
import UserService from "@/services/user.services";
import { verifySessionForUserId } from "@/utils/auth.utils";

export default class UserController {
  /**
   * Get user data (session-based auth)
   */
  static async getUserData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const session = req.session!; // Session is guaranteed to be present by requireAuth middleware
      await verifySessionForUserId(session, userId);

      const { status, message } = await UserService.getUserData(userId);
      return res.status(status).json(message);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user data (session-based auth)
   */
  static async updateUserData(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.id;
      const session = req.session!; // Session is guaranteed to be present by requireAuth middleware
      const bodyData = req.body;

      await verifySessionForUserId(session, userId);

      const { status, message } = await UserService.updateUserData(userId, bodyData);
      return res.status(status).json(message);
    } catch (error) {
      next(error);
    }
  }
}
