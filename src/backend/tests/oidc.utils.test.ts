import {
  storeOIDCState,
  consumeOIDCState,
  validateNonce,
  validatePKCE,
  generateOIDCParams,
} from "../src/utils/oidc.utils";
import { RedisService } from "../src/lib/redis.service";
import { CacheKeys } from "../src/utils/redis.utils";
import {
  createStoredOIDCData,
  EXPECTED_HEX_LENGTH,
  OIDC_STATE_TTL_SECONDS,
  PKCE_TEST_VECTOR,
  TEST_NONCE,
  TEST_STATE,
} from "./fixtures/oidc.fixtures";

jest.mock("../src/lib/redis.service");

describe("OIDC Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateOIDCParams", () => {
    it("should generate state and nonce of correct length", () => {
      const params = generateOIDCParams();

      expect(params).toHaveProperty("state");
      expect(params).toHaveProperty("nonce");
      expect(params.state).toHaveLength(EXPECTED_HEX_LENGTH);
      expect(params.nonce).toHaveLength(EXPECTED_HEX_LENGTH);
    });

    it("should generate unique values each time", () => {
      const params1 = generateOIDCParams();
      const params2 = generateOIDCParams();

      expect(params1.state).not.toBe(params2.state);
      expect(params1.nonce).not.toBe(params2.nonce);
    });
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
  });

  describe("consumeOIDCState", () => {
    it("should retrieve and delete state from Redis", async () => {
      const mockData = createStoredOIDCData();
      (RedisService.getJSON as jest.Mock).mockResolvedValue(mockData);

      const result = await consumeOIDCState(TEST_STATE);
      const expectedCacheKey = CacheKeys.OIDC_STATE(TEST_STATE);

      expect(result).toBe(mockData.nonce);
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

  describe("validatePKCE", () => {
    it("should validate plain code_challenge", () => {
      const verifier = "test-verifier";

      expect(validatePKCE(verifier, verifier, "plain")).toBe(true);
    });

    it("should validate S256 code_challenge", () => {
      const result = validatePKCE(
        PKCE_TEST_VECTOR.verifier,
        PKCE_TEST_VECTOR.challenge,
        "S256",
      );

      expect(result).toBe(true);
    });

    it("should reject invalid S256 code_challenge", () => {
      const result = validatePKCE("test-verifier", "wrong-challenge", "S256");

      expect(result).toBe(false);
    });
  });
});
