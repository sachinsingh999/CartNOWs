import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group core react & router dependencies together
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor-core';
            }
            // Group UI animation library
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // Group icon package
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            // Other third-party utility dependencies (axios, zustand, toastify)
            return 'vendor-utils';
          }
        }
      }
    }
  }
})
