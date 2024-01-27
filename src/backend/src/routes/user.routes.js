const express = require("express");
const { body, cookie, param } = require("express-validator");
const {
  isValidJsonBody,
  isValidUserId,
  validateInputs,
} = require("../utils/utils");
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
