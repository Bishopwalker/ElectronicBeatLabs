import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false, // Try next port if busy instead of crashing
    open: false,
    hmr: {
      port: 24678,
      overlay: false // Disable error overlay for faster HMR
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      }
    },
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/backend/**',
        '**/.git/**',
        '**/coverage/**',
        '**/dist/**',
        '**/__pycache__/**'
      ]
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material'],
    esbuildOptions: {
      target: 'esnext' // Faster builds
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild', // Faster than terser
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material']
        }
      }
    }
  }
})
