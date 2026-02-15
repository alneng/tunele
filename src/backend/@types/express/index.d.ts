import { SessionData } from "../../src/types/session.types";

declare global {
  namespace Express {
    interface Request {
      session?: SessionData;
      userId?: string;
    }
  }
}

export {};
