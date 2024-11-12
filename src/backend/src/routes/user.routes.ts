import express from "express";
import { cookie, param } from "express-validator";
import {
  isValidJsonBody,
  isValidUserId,
  validateInputs,
} from "../utils/validation.utils";
import UserController from "../controllers/user.controllers";

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

export default router;
