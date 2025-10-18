import crypto from "crypto";

/**
 * Generates a cryptographically secure random token
 * @returns A 64-character hexadecimal string
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hashes a token using SHA-256 for secure storage
 * @param token The plain text token to hash
 * @returns The hashed token as a hexadecimal string
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a magic link URL for tutor onboarding
 * @param token The plain text token (NOT hashed)
 * @returns The full magic link URL
 */
export function generateMagicLink(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/onboarding?token=${token}`;
}

/**
 * Calculates the expiration date for an onboarding token (48 hours from now)
 * @returns ISO timestamp string
 */
export function getTokenExpiry(): string {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 48);
  return expiry.toISOString();
}
