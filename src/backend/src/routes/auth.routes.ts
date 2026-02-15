import express from "express";
import { body } from "express-validator";
import { validateInputs } from "../utils/validation.utils";
import AuthController from "../controllers/auth.controllers";

const router = express.Router();

// Initiate OIDC flow (store state and nonce)
router.post(
  "/initiate",
  body("state").isString().notEmpty().isLength({ max: 1024 }),
  body("nonce").isString().notEmpty().isLength({ max: 1024 }),
  validateInputs,
  AuthController.initiateOIDC,
);

// OIDC authentication callback
router.post(
  "/callback",
  body("code").isString().notEmpty().isLength({ max: 2048 }),
  body("state").isString().notEmpty().isLength({ max: 1024 }),
  body("nonce").isString().notEmpty().isLength({ max: 1024 }),
  body("code_verifier").isString().notEmpty().isLength({ max: 1024 }),
  validateInputs,
  AuthController.authenticate,
);

// Verify session
router.get("/verify", AuthController.verifySession);

// Logout
router.get("/logout", AuthController.logout);

export default router;
