import express from "express";
import { body } from "express-validator";
import {
  isValidTimezoneString,
  validateInputs,
} from "../utils/validation.utils";
import MainGameController from "../controllers/main-game.controllers";

const router = express.Router();

router.get(
  "/dailySong",
  isValidTimezoneString("timeZone"),
  validateInputs,
  MainGameController.getDailySong
);

router.get("/allSongs", MainGameController.getAllSongs);

router.post(
  "/stats",
  isValidTimezoneString("timeZone"),
  body("score").isInt({ min: 0, max: 6 }),
  validateInputs,
  MainGameController.postStats
);

export default router;
