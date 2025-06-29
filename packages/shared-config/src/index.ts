import { validators } from '@cotrain/shared-utils';

// Environment types
export type Environment = 'development' | 'staging' | 'production' | 'test';

// Database configuration
export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
  maxConnections?: number;
  connectionTimeout?: number;
}

// Redis configuration
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest?: number;
  retryDelayOnFailover?: number;
}

// JWT configuration
export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
  issuer: string;
  audience: string;
}

// Aptos configuration
export interface AptosConfig {
  network: 'mainnet' | 'testnet' | 'devnet' | 'local';
  nodeUrl: string;
  faucetUrl?: string;
  privateKey?: string;
  contractAddress: string;
  maxGasAmount: number;
  gasUnitPrice: number;
}

// CORS configuration
export interface CorsConfig {
  origin: string | string[] | boolean;
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
}

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
}

// File upload configuration
export interface FileUploadConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  uploadPath: string;
  maxFiles: number;
}

// Email configuration
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

// WebSocket configuration
export interface WebSocketConfig {
  port: number;
  path: string;
  cors: CorsConfig;
  pingTimeout: number;
  pingInterval: number;
}

// Application configuration interface
export interface AppConfig {
  env: Environment;
  port: number;
  host: string;
  apiPrefix: string;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JwtConfig;
  aptos: AptosConfig;
  cors: CorsConfig;
  rateLimit: RateLimitConfig;
  fileUpload: FileUploadConfig;
  email: EmailConfig;
  websocket: WebSocketConfig;
  logging: {
    level: string;
    format: string;
    filename?: string;
  };
  monitoring: {
    enabled: boolean;
    endpoint?: string;
    apiKey?: string;
  };
}

// Environment variable validation
const getEnvVar = (name: string, defaultValue?: string): string => {
  const value = process.env[name] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
};

const getEnvNumber = (name: string, defaultValue?: number): number => {
  const value = process.env[name];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${name} is required`);
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return num;
};

const getEnvBoolean = (name: string, defaultValue?: boolean): boolean => {
  const value = process.env[name];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${name} is required`);
  }
  return value.toLowerCase() === 'true';
};

