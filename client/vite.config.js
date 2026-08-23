import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  optimizeDeps: {
    include: ['@react-oauth/google', 'react-router-dom', 'framer-motion', 'axios', 'lucide-react']
  },
  build: {
    cssCodeSplit: true,
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
        }
      }
    }
  }
})