import { defineConfig } from 'vite'
import { getDirname } from '@adonisjs/core/helpers'
import inertia from '@adonisjs/inertia/client'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    inertia({ ssr: { enabled: true, entrypoint: 'app/core/ui/app/ssr.tsx' } }),
    react(),
    adonisjs({
      entrypoints: ['resources/js/app.js', 'app/core/ui/app/app.tsx'],
      reload: ['resources/views/**/*.edge'],
    }),
  ],

  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  server: {
    // On s'assure que Vite écoute sur toutes les interfaces
    host: '0.0.0.0',
    port: 5173, // Utilise un port fixe standard pour éviter les surprises
    hmr: {
      // Force la connexion HMR sur localhost
      host: 'localhost',
      protocol: 'ws', // 'wss' car tu es en HTTPS (certificats mkcert)
    },
    allowedHosts: true,
  },
  resolve: {
    alias: {
      '~/': `${getDirname(import.meta.url)}/app/core/ui/`,
      'config/ssr': `${getDirname(import.meta.url)}/config/ssr.ts`,
    },
  },
})
