import express from "express";
import { body, param } from "express-validator";
import { validateInputs } from "../utils/validation.utils";
import {
  isValidPlaylistId,
  isValidTimezoneString,
} from "../utils/validation.utils";
import CustomGameController from "../controllers/custom-game.controllers";

const router = express.Router();

router.get(
  "/:playlistId/dailySong",
  isValidPlaylistId(param("playlistId")),
  isValidTimezoneString("timeZone"),
  validateInputs,
  CustomGameController.getDailySong
);

router.get(
  "/:playlistId/allSongs",
  isValidPlaylistId(param("playlistId")),
  validateInputs,
  CustomGameController.getAllSongs
);

router.post(
  "/:playlistId/stats",
  isValidPlaylistId(param("playlistId")),
  isValidTimezoneString("timeZone"),
  body("score").isInt({ min: 0, max: 6 }),
  validateInputs,
  CustomGameController.postStats
);

export default router;
