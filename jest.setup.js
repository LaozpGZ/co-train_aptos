/**
 * Jest Setup File for CoTrain Monorepo
 * This file is executed before each test file
 */

// Import Jest DOM matchers
import '@testing-library/jest-dom';

// Import MSW for API mocking
import { server } from './__mocks__/server';

// Global test utilities
import { cleanup } from '@testing-library/react';

// Polyfills for Node.js environment
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'web-streams-polyfill';

// Global variables for testing
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.ReadableStream = ReadableStream;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
}));

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Mock HTMLElement.scrollIntoView
HTMLElement.prototype.scrollIntoView = jest.fn();

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = jest.fn();

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  writable: true,
  value: jest.fn(() => 'mocked-url'),
});

Object.defineProperty(URL, 'revokeObjectURL', {
  writable: true,
  value: jest.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => '12345678-1234-1234-1234-123456789012'),
    getRandomValues: jest.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }),
  },
});

// Mock fetch if not available
if (!global.fetch) {
  global.fetch = jest.fn();
}

// Mock console methods to reduce noise in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Start MSW server
  server.listen({ onUnhandledRequest: 'error' });

  // Mock console.error to suppress React warnings in tests
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') ||
        args[0].includes('ReactDOM.render is no longer supported') ||
        args[0].includes('act(...) is not supported'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  // Mock console.warn to suppress warnings in tests
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('componentWillReceiveProps') ||
        args[0].includes('componentWillUpdate') ||
        args[0].includes('componentWillMount'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset MSW handlers
  server.resetHandlers();
});

afterEach(() => {
  // Cleanup after each test
  cleanup();
  
  // Clear all timers
  jest.clearAllTimers();
  
  // Restore all mocks
  jest.restoreAllMocks();
});

afterAll(() => {
  // Stop MSW server
  server.close();
  
  // Restore console methods
  console.error = originalError;
  console.warn = originalWarn;
});

// Custom matchers
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received !== null && received !== undefined;
    return {
      message: () => `expected element ${pass ? 'not ' : ''}to be in the document`,
      pass,
    };
  },
});

// Global test helpers
global.testUtils = {
  // Helper to wait for async operations
  waitFor: async (callback, options = {}) => {
    const { timeout = 1000, interval = 50 } = options;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await callback();
        if (result) return result;
      } catch (error) {
        // Continue waiting
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Timeout after ${timeout}ms`);
  },
  
  // Helper to create mock functions with specific return values
  createMockFn: (returnValue) => jest.fn(() => returnValue),
  
  // Helper to create mock promises
  createMockPromise: (resolveValue, rejectValue) => {
    if (rejectValue) {
      return Promise.reject(rejectValue);
    }
    return Promise.resolve(resolveValue);
  },
  
  // Helper to mock timers
  mockTimers: () => {
    jest.useFakeTimers();
    return {
      advanceTimersByTime: jest.advanceTimersByTime,
      runAllTimers: jest.runAllTimers,
      runOnlyPendingTimers: jest.runOnlyPendingTimers,
      restore: jest.useRealTimers,
    };
  },
};

// Environment variables for testing
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_ENV = 'test';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
process.env.NEXT_PUBLIC_APTOS_NETWORK = 'testnet';
process.env.NEXT_PUBLIC_APTOS_NODE_URL = 'https://fullnode.testnet.aptoslabs.com/v1';
process.env.NEXT_PUBLIC_APTOS_FAUCET_URL = 'https://faucet.testnet.aptoslabs.com';

// Suppress specific warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    args[0] &&
    typeof args[0] === 'string' &&
    (
      args[0].includes('React Router Future Flag Warning') ||
      args[0].includes('ReactDOM.render is no longer supported') ||
      args[0].includes('findDOMNode is deprecated')
    )
  ) {
    return;
  }
  originalConsoleWarn(...args);
};

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    route: '/',
    pathname: '/',
    query: {},
    asPath: '/',
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    beforePopState: jest.fn(),
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
  }),
}));

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));

// Mock Next.js link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }) => {
    return <a {...props}>{children}</a>;
  },
}));

// Mock Aptos SDK
jest.mock('@aptos-labs/ts-sdk', () => ({
  Aptos: jest.fn().mockImplementation(() => ({
    getAccountInfo: jest.fn(),
    getAccountResources: jest.fn(),
    getAccountModules: jest.fn(),
    simulateTransaction: jest.fn(),
    submitTransaction: jest.fn(),
    waitForTransaction: jest.fn(),
  })),
  AptosConfig: jest.fn(),
  Network: {
    TESTNET: 'testnet',
    MAINNET: 'mainnet',
    DEVNET: 'devnet',
  },
}));

// Mock wallet adapters
jest.mock('@aptos-labs/wallet-adapter-react', () => ({
  useWallet: () => ({
    connected: false,
    account: null,
    network: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    signAndSubmitTransaction: jest.fn(),
    signTransaction: jest.fn(),
    signMessage: jest.fn(),
  }),
  WalletProvider: ({ children }) => children,
}));

console.log('Jest setup completed successfully');