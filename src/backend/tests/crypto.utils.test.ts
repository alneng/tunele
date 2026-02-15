import {
  encrypt,
  decrypt,
  generateRandomString,
  generateRandomBase64Url,
  sha256Base64Url,
  generateUUID,
} from "../src/utils/crypto.utils";

const URL_SAFE_BASE64_PATTERN = /^[A-Za-z0-9_-]+$/;
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const hexLengthForBytes = (bytes: number) => bytes * 2;

// Known PKCE test vector (RFC 7636 Appendix B)
const PKCE_TEST_VECTOR = {
  verifier: "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk",
  expectedChallenge: "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
};

describe("Crypto Utils", () => {
  describe("encrypt and decrypt", () => {
    it("should encrypt and decrypt text correctly", () => {
      const plaintext = "sensitive-data-to-encrypt";

      const encrypted = encrypt(plaintext);

      expect(decrypt(encrypted)).toBe(plaintext);
    });

    it("should produce different encrypted values for same input (unique IVs)", () => {
      const plaintext = "test-data";

      const encrypted1 = encrypt(plaintext);
      const encrypted2 = encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
      expect(decrypt(encrypted1)).toBe(plaintext);
      expect(decrypt(encrypted2)).toBe(plaintext);
    });

    it("should handle special characters", () => {
      const plaintext = "email@example.com:token-with-special!@#$%^&*()";

      const encrypted = encrypt(plaintext);

      expect(decrypt(encrypted)).toBe(plaintext);
    });

    it("should throw error on invalid encrypted format", () => {
      expect(() => decrypt("invalid-format")).toThrow();
    });

    it("should throw error on tampered encrypted text", () => {
      const encrypted = encrypt("test-data");
      const parts = encrypted.split(":");

      // Flip the first character of the ciphertext (guaranteed to tamper)
      const ciphertext = parts[2];
      const firstChar = ciphertext[0];
      const tamperedChar = firstChar === "0" ? "1" : "0";
      parts[2] = tamperedChar + ciphertext.slice(1);

      expect(() => decrypt(parts.join(":"))).toThrow();
    });
  });

  describe("generateRandomString", () => {
    it("should generate random hex string of correct length", () => {
      const byteLength = 32;
      const random = generateRandomString(byteLength);

      expect(random).toHaveLength(hexLengthForBytes(byteLength));
      expect(random).toMatch(/^[0-9a-f]+$/);
    });

    it("should generate unique values", () => {
      const random1 = generateRandomString(32);
      const random2 = generateRandomString(32);

      expect(random1).not.toBe(random2);
    });

    it("should handle different lengths", () => {
      const byteLengths = [16, 64] as const;

      for (const byteLength of byteLengths) {
        const random = generateRandomString(byteLength);
        expect(random).toHaveLength(hexLengthForBytes(byteLength));
      }
    });
  });

  describe("generateRandomBase64Url", () => {
    it("should generate URL-safe base64 string", () => {
      const random = generateRandomBase64Url(32);

      expect(random).not.toMatch(/[+/=]/);
      expect(random).toMatch(URL_SAFE_BASE64_PATTERN);
    });

    it("should generate unique values", () => {
      const random1 = generateRandomBase64Url(32);
      const random2 = generateRandomBase64Url(32);

      expect(random1).not.toBe(random2);
    });

    it("should generate approximately correct length", () => {
      const byteLength = 32;
      const expectedBase64Len = Math.ceil((byteLength * 4) / 3);
      const tolerance = 3;

      const random = generateRandomBase64Url(byteLength);

      expect(random.length).toBeGreaterThanOrEqual(
        expectedBase64Len - tolerance,
      );
      expect(random.length).toBeLessThanOrEqual(expectedBase64Len + tolerance);
    });
  });

  describe("sha256Base64Url", () => {
    it("should generate consistent hash for same input", () => {
      const input = "test-input";

      expect(sha256Base64Url(input)).toBe(sha256Base64Url(input));
    });

    it("should generate different hashes for different inputs", () => {
      expect(sha256Base64Url("input1")).not.toBe(sha256Base64Url("input2"));
    });

    it("should generate URL-safe base64 hash", () => {
      const hash = sha256Base64Url("test-input");

      expect(hash).not.toMatch(/[+/=]/);
      expect(hash).toMatch(URL_SAFE_BASE64_PATTERN);
    });

    it("should generate valid PKCE code_challenge", () => {
      const challenge = sha256Base64Url(PKCE_TEST_VECTOR.verifier);

      expect(challenge).toBe(PKCE_TEST_VECTOR.expectedChallenge);
    });
  });

  describe("generateUUID", () => {
    it("should generate valid UUID v4", () => {
      expect(generateUUID()).toMatch(UUID_V4_PATTERN);
    });

    it("should generate unique values", () => {
      expect(generateUUID()).not.toBe(generateUUID());
    });

    it("should always have version 4 indicator", () => {
      const versionSegment = generateUUID().split("-")[2];

      expect(versionSegment[0]).toBe("4");
    });
  });
});
