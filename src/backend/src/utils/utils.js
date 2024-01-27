const fs = require("fs");
const { validationResult } = require("express-validator");

function loadDotenv() {
  const envFile = fs.existsSync(".env.development")
    ? ".env.development"
    : ".env";
  require("dotenv").config({ path: envFile });
}

function validateInputs(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = { loadDotenv, validateInputs };
