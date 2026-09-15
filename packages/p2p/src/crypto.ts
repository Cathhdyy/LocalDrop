/**
 * Cryptographic helpers for file integrity verification (SHA-256).
 * Works across both Web Crypto API (browser) and Node.js crypto.
 */

export async function calculateSHA256(buffer: ArrayBuffer): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback for Node.js environments
  try {
    const nodeCrypto = await import('crypto');
    const hash = nodeCrypto.createHash('sha256');
    hash.update(Buffer.from(buffer));
    return hash.digest('hex');
  } catch (err) {
    throw new Error('No crypto implementation available for SHA-256');
  }
}

/**
 * Generate a cryptographically secure random room ID or pairing token
 */
export function generateRandomId(length: number = 8): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789'; // Base32 unambiguous characters
  let result = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < length; i++) {
      result += chars[bytes[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}

export function generatePairingCode(): string {
  // 6-digit numeric pairing PIN
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const bytes = new Uint32Array(1);
    crypto.getRandomValues(bytes);
    const code = (bytes[0] % 900000) + 100000;
    return code.toString();
  }
  return Math.floor(100000 + Math.random() * 900000).toString();
}
