const AuthService = require("../services/auth.services");
const { createCookie } = require("../utils/auth.utils");

module.exports = class AuthController {
  static async getAuthWithCode(req, res, next) {
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

  static async getAuthWithRefreshToken(req, res, next) {
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

  static async verifyAccessToken(req, res, next) {
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
