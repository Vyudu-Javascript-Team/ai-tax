import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js session
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      expires: '2024-01-01',
    },
    status: 'authenticated',
  })),
  getSession: jest.fn(() => Promise.resolve({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
    },
    expires: '2024-01-01',
  })),
}));

// Mock Headers class
class MockHeaders {
  constructor(init) {
    this._headers = new Map();
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.append(key, value));
      } else if (init instanceof Headers || init instanceof MockHeaders) {
        init.forEach((value, key) => this.append(key, value));
      } else {
        Object.entries(init).forEach(([key, value]) => this.append(key, value));
      }
    }
  }

  append(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }

  delete(name) {
    this._headers.delete(name.toLowerCase());
  }

  get(name) {
    return this._headers.get(name.toLowerCase()) || null;
  }

  has(name) {
    return this._headers.has(name.toLowerCase());
  }

  set(name, value) {
    this._headers.set(name.toLowerCase(), value);
  }

  forEach(callback) {
    this._headers.forEach((value, key) => callback(value, key, this));
  }
}

// Mock Response class
class MockResponse {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || '';
    this.headers = new MockHeaders(init.headers);
    this.ok = this.status >= 200 && this.status < 300;
    this.type = 'basic';
    this.url = '';
  }

  json() {
    return Promise.resolve(
      typeof this._body === 'string' ? JSON.parse(this._body) : this._body
    );
  }

  text() {
    return Promise.resolve(
      typeof this._body === 'string' ? this._body : JSON.stringify(this._body)
    );
  }
}

global.Response = MockResponse;
global.Headers = MockHeaders;

// Mock fetch
global.fetch = jest.fn((url, options = {}) => {
  return Promise.resolve(new MockResponse({}, { status: 200 }));
});

// Mock environment variables
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.STRIPE_SECRET_KEY = 'test_stripe_key';
process.env.OPENAI_API_KEY = 'test_openai_key';
process.env.NODE_ENV = 'test';

// Mock console methods to suppress unwanted logs during tests
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

console.error = (...args) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Error: Uncaught [Error: expected]')
  ) {
    return;
  }
  originalError.call(console, ...args);
};

console.warn = (...args) => {
  if (
    args[0]?.includes?.('Warning: ReactDOM.render is no longer supported') ||
    args[0]?.includes?.('Warning: An update to')
  ) {
    return;
  }
  originalWarn.call(console, ...args);
};

console.log = (...args) => {
  if (args[0]?.includes?.('Download the React DevTools')) {
    return;
  }
  originalLog.call(console, ...args);
};
