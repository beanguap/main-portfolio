import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: './src/test/vitest.setup.js', // Point to the new JS setup file
    clearMocks: true, // Automatically clear mock calls between tests
    restoreMocks: true, // Automatically restore mock implementations between tests
  },
});