const getEnvArray = (name: string, defaultValue?: string[]): string[] => {
  const value = process.env[name];
  if (!value) {
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Environment variable ${name} is required`);
  }
  return value.split(',').map(item => item.trim());
};

// Configuration factory
export const createConfig = (): AppConfig => {
  const env = (process.env.NODE_ENV || 'development') as Environment;
  
  // Validate critical environment variables
  const jwtSecret = getEnvVar('JWT_SECRET');
  const dbPassword = getEnvVar('DB_PASSWORD');
  const aptosPrivateKey = process.env.APTOS_PRIVATE_KEY;
  const aptosContractAddress = getEnvVar('APTOS_CONTRACT_ADDRESS');
  
  // Validate Aptos contract address
  if (!validators.isValidWalletAddress(aptosContractAddress)) {
    throw new Error('APTOS_CONTRACT_ADDRESS must be a valid Aptos address');
  }
  
  return {
    env,
    port: getEnvNumber('PORT', 3000),
    host: getEnvVar('HOST', '0.0.0.0'),
    apiPrefix: getEnvVar('API_PREFIX', '/api/v1'),
    
    database: {
      host: getEnvVar('DB_HOST', 'localhost'),
      port: getEnvNumber('DB_PORT', 5432),
      username: getEnvVar('DB_USERNAME', 'postgres'),
      password: dbPassword,
      database: getEnvVar('DB_NAME', 'cotrain'),
      ssl: getEnvBoolean('DB_SSL', env === 'production'),
      maxConnections: getEnvNumber('DB_MAX_CONNECTIONS', 10),
      connectionTimeout: getEnvNumber('DB_CONNECTION_TIMEOUT', 30000),
    },
    
    redis: {
      host: getEnvVar('REDIS_HOST', 'localhost'),
      port: getEnvNumber('REDIS_PORT', 6379),
      password: process.env.REDIS_PASSWORD,
      db: getEnvNumber('REDIS_DB', 0),
      maxRetriesPerRequest: getEnvNumber('REDIS_MAX_RETRIES', 3),
      retryDelayOnFailover: getEnvNumber('REDIS_RETRY_DELAY', 100),
    },
    
    jwt: {
      secret: jwtSecret,
      expiresIn: getEnvVar('JWT_EXPIRES_IN', '1h'),
      refreshExpiresIn: getEnvVar('JWT_REFRESH_EXPIRES_IN', '7d'),
      issuer: getEnvVar('JWT_ISSUER', 'cotrain'),
      audience: getEnvVar('JWT_AUDIENCE', 'cotrain-users'),
    },
    
    aptos: {
      network: (getEnvVar('APTOS_NETWORK', 'testnet') as AptosConfig['network']),
      nodeUrl: getEnvVar('APTOS_NODE_URL', 'https://fullnode.testnet.aptoslabs.com/v1'),
      faucetUrl: process.env.APTOS_FAUCET_URL,
      privateKey: aptosPrivateKey,
      contractAddress: aptosContractAddress,
      maxGasAmount: getEnvNumber('APTOS_MAX_GAS_AMOUNT', 100000),
      gasUnitPrice: getEnvNumber('APTOS_GAS_UNIT_PRICE', 100),
    },
    
    cors: {
      origin: env === 'production' 
        ? getEnvArray('CORS_ORIGINS', ['https://cotrain.app'])
        : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    },
    
    rateLimit: {
      windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 minutes
      max: getEnvNumber('RATE_LIMIT_MAX', 100),
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    },
    
    fileUpload: {
      maxFileSize: getEnvNumber('FILE_MAX_SIZE', 10 * 1024 * 1024), // 10MB
      allowedMimeTypes: getEnvArray('FILE_ALLOWED_TYPES', [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/plain',
        'text/csv',
      ]),
      uploadPath: getEnvVar('FILE_UPLOAD_PATH', './uploads'),
      maxFiles: getEnvNumber('FILE_MAX_FILES', 5),
    },
    
    email: {
      host: getEnvVar('EMAIL_HOST', 'smtp.gmail.com'),
      port: getEnvNumber('EMAIL_PORT', 587),
      secure: getEnvBoolean('EMAIL_SECURE', false),
      auth: {
        user: getEnvVar('EMAIL_USER'),
        pass: getEnvVar('EMAIL_PASS'),
      },
      from: getEnvVar('EMAIL_FROM', 'noreply@cotrain.app'),
    },
    
    websocket: {
      port: getEnvNumber('WS_PORT', 3001),
      path: getEnvVar('WS_PATH', '/ws'),
      cors: {
        origin: env === 'production' 
          ? getEnvArray('WS_CORS_ORIGINS', ['https://cotrain.app'])
          : true,
        credentials: true,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      },
      pingTimeout: getEnvNumber('WS_PING_TIMEOUT', 60000),
      pingInterval: getEnvNumber('WS_PING_INTERVAL', 25000),
    },
    
    logging: {
      level: getEnvVar('LOG_LEVEL', env === 'production' ? 'info' : 'debug'),
      format: getEnvVar('LOG_FORMAT', 'json'),
      filename: process.env.LOG_FILENAME,
    },
    
    monitoring: {
      enabled: getEnvBoolean('MONITORING_ENABLED', env === 'production'),
      endpoint: process.env.MONITORING_ENDPOINT,
      apiKey: process.env.MONITORING_API_KEY,
    },
  };
};

// Configuration validation
export const validateConfig = (config: AppConfig): void => {
  const errors: string[] = [];
  
  // Validate JWT secret strength
  if (config.jwt.secret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }
  
  // Validate database configuration
  if (!config.database.host || !config.database.password) {
    errors.push('Database host and password are required');
  }
  
  // Validate Aptos configuration
  if (!validators.isValidWalletAddress(config.aptos.contractAddress)) {
    errors.push('APTOS_CONTRACT_ADDRESS must be a valid Aptos address');
  }
  
  // Validate email configuration if monitoring is enabled
  if (config.monitoring.enabled && !config.monitoring.endpoint) {
    errors.push('MONITORING_ENDPOINT is required when monitoring is enabled');
  }
  
  // Validate file upload configuration
  if (config.fileUpload.maxFileSize <= 0) {
    errors.push('FILE_MAX_SIZE must be greater than 0');
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
};

// Export default configuration
let _config: AppConfig | null = null;

export const getConfig = (): AppConfig => {
  if (!_config) {
    _config = createConfig();
    validateConfig(_config);
  }
  return _config;
};

// Export configuration for specific environments
export const isDevelopment = (): boolean => getConfig().env === 'development';
export const isProduction = (): boolean => getConfig().env === 'production';
export const isTest = (): boolean => getConfig().env === 'test';
export const isStaging = (): boolean => getConfig().env === 'staging';

// Types are already exported as interfaces above
// No need to re-export them here