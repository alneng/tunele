import express from "express";
import { param } from "express-validator";
import {
  isValidJsonBody,
  isValidUserId,
  validateInputs,
} from "../utils/validation.utils";
import UserController from "../controllers/user.controllers";
import { requireAuth } from "../middleware/auth.middleware";

const router = express.Router();

// Session-based auth routes
router.get(
  "/:id/fetch-data",
  requireAuth,
  isValidUserId(param("id")),
  validateInputs,
  UserController.getUserData,
);

router.post(
  "/:id/post-data",
  requireAuth,
  isValidUserId(param("id")),
  isValidJsonBody(),
  validateInputs,
  UserController.updateUserData,
);

export default router;
