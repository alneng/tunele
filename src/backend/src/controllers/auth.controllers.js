const AuthService = require("../services/auth.services");
const { createCookie } = require("../utils/auth.utils");

module.exports = class AuthController {
  static async getAuthWithCode(req, res, next) {
    try {
      const { code, scope } = req.body;

      const {
        success,
        message,
        refreshToken,
        idToken,
        accessToken,
        expiresIn,
      } = await AuthService.getAuthWithCode(code, scope);

      if (!success) {
        return res.status(500).json({
          success: false,
          message,
        });
      }

      createCookie(res, "accessToken", accessToken, expiresIn * 1000);
      createCookie(res, "idToken", idToken, expiresIn * 1000);
      createCookie(
        res,
        "refreshToken",
        refreshToken,
        180 * 24 * 60 * 60 * 1000
      );
      return res.status(200).json({ success });
    } catch (error) {
      next(error);
    }
  }

  static async getAuthWithRefreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      const { success, message, idToken, accessToken, expiresIn } =
        await AuthService.getAuthWithRefreshToken(refreshToken);

      if (!success) {
        return res.status(500).json({
          success: false,
          message,
        });
      }

      createCookie(res, "accessToken", accessToken, expiresIn * 1000);
      createCookie(res, "idToken", idToken, expiresIn * 1000);
      return res.status(200).json({ success });
    } catch (error) {
      next(error);
    }
  }

  static async verifyAccessToken(req, res, next) {
    try {
      const { accessToken, idToken, refreshToken } = req.cookies;

      const status = await AuthService.verifyAccessToken(
        accessToken,
        idToken,
        refreshToken
      );
      return res.status(status.status).json(status);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      res.clearCookie("refreshToken", { path: "/" });
      res.clearCookie("accessToken", { path: "/" });
      res.clearCookie("idToken", { path: "/" });
      return res.status(200).send();
    } catch (error) {
      next(error);
    }
  }
};
