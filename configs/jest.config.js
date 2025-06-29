module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Root directory
  rootDir: '../',
  
  // Test file patterns
  testMatch: [
    '<rootDir>/**/__tests__/**/*.(ts|tsx|js)',
    '<rootDir>/**/*.(test|spec).(ts|tsx|js)',
  ],
  
  // Transform files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Module name mapping
  moduleNameMapping: {
    '^@cotrain/shared-types$': '<rootDir>/packages/shared-types/src',
    '^@cotrain/shared-utils$': '<rootDir>/packages/shared-utils/src',
    '^@cotrain/shared-config$': '<rootDir>/packages/shared-config/src',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/configs/jest.setup.js'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  collectCoverageFrom: [
    'apps/**/*.{ts,tsx}',
    'packages/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/build/**',
    '!**/.next/**',
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  
  // Test timeout
  testTimeout: 30000,
  
  // Clear mocks
  clearMocks: true,
  
  // Restore mocks
  restoreMocks: true,
  
  // Verbose output
  verbose: true,
  
  // Error on deprecated
  errorOnDeprecated: true,
  
  // Detect open handles
  detectOpenHandles: true,
  
  // Force exit
  forceExit: true,
  
  // Max workers
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
  
  // Global setup and teardown
  globalSetup: '<rootDir>/configs/jest.global-setup.js',
  globalTeardown: '<rootDir>/configs/jest.global-teardown.js',
  
  // Test environment options
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  
  // Projects for monorepo
  projects: [
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/apps/backend/**/*.(test|spec).(ts|js)'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/configs/jest.setup.js'],
    },
    {
      displayName: 'frontend',
      testMatch: ['<rootDir>/apps/frontend/**/*.(test|spec).(ts|tsx|js|jsx)'],
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: [
        '<rootDir>/configs/jest.setup.js',
        '<rootDir>/configs/jest.frontend.setup.js',
      ],
    },
    {
      displayName: 'packages',
      testMatch: ['<rootDir>/packages/**/*.(test|spec).(ts|tsx|js)'],
      testEnvironment: 'node',
      setupFilesAfterEnv: ['<rootDir>/configs/jest.setup.js'],
    },
  ],
};