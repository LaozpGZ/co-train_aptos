// Frontend-specific test setup

// Import testing library utilities
import '@testing-library/jest-dom';

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
  withRouter: (Component) => Component,
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

// Mock Aptos wallet adapter
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
  AptosWalletAdapterProvider: ({ children }) => children,
}));

// Mock wallet adapters
jest.mock('@aptos-labs/wallet-adapter-petra-plugin', () => ({
  PetraWallet: jest.fn(),
}));

jest.mock('@aptos-labs/wallet-adapter-martian-plugin', () => ({
  MartianWallet: jest.fn(),
}));

jest.mock('@aptos-labs/wallet-adapter-fewcha-plugin', () => ({
  FewchaWallet: jest.fn(),
}));

// Mock WebSocket
global.WebSocket = jest.fn(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1, // OPEN
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock matchMedia
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

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
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
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    host: 'localhost:3000',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
  },
  writable: true,
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Mock crypto.randomUUID
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

// Mock File and FileReader
global.File = jest.fn();
global.FileReader = jest.fn(() => ({
  readAsDataURL: jest.fn(),
  readAsText: jest.fn(),
  result: null,
  onload: null,
  onerror: null,
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = jest.fn();

// Frontend-specific test utilities
global.frontendTestUtils = {
  // Render component with providers
  renderWithProviders: (ui, options = {}) => {
    // This would typically wrap with theme providers, etc.
    return render(ui, options);
  },

  // Mock wallet connection
  mockWalletConnection: (connected = true, account = null) => {
    const mockUseWallet = require('@aptos-labs/wallet-adapter-react').useWallet;
    mockUseWallet.mockReturnValue({
      connected,
      account: account || (connected ? {
        address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        publicKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      } : null),
      network: connected ? { name: 'testnet' } : null,
      connect: jest.fn(),
      disconnect: jest.fn(),
      signAndSubmitTransaction: jest.fn(),
      signTransaction: jest.fn(),
      signMessage: jest.fn(),
    });
  },

  // Mock router navigation
  mockRouterPush: (path) => {
    const mockRouter = require('next/router').useRouter();
    mockRouter.push.mockResolvedValue(true);
    return mockRouter.push;
  },

  // Wait for element to appear
  waitForElement: async (selector) => {
    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  },
};

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Clear localStorage and sessionStorage
  localStorageMock.clear();
  sessionStorageMock.clear();
  
  // Reset DOM
  document.body.innerHTML = '';
});