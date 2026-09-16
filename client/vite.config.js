import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
  optimizeDeps: {
    include: ['@react-oauth/google', 'react-router-dom', 'framer-motion', 'axios', 'lucide-react']
  },
  build: {
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/react-router') ||
            id.includes('node_modules/@remix-run/router') ||
            id.includes('node_modules/scheduler') ||
            id.includes('node_modules/@react-oauth') ||
            id.includes('node_modules/zustand') ||
            id.includes('node_modules/react-toastify')
          ) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-framer-motion';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/axios') || id.includes('node_modules/socket.io-client') || id.includes('node_modules/lenis')) {
            return 'vendor-utils';
          }
        }
      }
    }
  }
})