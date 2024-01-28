const UserService = require("../services/user.services");

module.exports = class UserController {
  static async getUserData(req, res, next) {
    try {
      const userId = req.params.id;
      const { accessToken, idToken, refreshToken } = req.cookies;

      const { status, message } = await UserService.getUserData(
        userId,
        accessToken,
        idToken,
        refreshToken
      );
      return res.status(status).json(message);
    } catch (error) {
      next(error);
    }
  }

  static async updateUserData(req, res, next) {
    try {
      const userId = req.params.id;
      const { accessToken, idToken, refreshToken } = req.cookies;
      const bodyData = req.body;

      const { status, message } = await UserService.updateUserData(
        userId,
        bodyData,
        accessToken,
        idToken,
        refreshToken
      );
      return res.status(status).json(message);
    } catch (error) {
      next(error);
    }
  }
};
