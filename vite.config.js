import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Target modern browsers
    target: 'esnext',
    // Code splitting optimization
    rollupOptions: {
      output: {
        // Chunk size optimization
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'api': ['axios'],
          'intersection-observer': ['react-intersection-observer'],
        },
      },
    },
    // Reduce chunk size warnings limit from 500kb to 600kb
    chunkSizeWarningLimit: 600,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Minify with esbuild (faster than terser)
    minify: 'esbuild',
    // Report compressed size after build
    reportCompressedSize: true,
  },
  // Performance optimization for HMR
  server: {
    middlewareMode: false,
    // Reduce HMR latency
    hmr: {
      timeout: 30000,
    },
  },
})
