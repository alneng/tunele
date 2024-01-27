const express = require("express");
const { cookie, param } = require("express-validator");
const { validateInputs } = require("../utils/utils");
const { isValidJsonBody, isValidUserId } = require("../utils/validation.utils");
const UserController = require("../controllers/user.controllers");

const router = express.Router();

router.get(
  "/:id/fetch-data",
  isValidUserId(param("id")),
  cookie("accessToken").isString().notEmpty(),
  cookie("idToken").isString().notEmpty(),
  validateInputs,
  UserController.getUserData
);

router.post(
  "/:id/post-data",
  isValidUserId(param("id")),
  cookie("accessToken").isString().notEmpty(),
  cookie("idToken").isString().notEmpty(),
  isValidJsonBody(),
  validateInputs,
  UserController.updateUserData
);

module.exports = router;
