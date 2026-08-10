import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  build: {
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Real-time WebSockets engine (only loaded for chat/coshop)
            if (id.includes('socket.io') || id.includes('engine.io')) {
              return 'vendor-socket';
            }
            // Google OAuth SDK
            if (id.includes('@react-oauth')) {
              return 'vendor-google-auth';
            }
            // UI animation library
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // Icon package
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
          }
        }
      }
    }
  }
})
