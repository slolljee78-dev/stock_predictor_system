import { config } from 'vitest/config';
import { vi } from 'vitest';

// Configure jsdom for client tests
if (process.env.VITEST_ENVIRONMENT === 'jsdom' || process.argv.some(arg => arg.includes('client'))) {
  // This is handled by vitest automatically when using jsdom
}

// Stub ResizeObserver globally for all tests
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof global !== 'undefined') {
  (global as any).ResizeObserver = ResizeObserverMock;
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
