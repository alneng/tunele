import rateLimit from "express-rate-limit";
import { RateLimitException } from "./errors.utils";
import { NextFunction, Request, Response } from "express";
import { NODE_ENV } from "../config";

/**
 * Create a rate limiter middleware for the API. Only applies in production.
 *
 * @returns a rate limiter middleware factory
 */
export const createRateLimiter = () => {
  if (NODE_ENV === "production") {
    return rateLimit({
      windowMs: 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      skipFailedRequests: true,
      handler: (_req: Request, _res: Response, next: NextFunction) => {
        next(new RateLimitException());
      },
      validate: { trustProxy: false },
    });
  }

  // Return a pass-through middleware for non-production environments
  return (_req: Request, _res: Response, next: NextFunction) => next();
};
