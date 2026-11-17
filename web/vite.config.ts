import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // PWA: manifiesto + service worker generados al compilar (npm run build).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Trazent',
        short_name: 'Trazent',
        description: 'Asistencias, tareas y evidencias de contratistas externos.',
        lang: 'es-MX',
        start_url: '/',
        display: 'standalone',
        theme_color: '#1D4ED8',
        background_color: '#FFFFFF',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    // Permite importar con "@/..." en lugar de rutas relativas largas.
    alias: { '@': '/src' },
  },
  server: { port: 5173 },
});
