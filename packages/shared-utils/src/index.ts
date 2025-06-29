import { TrainingStatus, TransactionStatus, ApiError } from '@cotrain/shared-types';

// Constants
export const CONSTANTS = {
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  
  // Training
  MIN_TRAINING_DURATION: 60 * 1000, // 1 minute in ms
  MAX_TRAINING_DURATION: 24 * 60 * 60 * 1000, // 24 hours in ms
  MIN_PARTICIPANTS: 1,
  MAX_PARTICIPANTS: 1000,
  
  // Rewards
  MIN_REWARD_AMOUNT: '0.001',
  MAX_REWARD_AMOUNT: '1000000',
  
  // Quality scores
  MIN_QUALITY_SCORE: 0,
  MAX_QUALITY_SCORE: 100,
  
  // Wallet
  APTOS_ADDRESS_LENGTH: 66, // 0x + 64 hex chars
  
  // API
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  
  // WebSocket
  WS_RECONNECT_INTERVAL: 5000, // 5 seconds
  WS_MAX_RECONNECT_ATTEMPTS: 10,
} as const;

// Validation functions
export const validators = {
  isValidWalletAddress: (address: string): boolean => {
    if (!address || typeof address !== 'string') return false;
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  },
  
  isValidEmail: (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  isValidUsername: (username: string): boolean => {
    if (!username || typeof username !== 'string') return false;
    return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
  },
  
  isValidAmount: (amount: string): boolean => {
    if (!amount || typeof amount !== 'string') return false;
    const num = parseFloat(amount);
    return !isNaN(num) && num >= 0 && /^\d+(\.\d+)?$/.test(amount);
  },
  
  isValidQualityScore: (score: number): boolean => {
    return typeof score === 'number' && 
           score >= CONSTANTS.MIN_QUALITY_SCORE && 
           score <= CONSTANTS.MAX_QUALITY_SCORE;
  },
};

// Utility functions
export const utils = {
  // Date utilities
  formatDate: (date: Date | string): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  },
  
  formatDateTime: (date: Date | string): string => {
    const d = new Date(date);
    return d.toISOString();
  },
  
  getTimeAgo: (date: Date | string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  },
  
  // String utilities
  truncateAddress: (address: string, startChars = 6, endChars = 4): string => {
    if (!address || address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
  },
  
  capitalize: (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
  
  // Number utilities
  formatNumber: (num: number, decimals = 2): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  },
  
  formatTokenAmount: (amount: string | number, decimals = 4): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(num)) return '0';
    
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(decimals);
  },
  
  // Array utilities
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },
  
  unique: <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
  },
  
  // Object utilities
  omit: <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  },
  
  pick: <T extends Record<string, any>, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },
  
  // Async utilities
  sleep: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  
  retry: async <T>(
    fn: () => Promise<T>,
    attempts = CONSTANTS.RETRY_ATTEMPTS,
    delay = 1000
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (attempts <= 1) throw error;
      await utils.sleep(delay);
      return utils.retry(fn, attempts - 1, delay * 2);
    }
  },
  
  // Status utilities
  getTrainingStatusColor: (status: TrainingStatus): string => {
    const colors = {
      pending: '#f59e0b',
      active: '#10b981',
      paused: '#f97316',
      completed: '#06b6d4',
      cancelled: '#6b7280',
      failed: '#ef4444',
    };
    return colors[status] || '#6b7280';
  },
  
  getTransactionStatusColor: (status: TransactionStatus): string => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#10b981',
      failed: '#ef4444',
    };
    return colors[status] || '#6b7280';
  },
};

// Error handling utilities
export const errorUtils = {
  createApiError: (code: string, message: string, details?: Record<string, any>): ApiError => {
    return { code, message, details };
  },
  
  isApiError: (error: any): error is ApiError => {
    return error && typeof error === 'object' && 'code' in error && 'message' in error;
  },
  
  getErrorMessage: (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (errorUtils.isApiError(error)) return error.message;
    if (error instanceof Error) return error.message;
    return 'An unknown error occurred';
  },
};

// Export all utilities
export { CONSTANTS as constants };
export * from '@cotrain/shared-types';