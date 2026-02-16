/** UUID v4 format */
export const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Hex string length for a given byte length */
export const hexLengthForBytes = (bytes: number): number => bytes * 2;
