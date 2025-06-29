import { TransactionResponse } from '../dto/transaction-response.dto';
import { TRANSACTION_CONFIG } from '../constants/contract-addresses';

/**
 * Utility functions for handling blockchain transactions
 */

/**
 * Creates a standardized transaction response
 * @param hash - Transaction hash
 * @param success - Whether the transaction was successful
 * @param message - Human-readable message
 * @param data - Additional data (optional)
 * @returns TransactionResponse object
 */
export function createTransactionResponse(
  hash: string,
  success: boolean,
  message: string,
  data?: any,
): TransactionResponse {
  return {
    hash,
    success,
    message,
    data,
  };
}

/**
 * Creates a success transaction response
 * @param hash - Transaction hash
 * @param message - Success message
 * @param data - Additional data (optional)
 * @returns TransactionResponse object
 */
export function createSuccessResponse(
  hash: string,
  message: string,
  data?: any,
): TransactionResponse {
  return createTransactionResponse(hash, true, message, data);
}

/**
 * Creates a failure transaction response
 * @param hash - Transaction hash (may be empty for failed submissions)
 * @param message - Error message
 * @param data - Additional error data (optional)
 * @returns TransactionResponse object
 */
export function createFailureResponse(
  hash: string,
  message: string,
  data?: any,
): TransactionResponse {
  return createTransactionResponse(hash, false, message, data);
}

/**
 * Waits for a transaction to be confirmed with retry logic
 * @param getTransactionFn - Function to get transaction details
 * @param hash - Transaction hash
 * @param timeoutMs - Timeout in milliseconds
 * @param retryDelayMs - Delay between retries
 * @returns Promise that resolves when transaction is confirmed
 */
export async function waitForTransactionConfirmation(
  getTransactionFn: (hash: string) => Promise<any>,
  hash: string,
  timeoutMs: number = TRANSACTION_CONFIG.DEFAULT_TIMEOUT_MS,
  retryDelayMs: number = TRANSACTION_CONFIG.RETRY_DELAY_MS,
): Promise<any> {
  const startTime = Date.now();
  let attempts = 0;
  const maxAttempts = Math.floor(timeoutMs / retryDelayMs);

  while (attempts < maxAttempts) {
    try {
      const transaction = await getTransactionFn(hash);
      if (transaction && transaction.success !== undefined) {
        return transaction;
      }
    } catch (error) {
      // Transaction might not be available yet, continue retrying
    }

    if (Date.now() - startTime >= timeoutMs) {
      throw new Error(`Transaction confirmation timeout after ${timeoutMs}ms`);
    }

    await sleep(retryDelayMs);
    attempts++;
  }

  throw new Error(`Transaction confirmation failed after ${attempts} attempts`);
}

/**
 * Executes a function with retry logic
 * @param fn - Function to execute
 * @param maxRetries - Maximum number of retries
 * @param retryDelayMs - Delay between retries
 * @returns Promise with the function result
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = TRANSACTION_CONFIG.MAX_RETRIES,
  retryDelayMs: number = TRANSACTION_CONFIG.RETRY_DELAY_MS,
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        break;
      }

      // Don't retry on certain types of errors
      if (isNonRetryableError(error)) {
        throw error;
      }

      await sleep(retryDelayMs * Math.pow(2, attempt)); // Exponential backoff
    }
  }

  throw lastError!;
}

/**
 * Checks if an error should not be retried
 * @param error - The error to check
 * @returns boolean indicating if the error is non-retryable
 */
function isNonRetryableError(error: any): boolean {
  if (!error) return false;

  const message = error.message?.toLowerCase() || '';
  
  // Don't retry validation errors, authentication errors, etc.
  const nonRetryablePatterns = [
    'invalid',
    'unauthorized',
    'forbidden',
    'not found',
    'bad request',
    'validation',
    'insufficient funds',
  ];

  return nonRetryablePatterns.some(pattern => message.includes(pattern));
}

/**
 * Sleep utility function
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after the specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Formats a transaction hash for display
 * @param hash - Transaction hash
 * @param length - Number of characters to show from start and end
 * @returns Formatted hash string
 */
export function formatTransactionHash(hash: string, length: number = 8): string {
  if (!hash || hash.length <= length * 2) {
    return hash;
  }

  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

/**
 * Converts APT amount to smallest unit (octas)
 * @param aptAmount - Amount in APT
 * @returns Amount in octas
 */
export function aptToOctas(aptAmount: number): number {
  return Math.floor(aptAmount * 100000000); // 1 APT = 10^8 octas
}

/**
 * Converts octas to APT amount
 * @param octas - Amount in octas
 * @returns Amount in APT
 */
export function octasToApt(octas: number): number {
  return octas / 100000000; // 1 APT = 10^8 octas
}

/**
 * Validates transaction payload structure
 * @param payload - Transaction payload to validate
 * @returns boolean indicating if payload is valid
 */
export function isValidTransactionPayload(payload: any): boolean {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const requiredFields = ['type', 'function', 'arguments', 'type_arguments'];
  return requiredFields.every(field => payload.hasOwnProperty(field));
}

/**
 * Estimates gas cost for a transaction
 * @param transactionType - Type of transaction
 * @returns Estimated gas cost
 */
export function estimateGasCost(transactionType: string): number {
  const gasEstimates: Record<string, number> = {
    create_session: 5000,
    register_participant: 3000,
    submit_contribution: 4000,
    complete_session: 6000,
    claim_reward: 4000,
  };

  return gasEstimates[transactionType] || TRANSACTION_CONFIG.DEFAULT_GAS_LIMIT;
}