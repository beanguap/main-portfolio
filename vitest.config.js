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
  test: {
    globals: true,
    environment: 'happy-dom', // Use happy-dom instead of jsdom
    setupFiles: './src/test/vitest.setup.js',
    // Replace deps.inline with deps.optimizer.web.include
    deps: {
      optimizer: {
        web: {
          include: ['vitest-webgl-canvas-mock'],
        },
      },
    },
    clearMocks: true,
    restoreMocks: true,
  },
});