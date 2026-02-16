import crypto from "crypto";
import config from "../config";

/**
 * Encryption algorithm and configuration
 */
const ALGORITHM = "aes-256-gcm";
const HASH_ALGORITHM = "sha256";
const IV_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_SALT = "tunele-session-salt";
const ENCRYPTED_PARTS_COUNT = 3;
const ENCRYPTED_DELIMITER = ":";
const DEFAULT_RANDOM_LENGTH = 32;

/**
 * Convert a Buffer to a Uint8Array (zero-copy).
 */
function toUint8Array(buf: Buffer): Uint8Array {
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

/**
 * Get encryption key from config.
 */
function getEncryptionKey(): Uint8Array {
  const buf = crypto.pbkdf2Sync(
    config.session.encryptionKey,
    PBKDF2_SALT,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    HASH_ALGORITHM,
  );
  return toUint8Array(buf);
}

/**
 * Encrypt a string value.
 *
 * @param text the plaintext to encrypt
 * @returns encrypted string in format: iv:authTag:encryptedData (all hex-encoded)
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, toUint8Array(iv));

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return [iv.toString("hex"), authTag.toString("hex"), encrypted].join(
    ENCRYPTED_DELIMITER,
  );
}

/**
 * Decrypt an encrypted string.
 *
 * @param encryptedText the encrypted text in format: iv:authTag:encryptedData
 * @returns decrypted plaintext
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(ENCRYPTED_DELIMITER);

  if (parts.length !== ENCRYPTED_PARTS_COUNT) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(parts[0], "hex");
  const authTag = Buffer.from(parts[1], "hex");
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, toUint8Array(iv));
  decipher.setAuthTag(toUint8Array(authTag));

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

/**
 * Generate a cryptographically secure random string.
 *
 * @param length the length of the random string (in bytes, will be hex-encoded so output is 2x)
 * @returns random hex string
 */
export function generateRandomString(
  length: number = DEFAULT_RANDOM_LENGTH,
): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generate a UUID v4.
 *
 * @returns UUID string
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
