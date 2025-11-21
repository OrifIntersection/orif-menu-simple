import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Détecter si on est sur Replit (port 5000 obligatoire)
  // Sinon utiliser le port par défaut de Vite (5173)
  const isReplit = typeof process !== 'undefined' && process.env.REPL_ID !== undefined
  const port = isReplit ? 5000 : 5173

  return {
    plugins: [react()],
    server: {
      host: isReplit ? '0.0.0.0' : 'localhost',
      port: port,
      strictPort: isReplit, // Stricte uniquement sur Replit
      allowedHosts: true
    },
    preview: {
      host: isReplit ? '0.0.0.0' : 'localhost',
      port: port,
      strictPort: isReplit,
      allowedHosts: true
    }
  }
})
