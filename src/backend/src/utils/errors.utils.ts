import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { log } from "./logger.utils";

/**
 * Custom Error type that has a status code and a message.
 * Extends default Error class
 *
 * @property status status code of the error
 * @property message error message
 */
export class HttpException extends Error {
  public status: number;

  /**
   * Constructs an error with a status and message.
   * @param status the status code of the error
   * @param message the message to send with the error
   */
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class RateLimitException extends HttpException {
  constructor() {
    super(429, "Too many requests, please try again later");
  }
}

export class EmptyPlaylistException extends HttpException {
  constructor() {
    super(
      400,
      "Failed to use playlist: Playlist is empty or has no usable songs"
    );
  }
}

/**
 * Custom Error type that has a status code, message, and whether to retry request.
 * Extends HttpException
 *
 * @property status status code of the error
 * @property message error message
 * @property whether to retry the request
 */
export class AccessDeniedException extends HttpException {
  public retry: boolean;

  /**
   * Constructs an error with a status and message.
   * @param status the status code of the error
   * @param message the message to send with the error
   * @param retry whether to retry the request
   */
  constructor(status: number, message: string, retry = false) {
    super(status, message);
    this.retry = retry;
  }
}

/**
 * Error handling middleware. Takes the error and sends back the status of it and the message
 */
export const errorHandler: ErrorRequestHandler = (
  error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof HttpException) {
    let additionalErrorInfo = {};
    if (error instanceof AccessDeniedException)
      additionalErrorInfo = { ...additionalErrorInfo, retry: error.retry };

    res
      .status(error.status)
      .json({ ...additionalErrorInfo, message: error.message });
  } else {
    log.error("errorHandler encountered unexpected error", {
      meta: {
        error,
        stack: error.stack,
        path: req.path,
        method: req.method,
      },
    });
    res.status(500).json({ message: JSON.stringify(error) });
    throw error;
  }
};
