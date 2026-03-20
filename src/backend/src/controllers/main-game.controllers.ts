import { Request, Response, NextFunction } from "express";
import { DateTime } from "luxon";
import MainGameService from "@/services/main-game.services";

export default class MainGameController {
  static async getDailySong(req: Request, res: Response, next: NextFunction) {
    try {
      const timeZone = req.query.timeZone;
      const now = DateTime.local().setZone(timeZone as string);
      const localDate = now.toFormat("yyyy-MM-dd");

      const dailySong = await MainGameService.getDailySong(localDate);
      return res.status(200).json(dailySong);
    } catch (error) {
      next(error);
    }
  }

  static async getAllSongs(_req: Request, res: Response, next: NextFunction) {
    try {
      const tracklist = await MainGameService.getAllSongs();
      return res.status(200).json({ tracklist });
    } catch (error) {
      next(error);
    }
  }

  static async postStats(req: Request, res: Response, next: NextFunction) {
    try {
      const timeZone = req.query.timeZone;
      const now = DateTime.local().setZone(timeZone as string);
      const localDate = now.toFormat("yyyy-MM-dd");
      const { score } = req.body;

      const status = await MainGameService.postStats(localDate, score);
      return res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }
}
