const HEX_PATTERN = /^[0-9a-fA-F]+$/;
const PUBLIC_ID_LENGTH = 16;
const PUBLIC_KEY_LENGTH = 64;

/** Checks if the value is a valid 16-character hex public ID. */
export function isValidPublicID(value: string): boolean {
  const trimmed = value.replace(/\s/g, "");
  return trimmed.length === PUBLIC_ID_LENGTH && HEX_PATTERN.test(trimmed);
}

/** Checks if the value is a valid 64-character hex public key. */
export function isValidPublicKey(value: string): boolean {
  const trimmed = value.replace(/\s/g, "");
  return trimmed.length === PUBLIC_KEY_LENGTH && HEX_PATTERN.test(trimmed);
}

/** Checks if the value is a valid contact input (16 or 64 hex characters). */
export function isValidContactInput(value: string): boolean {
  return isValidPublicID(value) || isValidPublicKey(value);
}

/** Extracts public ID from the input: returns first 16 chars if 64-char key, otherwise returns as-is (trimmed). */
export function extractPublicID(value: string): string {
  const trimmed = value.replace(/\s/g, "").toLowerCase();
  if (trimmed.length === PUBLIC_KEY_LENGTH && HEX_PATTERN.test(trimmed)) {
    return trimmed.substring(0, PUBLIC_ID_LENGTH);
  }
  return trimmed;
}
