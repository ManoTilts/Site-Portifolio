import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    // Split big third-party libs into their own long-term-cacheable chunks
    // instead of one large entry bundle.
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion': ['framer-motion'],
          'icons': ['lucide-react'],
        },
      },
    },
    // Surface anything that grows past a sensible budget.
    chunkSizeWarningLimit: 600,
  },
})
