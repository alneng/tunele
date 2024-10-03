import express from "express";
import { body, cookie } from "express-validator";
import { validateInputs } from "../utils/validation.utils";
import AuthController from "../controllers/auth.controllers";

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

export default router;
