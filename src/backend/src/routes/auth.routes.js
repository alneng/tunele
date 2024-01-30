const express = require("express");
const { body, cookie } = require("express-validator");
const { validateInputs } = require("../utils/utils");
const AuthController = require("../controllers/auth.controllers");

const router = express.Router();

router.post(
  "/code",
  body("code").isString().notEmpty(),
  body("scope").isString().notEmpty(),
  validateInputs,
  AuthController.getAuthWithCode
);

router.post(
  "/refresh-token",
  cookie("refreshToken").isString().notEmpty(),
  validateInputs,
  AuthController.getAuthWithRefreshToken
);

router.get("/vat", AuthController.verifyAccessToken);

router.get("/logout", AuthController.logout);

module.exports = router;
