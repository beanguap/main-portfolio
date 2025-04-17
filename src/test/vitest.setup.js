import 'vitest-webgl-canvas-mock';
import { vi, expect, test } from 'vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// Remove ResizeObserver polyfill - happy-dom provides it
// try {
//   globalThis.ResizeObserver = require('@juggle/resize-observer').ResizeObserver;
// } catch (e) {
//   class ResizeObserver {
//     observe() {}
//     unobserve() {}
//     disconnect() {}
//   }
//   globalThis.ResizeObserver = ResizeObserver;
// }

// Remove matchMedia polyfill - happy-dom provides it
// if (!globalThis.matchMedia) {
//   globalThis.matchMedia = vi.fn().mockImplementation((query) => ({
//     matches: false,
//     media: query,
//     onchange: null,
//     addListener: vi.fn(),
//     removeListener: vi.fn(),
//     addEventListener: vi.fn(),
//     removeEventListener: vi.fn(),
//     dispatchEvent: vi.fn(),
//   }));
// }

// Stub GSAP ScrollTrigger - Corrected Mock
vi.mock('gsap/ScrollTrigger', () => {
  // Provide a default export that has the register method
  return {
    default: {
      register: vi.fn(), // Mock the register function
      create: vi.fn(() => ({ // Mock the create function if needed
        kill: vi.fn(),
      })),
      // Add other ScrollTrigger methods/properties used by your components if necessary
      // For example:
      // update: vi.fn(),
      // refresh: vi.fn(),
    },
    // If you were importing named exports like { ScrollTrigger }, you'd add them here:
    // ScrollTrigger: class MockScrollTrigger { ... }
  };
});

// Basic check for WebGL mock
test('WebGL context mock is available', () => {
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl');
  expect(gl).toBeTruthy();
  // Check for a basic function provided by the mock
  expect(typeof gl.clear).toBe('function');
});
