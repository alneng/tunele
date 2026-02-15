import { Request, Response, NextFunction } from "express";
import { requireAuth, optionalAuth } from "../src/middleware/auth.middleware";
import { SessionService } from "../src/lib/session.service";
import {
  createExpiredSession,
  createMockSession,
} from "./fixtures/session.fixtures";

jest.mock("../src/lib/session.service");

describe("Auth Middleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = { cookies: {} };
    mockResponse = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("requireAuth", () => {
    it("should attach session to request if valid", async () => {
      const mockSession = createMockSession();
      mockRequest.cookies = { session: mockSession.sessionId };
      (SessionService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (SessionService.updateLastAccessed as jest.Mock).mockResolvedValue(
        undefined,
      );

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.session).toEqual(mockSession);
      expect(mockRequest.userId).toBe(mockSession.userId);
      expect(mockNext).toHaveBeenCalledWith();
      expect(mockNext).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it("should throw AccessDeniedException if no session cookie", async () => {
      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ status: 401, message: "No session cookie" }),
      );
    });

    it("should throw AccessDeniedException if session not found", async () => {
      const mockSession = createMockSession();
      mockRequest.cookies = { session: mockSession.sessionId };
      (SessionService.getSession as jest.Mock).mockResolvedValue(null);

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          message: "Invalid or expired session",
        }),
      );
    });

    it("should throw AccessDeniedException if session is expired", async () => {
      const expiredSession = createExpiredSession();
      mockRequest.cookies = { session: expiredSession.sessionId };
      (SessionService.getSession as jest.Mock).mockResolvedValue(
        expiredSession,
      );

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ status: 401, message: "Session expired" }),
      );
      expect(SessionService.deleteSession).toHaveBeenCalledWith(
        expiredSession.sessionId,
      );
    });

    it("should update last accessed time", async () => {
      const mockSession = createMockSession();
      mockRequest.cookies = { session: mockSession.sessionId };
      (SessionService.getSession as jest.Mock).mockResolvedValue(mockSession);
      (SessionService.updateLastAccessed as jest.Mock).mockResolvedValue(
        undefined,
      );

      await requireAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(SessionService.updateLastAccessed).toHaveBeenCalledWith(
        mockSession,
      );
    });
  });

  describe("optionalAuth", () => {
    it("should attach session if valid", async () => {
      const mockSession = createMockSession();
      mockRequest.cookies = { session: mockSession.sessionId };
      (SessionService.getSession as jest.Mock).mockResolvedValue(mockSession);

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.session).toEqual(mockSession);
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should continue without error if no session cookie", async () => {
      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.session).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should continue without error if session not found", async () => {
      const mockSession = createMockSession();
      mockRequest.cookies = { session: mockSession.sessionId };
      (SessionService.getSession as jest.Mock).mockResolvedValue(null);

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.session).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });

    it("should not attach expired session", async () => {
      const expiredSession = createExpiredSession();
      mockRequest.cookies = { session: expiredSession.sessionId };
      (SessionService.getSession as jest.Mock).mockResolvedValue(
        expiredSession,
      );

      await optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext,
      );

      expect(mockRequest.session).toBeUndefined();
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
