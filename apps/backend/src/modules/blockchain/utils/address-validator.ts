/**
 * Utility functions for validating Aptos addresses and other blockchain-related data
 */

/**
 * Validates if a string is a valid Aptos address format
 * @param address - The address string to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidAptosAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Aptos addresses are 32 bytes (64 hex characters) prefixed with 0x
  const aptosAddressRegex = /^0x[a-fA-F0-9]{64}$/;
  return aptosAddressRegex.test(address);
}

/**
 * Validates if a string is a valid Aptos transaction hash
 * @param hash - The transaction hash to validate
 * @returns boolean indicating if the hash is valid
 */
export function isValidTransactionHash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') {
    return false;
  }

  // Transaction hashes are also 32 bytes (64 hex characters) prefixed with 0x
  const hashRegex = /^0x[a-fA-F0-9]{64}$/;
  return hashRegex.test(hash);
}

/**
 * Normalizes an Aptos address by ensuring proper format
 * @param address - The address to normalize
 * @returns normalized address or null if invalid
 */
export function normalizeAptosAddress(address: string): string | null {
  if (!address || typeof address !== 'string') {
    return null;
  }

  // Remove any whitespace
  const cleanAddress = address.trim();

  // Check if it starts with 0x
  if (!cleanAddress.startsWith('0x')) {
    return null;
  }

  // Remove 0x prefix for validation
  const hexPart = cleanAddress.slice(2);

  // Check if it's valid hex
  if (!/^[a-fA-F0-9]+$/.test(hexPart)) {
    return null;
  }

  // Pad with zeros if necessary (addresses can be shorter than 64 chars)
  const paddedHex = hexPart.padStart(64, '0');

  // Validate final length
  if (paddedHex.length !== 64) {
    return null;
  }

  return `0x${paddedHex.toLowerCase()}`;
}

/**
 * Validates a session ID format
 * @param sessionId - The session ID to validate
 * @returns boolean indicating if the session ID is valid
 */
export function isValidSessionId(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') {
    return false;
  }

  // Session IDs should be non-empty strings with reasonable length
  return sessionId.length > 0 && sessionId.length <= 100;
}

/**
 * Validates a score value
 * @param score - The score to validate
 * @returns boolean indicating if the score is valid
 */
export function isValidScore(score: number): boolean {
  return typeof score === 'number' && score >= 0 && score <= 100 && !isNaN(score);
}

/**
 * Validates a reward amount
 * @param amount - The reward amount to validate (in smallest unit)
 * @returns boolean indicating if the amount is valid
 */
export function isValidRewardAmount(amount: number): boolean {
  return typeof amount === 'number' && amount > 0 && Number.isInteger(amount) && !isNaN(amount);
}

/**
 * Validates participant count
 * @param count - The participant count to validate
 * @returns boolean indicating if the count is valid
 */
export function isValidParticipantCount(count: number): boolean {
  return typeof count === 'number' && count > 0 && count <= 1000 && Number.isInteger(count) && !isNaN(count);
}

/**
 * Validates session name
 * @param name - The session name to validate
 * @returns boolean indicating if the name is valid
 */
export function isValidSessionName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmedName = name.trim();
  return trimmedName.length > 0 && trimmedName.length <= 100;
}

/**
 * Validates session description
 * @param description - The session description to validate
 * @returns boolean indicating if the description is valid
 */
export function isValidSessionDescription(description?: string): boolean {
  if (!description) {
    return true; // Description is optional
  }

  if (typeof description !== 'string') {
    return false;
  }

  return description.length <= 500;
}

/**
 * Validates session duration
 * @param duration - The session duration in minutes
 * @returns boolean indicating if the duration is valid
 */
export function isValidSessionDuration(duration?: number): boolean {
  if (duration === undefined || duration === null) {
    return true; // Duration is optional
  }

  return typeof duration === 'number' && duration > 0 && duration <= 10080 && !isNaN(duration); // Max 1 week
}