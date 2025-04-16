import 'three-mock' // Provides global mocks for three.js classes
import { configure } from '@react-three/test-renderer'
import createWebGLContext from 'gl' // Headless WebGL context

// Configure the test renderer (optional, can customize node mocking)
configure({ createNodeMock: () => null })

// Provide a mock WebGL context for canvas elements
globalThis.HTMLCanvasElement.prototype.getContext = (contextId) => {
  if (contextId === 'webgl' || contextId === 'webgl2') {
    return createWebGLContext(1, 1) // Return a 1x1 headless GL context
  }
  // Return null or throw for other context types if needed
  return null;
};
