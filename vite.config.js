import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url); // Get current file path
const __dirname = path.dirname(__filename); // Get current directory path

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      // Use the derived __dirname
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [react()],
  // Include font file types to avoid incorrect MIME type issues
  assetsInclude: ['**/*.ttf', '**/*.woff', '**/*.woff2'],
});