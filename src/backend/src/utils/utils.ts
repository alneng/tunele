import { config } from "dotenv";
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const loadDotenv = () => {
  if (process.env.NODE_ENV !== "production")
    config({ path: ".env.development" });
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
