import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Détecter Replit via variable d'environnement
const isReplit = typeof process !== 'undefined' && process.env && process.env.REPL_ID

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: isReplit ? '0.0.0.0' : 'localhost',
    port: isReplit ? 5000 : 5173,
    strictPort: isReplit ? true : false,
    allowedHosts: true
  },
  preview: {
    host: isReplit ? '0.0.0.0' : 'localhost',
    port: isReplit ? 5000 : 5173,
    strictPort: isReplit ? true : false,
    allowedHosts: true
  }
})
