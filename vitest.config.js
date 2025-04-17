import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // No three-mock alias; use real three.js
    },
  },
  // server: { // Remove or comment out the old server.deps block
  //   deps: {
  //     inline: ['vitest-webgl-canvas-mock'], 
  //   },
  // },
  test: {
    globals: true,
    environment: 'happy-dom', // Use happy-dom instead of jsdom
    setupFiles: './src/test/vitest.setup.js',
    deps: { // Add deps.inline here
      inline: ['vitest-webgl-canvas-mock'],
    },
    clearMocks: true,
    restoreMocks: true,
  },
});