// SkySniper — utils/hashDecoder.js
// 🔐 Provably fair hash decoding for crash games

import crypto from 'crypto';

/**
 * Decodes a provably fair hash into a crash multiplier.
 * @param {string} hash - The server seed hash
 * @returns {string} - Multiplier like "1.42x"
 */
export function decodeHash(hash) {
  if (!hash || typeof hash !== "string") return "Invalid hash";

  // Check for instant crash (provably fair rule)
  if (hash.startsWith("000000")) return "1.00x";

  const hmac = crypto.createHmac("sha256", "CrashGameSecretKey"); // Replace with actual salt if needed
  hmac.update(hash);
  const digest = hmac.digest("hex");

  const int = parseInt(digest.slice(0, 13), 16);
  const maxInt = Math.pow(2, 52);
  const crashPoint = Math.floor((100 * maxInt) / (maxInt - int)) / 100;

  // Clamp to 2 decimal places
  const multiplier = crashPoint < 1.00 ? 1.00 : crashPoint.toFixed(2);
  return `${multiplier}x`;
}
