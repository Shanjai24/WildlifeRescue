import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Auth, incidents, rescuer, admin → Node backend (port 4000)
      '/auth':     { target: 'http://localhost:4000', changeOrigin: true },
      '/incidents':{ target: 'http://localhost:4000', changeOrigin: true },
      '/rescuer':  { target: 'http://localhost:4000', changeOrigin: true },
      '/admin':    { target: 'http://localhost:4000', changeOrigin: true },

      // Analytics → Node backend (port 4000)
      '/api/analytics': { target: 'http://localhost:4000', changeOrigin: true },

      // AI vision + ML routes → Flask ML API (port 5000)
      // These must come BEFORE any shorter /api match
      '/api/ai': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        // Do NOT rewrite — Flask has the full /api/ai/... routes
      },
    },
  },
})