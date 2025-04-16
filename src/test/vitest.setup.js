import 'vitest-webgl-canvas-mock'; // Provides maintained WebGL/canvas stubs
import { configure } from '@react-three/test-renderer';

// Configure the test renderer (optional, can customize node mocking)
configure({ createNodeMock: () => null });

// Provide a mock WebGL context for canvas elements
globalThis.HTMLCanvasElement.prototype.getContext = (contextId) => {
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return null; // Return null for WebGL contexts
  }
  // Return null or throw for other context types if needed
  return null;
};
