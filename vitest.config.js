import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment setup
    environment: 'jsdom',
    
    // Global test setup
    globals: true,
    
    // Include test files
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/**/*.spec.js',
        'src/**/*.test.js',
      ],
    },
    
    // Test setup files
    setupFiles: ['./src/test/setup.js'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
