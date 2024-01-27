const fs = require("fs");
const { validationResult } = require("express-validator");
const { DateTime } = require("luxon");

function loadDotenv() {
  const envFile = fs.existsSync(".env.development")
    ? ".env.development"
    : ".env";
  require("dotenv").config({ path: envFile });
}

function isValidJsonBody() {
  return function (req, res, next) {
    if (req.is("json")) {
      return next();
    }
    return res.status(400).json({
      errors: [{ type: "field", msg: "Invalid body", location: "body" }],
    });
  };
}

function isValidPlaylistId(validationObject) {
  return validationObject.isString().notEmpty().isLength({ min: 22, max: 22 });
}

function isValidTimezoneString(tz) {
  return function (req, res, next) {
    const timeZoneQuery = req.query[tz];
    const { timeZone } = req.body;
    const timeZoneValue = timeZoneQuery ?? timeZone ?? "invalid";
    if (!DateTime.local().setZone(timeZoneValue).isValid) {
      return res
        .status(400)
        .json({
          errors: [
            { type: "field", msg: "Invalid timeZone", location: "query" },
          ],
        });
    }
    next();
  };
}

function isValidUserId(validationObject) {
  return validationObject.isString().notEmpty().isLength({ min: 21, max: 21 });
}

function validateInputs(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = {
  loadDotenv,
  isValidJsonBody,
  isValidPlaylistId,
  isValidTimezoneString,
  isValidUserId,
  validateInputs,
};
