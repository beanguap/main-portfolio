import 'vitest-webgl-canvas-mock';
import { vi } from 'vitest';
import createWebGLContext from 'gl';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Polyfill ResizeObserver (prefer @juggle/resize-observer if available)
try {
  await import('@juggle/resize-observer');
} catch (_e) { // Prefix unused e
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  globalThis.ResizeObserver = ResizeObserver;
}

// Polyfill matchMedia if missing
if (!globalThis.matchMedia) {
  globalThis.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Stub GSAP ScrollTrigger
vi.mock('gsap/ScrollTrigger', () => ({
  default: { register: vi.fn(), mockScrollTrigger: true },
}));

// Patch HTMLCanvasElement.getContext to provide a real WebGL context
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (type, ...args) {
  if (type === 'webgl' || type === 'webgl2') {
    return createWebGLContext(this.width || 1, this.height || 1);
  }
  return originalGetContext.call(this, type, ...args);
};

// Add any global vitest setup here
// For example, mocking browser APIs

// Add mock for matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    addListener: () => {},
    removeListener: () => {},
  }),
});

// Add mock for canvas
HTMLCanvasElement.prototype.getContext = () => {
  try {
    // Original implementation
  } catch (_e) {
    // Ignore errors
    return null;
  }
};
