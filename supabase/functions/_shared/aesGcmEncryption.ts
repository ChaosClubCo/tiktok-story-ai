/**
 * AES-GCM Encryption Module
 * 
 * This module provides secure encryption using AES-256-GCM, which is an
 * authenticated encryption algorithm that provides both confidentiality
 * and integrity protection.
 * 
 * Security properties:
 * - 256-bit AES encryption for confidentiality
 * - GCM mode provides authenticated encryption (AEAD)
 * - 96-bit random IV (Initialization Vector) for each encryption
 * - 128-bit authentication tag for integrity verification
 * 
 * Key Rotation:
 * - Keys should be rotated periodically (recommended: every 90 days)
 * - The key version is stored with the encrypted data for migration support
 * - During rotation, decrypt with old key and re-encrypt with new key
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96 bits recommended for GCM
const TAG_LENGTH = 128; // Authentication tag length in bits
const CURRENT_KEY_VERSION = 1;

/**
 * Derives a cryptographic key from a password/secret using PBKDF2
 */
async function deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000, // High iteration count for security
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts data using AES-256-GCM
 * 
 * Output format: base64(version[1] || salt[16] || iv[12] || ciphertext || tag[16])
 * 
 * @param plaintext - The data to encrypt
 * @param secret - The encryption secret/password
 * @returns Base64-encoded encrypted data with metadata
 */
export async function encryptAesGcm(plaintext: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  // Derive key from secret
  const key = await deriveKey(secret, salt);
  
  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
      tagLength: TAG_LENGTH
    },
    key,
    encoder.encode(plaintext)
  );
  
  // Combine version, salt, IV, and ciphertext
  const result = new Uint8Array(1 + salt.length + iv.length + encrypted.byteLength);
  result[0] = CURRENT_KEY_VERSION;
  result.set(salt, 1);
  result.set(iv, 1 + salt.length);
  result.set(new Uint8Array(encrypted), 1 + salt.length + iv.length);
  
  // Return as base64
  return btoa(String.fromCharCode(...result));
}

/**
 * Decrypts data encrypted with AES-256-GCM
 * 
 * @param encryptedData - Base64-encoded encrypted data
 * @param secret - The encryption secret/password
 * @returns Decrypted plaintext
 */
export async function decryptAesGcm(encryptedData: string, secret: string): Promise<string> {
  const decoder = new TextDecoder();
  
  // Decode from base64
  const combined = new Uint8Array(
    atob(encryptedData).split('').map(c => c.charCodeAt(0))
  );
  
  // Extract version
  const version = combined[0];
  
  if (version !== CURRENT_KEY_VERSION) {
    // Handle key rotation - in future, support multiple versions
    throw new Error(`Unsupported encryption version: ${version}. Key rotation may be needed.`);
  }
  
  // Extract salt, IV, and ciphertext
  const salt = combined.slice(1, 17);
  const iv = combined.slice(17, 17 + IV_LENGTH);
  const ciphertext = combined.slice(17 + IV_LENGTH);
  
  // Derive key from secret
  const key = await deriveKey(secret, salt);
  
  // Decrypt the data
  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: ALGORITHM,
        iv,
        tagLength: TAG_LENGTH
      },
      key,
      ciphertext
    );
    
    return decoder.decode(decrypted);
  } catch (error) {
    // Authentication failed - data was tampered with or wrong key
    throw new Error('Decryption failed: data integrity check failed');
  }
}

/**
 * Checks if data is encrypted with the current key version
 * Used to identify data that needs re-encryption during key rotation
 */
export function needsKeyRotation(encryptedData: string): boolean {
  try {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );
    return combined[0] !== CURRENT_KEY_VERSION;
  } catch {
    return true; // If we can't parse it, it may be using old XOR encryption
  }
}

/**
 * Checks if data appears to be using the old XOR encryption
 * Old format was just btoa(xor_result) without version prefix
 */
export function isLegacyEncryption(encryptedData: string): boolean {
  try {
    const decoded = atob(encryptedData);
    // Old XOR encryption results in printable chars usually
    // New format starts with version byte (1) which is non-printable
    return decoded.charCodeAt(0) !== CURRENT_KEY_VERSION;
  } catch {
    return true;
  }
}

/**
 * Migrates data from legacy XOR encryption to AES-GCM
 */
export async function migrateFromLegacy(
  legacyEncrypted: string, 
  legacyKey: string, 
  newKey: string
): Promise<string> {
  // Decrypt using old XOR method
  const decoded = atob(legacyEncrypted);
  let decrypted = '';
  for (let i = 0; i < decoded.length; i++) {
    decrypted += String.fromCharCode(
      decoded.charCodeAt(i) ^ legacyKey.charCodeAt(i % legacyKey.length)
    );
  }
  
  // Re-encrypt using AES-GCM
  return encryptAesGcm(decrypted, newKey);
}
