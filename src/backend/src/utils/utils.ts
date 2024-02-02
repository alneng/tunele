import { config } from "dotenv";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import fs from "fs";

export const loadDotenv = () => {
  const envFile = fs.existsSync(".env.development")
    ? ".env.development"
    : ".env";
  config({ path: envFile });
};

export const validateInputs = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
