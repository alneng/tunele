import { Request, Response, NextFunction } from "express";
import { AsyncLocalStorage } from "async_hooks";
import crypto from "crypto";

/**
 * Context stored for each request
 */
interface RequestContext {
  correlationId: string;
}

/**
 * AsyncLocalStorage instance for storing request context
 */
const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Get the current correlation ID from the request context
 * @returns The correlation ID or undefined if not in a request context
 */
export function getCorrelationId(): string | undefined {
  return requestContext.getStore()?.correlationId;
}

/**
 * Middleware to generate and track correlation IDs for request tracing.
 * - Generates a UUID for each request
 * - Stores it in AsyncLocalStorage for access throughout the request lifecycle
 * - Adds it to response headers for client visibility
 */
export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Use existing correlation ID from header if provided, otherwise generate new one
  const correlationId = (req.headers["x-correlation-id"] as string) || crypto.randomUUID();

  // Add correlation ID to response headers
  res.setHeader("X-Correlation-ID", correlationId);

  // Run the rest of the request in the context with the correlation ID
  requestContext.run({ correlationId }, () => {
    next();
  });
}
