// Global test setup

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_USERNAME = 'test';
process.env.DB_PASSWORD = 'test';
process.env.DB_NAME = 'cotrain_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.APTOS_NETWORK = 'testnet';
process.env.APTOS_NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';
process.env.APTOS_CONTRACT_ADDRESS = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
process.env.EMAIL_HOST = 'localhost';
process.env.EMAIL_PORT = '587';
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'test-password';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods in test environment
if (process.env.NODE_ENV === 'test') {
  // Suppress console.log in tests unless explicitly needed
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Global test utilities
global.testUtils = {
  // Create a mock user
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    username: 'testuser',
    email: 'test@example.com',
    displayName: 'Test User',
    avatar: null,
    bio: null,
    isVerified: false,
    reputation: 0,
    totalEarnings: '0',
    joinedAt: new Date(),
    lastActiveAt: new Date(),
    ...overrides,
  }),

  // Create a mock training session
  createMockTrainingSession: (overrides = {}) => ({
    id: 'test-training-id',
    title: 'Test Training Session',
    description: 'A test training session',
    modelType: 'classification',
    datasetUrl: 'https://example.com/dataset.csv',
    rewardPool: '100',
    maxParticipants: 10,
    minQualityScore: 80,
    duration: 3600000, // 1 hour
    status: 'pending',
    createdBy: 'test-user-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    startedAt: null,
    completedAt: null,
    ...overrides,
  }),

  // Create a mock contribution
  createMockContribution: (overrides = {}) => ({
    id: 'test-contribution-id',
    trainingSessionId: 'test-training-id',
    userId: 'test-user-id',
    modelHash: 'test-model-hash',
    qualityScore: 85,
    computeTime: 1800000, // 30 minutes
    reward: '10',
    status: 'completed',
    submittedAt: new Date(),
    validatedAt: new Date(),
    ...overrides,
  }),

  // Create a mock transaction
  createMockTransaction: (overrides = {}) => ({
    id: 'test-transaction-id',
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    type: 'reward_distribution',
    amount: '10',
    fromAddress: '0x1111111111111111111111111111111111111111111111111111111111111111',
    toAddress: '0x2222222222222222222222222222222222222222222222222222222222222222',
    status: 'confirmed',
    gasUsed: 1000,
    gasPrice: 100,
    blockNumber: 12345,
    timestamp: new Date(),
    ...overrides,
  }),

  // Wait for a promise to resolve
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Generate random string
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Generate random wallet address
  randomWalletAddress: () => {
    const chars = '0123456789abcdef';
    let result = '0x';
    for (let i = 0; i < 64; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
};

// Global mocks
global.fetch = jest.fn();

// Mock Date.now for consistent testing
const mockDate = new Date('2024-01-01T00:00:00.000Z');
global.Date.now = jest.fn(() => mockDate.getTime());

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});