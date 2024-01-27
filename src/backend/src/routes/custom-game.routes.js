const express = require("express");
const { body, param } = require("express-validator");
const { validateInputs } = require("../utils/utils");
const {
  isValidPlaylistId,
  isValidTimezoneString,
} = require("../utils/validation.utils");
const CustomGameController = require("../controllers/custom-game.controllers");

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

module.exports = router;
