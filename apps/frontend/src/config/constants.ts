// Application constants and configuration

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const

// Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  LONG_TTL: 30 * 60 * 1000, // 30 minutes
  SHORT_TTL: 1 * 60 * 1000, // 1 minute
} as const

// UI Configuration
export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  ANIMATION_DURATION: 200,
  TOAST_DURATION: 5000,
  MODAL_ANIMATION_DURATION: 150,
} as const

// Training Configuration
export const TRAINING_CONFIG = {
  MIN_PARTICIPANTS: 10,
  MAX_PARTICIPANTS: 1000,
  DEFAULT_DURATION: '30 days',
  PROGRESS_UPDATE_INTERVAL: 5000, // 5 seconds
  STATUS_CHECK_INTERVAL: 10000, // 10 seconds
} as const

// Network Configuration
export const NETWORK_CONFIG = {
  MIN_NODES: 100,
  MAX_NODES: 10000,
  HEALTH_THRESHOLD: 80, // percentage
  UPDATE_INTERVAL: 30000, // 30 seconds
} as const

// Validation Rules
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_USERNAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_GPU_MEMORY: 4, // GB
  MIN_SYSTEM_MEMORY: 8, // GB
  MIN_BANDWIDTH: 10, // Mbps
} as const

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  TRAINING_ERROR: 'Training operation failed. Please try again later.',
  DATA_FETCH_ERROR: 'Failed to fetch data. Please refresh the page.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  TRAINING_JOINED: 'Successfully joined training session!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  DATA_EXPORTED: 'Data exported successfully!',
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  TRAINING: '/training',
  HISTORY: '/history',
  TERMINAL: '/terminal',
  ABOUT: '/about',
  DOCS: '/docs',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'cotrain_user_preferences',
  THEME: 'cotrain_theme',
  LANGUAGE: 'cotrain_language',
  CACHE_PREFIX: 'cotrain_cache_',
  SESSION_DATA: 'cotrain_session',
} as const

// Theme Configuration
export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: '#10b981', // green-500
    SECONDARY: '#6366f1', // indigo-500
    SUCCESS: '#22c55e', // green-500
    WARNING: '#f59e0b', // amber-500
    ERROR: '#ef4444', // red-500
    INFO: '#3b82f6', // blue-500
  },
  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px',
    '2XL': '1536px',
  },
} as const

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: process.env.NODE_ENV === 'development',
  ENABLE_EXPERIMENTAL_FEATURES: process.env.NEXT_PUBLIC_EXPERIMENTAL === 'true',
  ENABLE_PERFORMANCE_MONITORING: process.env.NEXT_PUBLIC_PERFORMANCE_MONITORING === 'true',
} as const

// Hardware Requirements
export const HARDWARE_REQUIREMENTS = {
  MINIMUM: {
    GPU: 'GTX 1060',
    MEMORY: '8GB',
    CORES: 4,
    BANDWIDTH: '25 Mbps',
  },
  RECOMMENDED: {
    GPU: 'RTX 3070',
    MEMORY: '16GB',
    CORES: 8,
    BANDWIDTH: '100 Mbps',
  },
  OPTIMAL: {
    GPU: 'RTX 4090',
    MEMORY: '32GB',
    CORES: 16,
    BANDWIDTH: '500 Mbps',
  },
} as const

// Reward Tiers
export const REWARD_TIERS = {
  BRONZE: {
    MIN_CONTRIBUTIONS: 0,
    MULTIPLIER: 1.0,
    BADGE_COLOR: '#cd7f32',
  },
  SILVER: {
    MIN_CONTRIBUTIONS: 1000,
    MULTIPLIER: 1.2,
    BADGE_COLOR: '#c0c0c0',
  },
  GOLD: {
    MIN_CONTRIBUTIONS: 5000,
    MULTIPLIER: 1.5,
    BADGE_COLOR: '#ffd700',
  },
  PLATINUM: {
    MIN_CONTRIBUTIONS: 10000,
    MULTIPLIER: 2.0,
    BADGE_COLOR: '#e5e4e2',
  },
} as const