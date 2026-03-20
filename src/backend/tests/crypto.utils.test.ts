import { encrypt, decrypt, generateUUID } from "@/utils/crypto.utils";
import { UUID_V4_PATTERN } from "@test/fixtures/patterns";

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
