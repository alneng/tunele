const express = require("express");
const { body } = require("express-validator");
const { isValidTimezoneString, validateInputs } = require("../utils/utils");
const MainGameController = require("../controllers/main-game.controllers");

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

module.exports = router;
