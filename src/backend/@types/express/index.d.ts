import { SessionData } from "@/types/session.types";

declare global {
  namespace Express {
    interface Request {
      session?: SessionData;
      userId?: string;
    }
  }
}

export {};
