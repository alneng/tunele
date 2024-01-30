/**
 * Custom Error type that has a status code and a message.
 * Extends default Error class
 *
 * @property status status code of the error
 * @property message error message
 */
class HttpException extends Error {
  status;

  /**
   * Constructs an error with a status and message.
   * @param status the status code of the error
   * @param message the message to send with the error
   */
  constructor(status, message) {
    super(message);
    this.status = status;
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
class AccessDeniedException extends HttpException {
  retry;

  /**
   * Constructs an error with a status and message.
   * @param status the status code of the error
   * @param message the message to send with the error
   * @param retry whether to retry the request
   */
  constructor(status, message, retry = false) {
    super(status, message);
    this.retry = retry;
  }
}

/**
 * Error handling middleware. Takes the error and sends back the status of it and the message
 */
function errorHandler(error, req, res, next) {
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
    res.status(500).json({ message: JSON.stringify(error) });
    throw error;
  }
}

module.exports = { HttpException, AccessDeniedException, errorHandler };
