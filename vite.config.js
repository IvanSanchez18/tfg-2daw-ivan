import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Actualiza la app automáticamente si hay cambios
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'], // Archivos estáticos extra
      manifest: {
        name: 'Wrestling Universe',
        short_name: 'Wrestling',
        description: 'Gestiona tu propio mundo de lucha libre de forma dinámica y personalizable.',
        theme_color: '#000000', // Color de la barra superior del navegador (cámbialo a tu gusto)
        background_color: '#ffffff', // Color de fondo al cargar
        display: 'standalone', // Hace que se abra sin la barra de direcciones (como una app nativa)
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  base: '/tfg-2daw-ivan/',
})