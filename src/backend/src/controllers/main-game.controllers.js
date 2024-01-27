const { DateTime } = require("luxon");
const MainGameService = require("../services/main-game.services");

module.exports = class MainGameController {
  static async getDailySong(req, res, next) {
    try {
      const timeZone = req.query.timeZone;
      const now = DateTime.local().setZone(timeZone);
      const localDate = now.toFormat("yyyy-MM-dd");

      const dailySong = await MainGameService.getDailySong(localDate);
      return res.status(200).json(dailySong);
    } catch (error) {
      next(error);
    }
  }

  static async getAllSongs(req, res, next) {
    try {
      const tracklist = await MainGameService.getAllSongs();
      return res.status(200).json(tracklist);
    } catch (error) {
      next(error);
    }
  }

  static async postStats(req, res, next) {
    try {
      const timeZone = req.query.timeZone;
      const now = DateTime.local().setZone(timeZone);
      const localDate = now.toFormat("yyyy-MM-dd");
      const { score } = req.body;

      const status = await MainGameService.postStats(localDate, score);
      return res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }
};
