import { Request } from "express";
import { RequestMetadata } from "../types/session.types";

/**
 * Extract request metadata for audit trail.
 * Extensible for future fields (userAgent, etc.).
 */
export function getRequestMetadata(req: Request): RequestMetadata | undefined {
  if (!req.ip) return undefined;
  return { ipAddress: req.ip };
}
