import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom', // Use jsdom for Three.js compatibility
    setupFiles: './src/test/vitest.setup.js',
    clearMocks: true,
    restoreMocks: true
  },
});