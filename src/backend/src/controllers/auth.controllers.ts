import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.services";
import { createCookie } from "../utils/auth.utils";

export default class AuthController {
  static async getAuthWithCode(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { code, scope } = req.body;

      const { refreshToken, idToken, accessToken, expiresIn } =
        await AuthService.getAuthWithCode(code, scope);

      createCookie(res, "accessToken", accessToken, expiresIn * 1000);
      createCookie(res, "idToken", idToken, expiresIn * 1000);
      createCookie(
        res,
        "refreshToken",
        refreshToken,
        180 * 24 * 60 * 60 * 1000
      );
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async getAuthWithRefreshToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { refreshToken } = req.cookies;

      const { idToken, accessToken, expiresIn } =
        await AuthService.getAuthWithRefreshToken(refreshToken);

      createCookie(res, "accessToken", accessToken, expiresIn * 1000);
      createCookie(res, "idToken", idToken, expiresIn * 1000);
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async verifyAccessToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { accessToken, idToken, refreshToken } = req.cookies;

      const status = await AuthService.verifyAccessToken(
        accessToken,
        idToken,
        refreshToken
      );
      return res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }

  static async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("refreshToken", { path: "/" });
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("idToken", { path: "/" });
      return res.status(200).send();
    } catch (error) {
      next(error);
    }
  }
}
