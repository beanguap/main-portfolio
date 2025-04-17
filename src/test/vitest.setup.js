import 'vitest-webgl-canvas-mock'
import { vi } from 'vitest'

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Polyfill ResizeObserver (prefer @juggle/resize-observer if available)
try {
  globalThis.ResizeObserver = require('@juggle/resize-observer').ResizeObserver;
} catch (e) {
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
