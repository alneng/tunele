import { Request, Response, NextFunction } from "express";
import { DateTime } from "luxon";
import CustomGameService from "@/services/custom-game.services";

export default class CustomGameController {
  static async getDailySong(req: Request, res: Response, next: NextFunction) {
    try {
      const playlistId = req.params.playlistId;
      const timeZone = req.query.timeZone;
      const now = DateTime.local().setZone(timeZone as string);
      const localDate = now.toFormat("yyyy-MM-dd");
      const refreshFlag = req.query.r === "1";

      const dailySong = await CustomGameService.getDailySong(playlistId, localDate, refreshFlag);
      return res.status(200).json(dailySong);
    } catch (error) {
      next(error);
    }
  }

  static async getAllSongs(req: Request, res: Response, next: NextFunction) {
    try {
      const playlistId = req.params.playlistId;

      const tracklist = await CustomGameService.getAllSongs(playlistId);
      return res.status(200).json({ tracklist });
    } catch (error) {
      next(error);
    }
  }

  static async postStats(req: Request, res: Response, next: NextFunction) {
    try {
      const playlistId = req.params.playlistId;
      const timeZone = req.query.timeZone;
      const now = DateTime.local().setZone(timeZone as string);
      const localDate = now.toFormat("yyyy-MM-dd");
      const { score } = req.body;

      const status = await CustomGameService.postStats(playlistId, localDate, score);
      return res.status(200).json(status);
    } catch (error) {
      next(error);
    }
  }
}
