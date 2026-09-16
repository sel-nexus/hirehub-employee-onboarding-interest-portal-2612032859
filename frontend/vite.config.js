import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Configures the Vite development server, build, and browser-like test environment. */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/testSetup.js'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    css: true,
  },
});
