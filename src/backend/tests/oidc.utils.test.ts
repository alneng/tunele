import {
  storeOIDCState,
  consumeOIDCState,
  validateNonce,
} from "../src/utils/oidc.utils";
import { RedisService } from "../src/lib/redis.service";
import { CacheKeys } from "../src/utils/redis.utils";
import {
  createStoredOIDCData,
  OIDC_STATE_TTL_SECONDS,
  TEST_NONCE,
  TEST_STATE,
} from "./fixtures/oidc.fixtures";

jest.mock("../src/lib/redis.service");

describe("OIDC Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("storeOIDCState", () => {
    it("should store state and nonce in Redis with TTL", async () => {
      await storeOIDCState(TEST_STATE, TEST_NONCE);

      expect(RedisService.setJSON).toHaveBeenCalledWith(
        CacheKeys.OIDC_STATE(TEST_STATE),
        expect.objectContaining({ state: TEST_STATE, nonce: TEST_NONCE }),
        OIDC_STATE_TTL_SECONDS,
      );
    });

    it("should store metadata when provided", async () => {
      await storeOIDCState(TEST_STATE, TEST_NONCE, {
        ipAddress: "192.168.1.1",
      });

      expect(RedisService.setJSON).toHaveBeenCalledWith(
        CacheKeys.OIDC_STATE(TEST_STATE),
        expect.objectContaining({
          state: TEST_STATE,
          nonce: TEST_NONCE,
          metadata: { ipAddress: "192.168.1.1" },
        }),
        OIDC_STATE_TTL_SECONDS,
      );
    });
  });

  describe("consumeOIDCState", () => {
    it("should retrieve and delete state from Redis", async () => {
      const mockData = createStoredOIDCData();
      (RedisService.getJSON as jest.Mock).mockResolvedValue(mockData);

      const result = await consumeOIDCState(TEST_STATE);
      const expectedCacheKey = CacheKeys.OIDC_STATE(TEST_STATE);

      expect(result).not.toBeNull();
      expect(result!.nonce).toBe(mockData.nonce);
      expect(RedisService.getJSON).toHaveBeenCalledWith(expectedCacheKey);
      expect(RedisService.delete).toHaveBeenCalledWith(expectedCacheKey);
    });

    it("should return null if state not found", async () => {
      (RedisService.getJSON as jest.Mock).mockResolvedValue(null);

      const result = await consumeOIDCState("non-existent-state");

      expect(result).toBeNull();
      expect(RedisService.delete).not.toHaveBeenCalled();
    });
  });

  describe("validateNonce", () => {
    it("should not throw if nonces match", () => {
      expect(() => validateNonce(TEST_NONCE, TEST_NONCE)).not.toThrow();
    });

    it("should throw if nonces do not match", () => {
      expect(() => validateNonce("wrong-nonce", TEST_NONCE)).toThrow(
        "Invalid nonce in ID token",
      );
    });

    it("should throw if token nonce is undefined", () => {
      expect(() => validateNonce(undefined, TEST_NONCE)).toThrow(
        "Invalid nonce in ID token",
      );
    });
  });
});
