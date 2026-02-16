import { NextFunction, Request, Response } from "express";
import { RateLimitException } from "../utils/errors.utils";
import config from "../config";
import rateLimit from "express-rate-limit";

const rateLimitHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => {
  next(new RateLimitException());
};

/**
 * Create a rate limiter middleware for the API. Only applies in production.
 *
 * @returns a rate limiter middleware factory
 */
export const createRateLimiter = () => {
  if (config.env === "production") {
    return rateLimit({
      windowMs: 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      skipFailedRequests: true,
      handler: rateLimitHandler,
      validate: { trustProxy: false },
    });
  }

  // Return a pass-through middleware for non-production environments
  return (_req: Request, _res: Response, next: NextFunction) => next();
};

/**
 * Stricter rate limiter for auth endpoints. Protects against brute force,
 * credential stuffing, and auth-related DoS. Only applies in production.
 *
 * Limits: 20 requests per 10 minutes per IP.
 *
 * @returns a rate limiter middleware factory
 */
export const createAuthRateLimiter = () => {
  if (config.env === "production") {
    return rateLimit({
      windowMs: 10 * 60 * 1000,
      max: 20,
      standardHeaders: true,
      legacyHeaders: false,
      skipFailedRequests: true,
      handler: rateLimitHandler,
      validate: { trustProxy: false },
    });
  }

  return (_req: Request, _res: Response, next: NextFunction) => next();
};
