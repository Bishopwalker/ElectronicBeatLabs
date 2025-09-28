import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allow external connections
    port: 5173,
    strictPort: true, // Exit if port is in use
    open: false, // Don't auto-open browser
    hmr: {
      port: 24678, // Use different port for HMR to avoid conflicts
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
      // Watch for changes in these directories
      ignored: ['!**/node_modules/**', '!**/backend/**']
    }
  },
  // Enable hot reload for these file types
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material']
  }
})
